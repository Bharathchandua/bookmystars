package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.ChatMessageDTO;
import com.example.bookmystars.dto.ChatRequestDto;
import com.example.bookmystars.dto.ChatRequestStatusResponse;
import com.example.bookmystars.dto.ConversationSummaryDTO;
import com.example.bookmystars.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/my-conversations")
    public ResponseEntity<List<ConversationSummaryDTO>> getMyConversations(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getMyConversations(email));
    }

    @GetMapping("/thread/{threadKey}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getThreadMessages(@PathVariable String threadKey) {
        return ResponseEntity.ok(chatService.getMessagesForThread(threadKey));
    }

    @PostMapping("/thread/{threadKey}/messages")
    public ResponseEntity<ChatMessageDTO> sendThreadMessage(
            @PathVariable String threadKey,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        String email = authentication.getName();
        String text = (String) body.getOrDefault("messageText", body.getOrDefault("text", ""));
        String mediaUrl = (String) body.getOrDefault("mediaUrl", null);
        String mediaType = (String) body.getOrDefault("mediaType", null);
        String fileName = (String) body.getOrDefault("fileName", null);
        Long fileSize = null;
        if (body.get("fileSize") != null) {
            try {
                fileSize = Long.valueOf(body.get("fileSize").toString());
            } catch (Exception ignored) {}
        }

        if ((text == null || text.trim().isEmpty()) && (mediaUrl == null || mediaUrl.trim().isEmpty())) {
            return ResponseEntity.badRequest().build();
        }

        Long bookingId = null;
        if (body.get("bookingId") != null) {
            try {
                bookingId = Long.valueOf(body.get("bookingId").toString());
            } catch (Exception ignored) {}
        }

        Long recipientId = null;
        if (body.get("recipientId") != null) {
            try {
                recipientId = Long.valueOf(body.get("recipientId").toString());
            } catch (Exception ignored) {}
        }

        Long opportunityId = null;
        if (body.get("opportunityId") != null) {
            try {
                opportunityId = Long.valueOf(body.get("opportunityId").toString());
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(chatService.sendMessageForThread(
                threadKey,
                bookingId,
                recipientId,
                opportunityId,
                email,
                text != null ? text.trim() : "",
                mediaUrl,
                mediaType,
                fileName,
                fileSize
        ));
    }

    @PostMapping(value = "/thread/{threadKey}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatMessageDTO> uploadThreadMedia(
            @PathVariable String threadKey,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "bookingId", required = false) Long bookingId,
            @RequestParam(value = "recipientId", required = false) Long recipientId,
            @RequestParam(value = "opportunityId", required = false) Long opportunityId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.uploadChatMedia(
                threadKey,
                bookingId,
                recipientId,
                opportunityId,
                email,
                file,
                caption
        ));
    }

    @GetMapping("/{bookingId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(@PathVariable Long bookingId) {
        return ResponseEntity.ok(chatService.getMessagesForBooking(bookingId));
    }

    @PostMapping("/{bookingId}/messages")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String email = authentication.getName();
        String text = body.getOrDefault("messageText", body.getOrDefault("text", ""));
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(chatService.sendMessage(bookingId, email, text.trim()));
    }

    // =========================================================================
    // CHAT CONNECTION REQUEST ENDPOINTS
    // =========================================================================

    @PostMapping("/request/send")
    public ResponseEntity<ChatRequestDto> sendChatRequest(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Long recipientId = null;
        if (body.get("recipientId") != null) {
            try {
                recipientId = Long.valueOf(body.get("recipientId").toString());
            } catch (Exception ignored) {}
        }
        if (recipientId == null) {
            return ResponseEntity.badRequest().build();
        }
        String message = (String) body.getOrDefault("message", "");
        return ResponseEntity.ok(chatService.sendChatRequest(email, recipientId, message));
    }

    @PostMapping("/request/{requestId}/respond")
    public ResponseEntity<ChatRequestDto> respondToChatRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        String email = authentication.getName();
        boolean accept = true;
        if (body.get("accept") != null) {
            accept = Boolean.parseBoolean(body.get("accept").toString());
        } else if (body.get("status") != null) {
            accept = "ACCEPTED".equalsIgnoreCase(body.get("status").toString());
        }
        return ResponseEntity.ok(chatService.respondToChatRequest(email, requestId, accept));
    }

    @GetMapping("/request/status/{targetUserId}")
    public ResponseEntity<ChatRequestStatusResponse> getChatRequestStatus(
            @PathVariable Long targetUserId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getChatRequestStatus(email, targetUserId));
    }

    @GetMapping("/requests/incoming")
    public ResponseEntity<List<ChatRequestDto>> getIncomingChatRequests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getIncomingChatRequests(email));
    }

    @GetMapping("/requests/outgoing")
    public ResponseEntity<List<ChatRequestDto>> getOutgoingChatRequests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getOutgoingChatRequests(email));
    }

    @PostMapping("/request/{requestId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelChatRequest(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.cancelChatRequest(email, requestId));
    }

    @PostMapping("/connection/{targetUserId}/disconnect")
    public ResponseEntity<Map<String, Object>> disconnectChat(
            @PathVariable Long targetUserId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.disconnectChat(email, targetUserId));
    }

    @PostMapping("/user/{targetUserId}/block")
    public ResponseEntity<Map<String, Object>> blockUser(
            @PathVariable Long targetUserId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.blockUser(email, targetUserId));
    }

    @PostMapping("/user/{targetUserId}/unblock")
    public ResponseEntity<Map<String, Object>> unblockUser(
            @PathVariable Long targetUserId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.unblockUser(email, targetUserId));
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable Long messageId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.deleteMessage(messageId, email));
    }

    // =========================================================================
    // REAL-TIME PRESENCE & TYPING ENDPOINTS
    // =========================================================================

    @PostMapping("/presence/heartbeat")
    public ResponseEntity<Map<String, Object>> recordHeartbeat(Authentication authentication) {
        String email = authentication.getName();
        chatService.recordHeartbeat(email);
        return ResponseEntity.ok(Map.of("status", "ONLINE", "timestamp", System.currentTimeMillis()));
    }

    @PostMapping("/presence/offline")
    public ResponseEntity<Map<String, Object>> recordOffline(Authentication authentication) {
        String email = authentication.getName();
        chatService.recordOffline(email);
        return ResponseEntity.ok(Map.of("status", "OFFLINE"));
    }

    @GetMapping("/presence/status/{targetUserId}")
    public ResponseEntity<Map<String, Object>> getUserPresence(@PathVariable Long targetUserId) {
        boolean online = chatService.isUserOnline(targetUserId);
        return ResponseEntity.ok(Map.of("userId", targetUserId, "isOnline", online));
    }

    @PostMapping("/presence/batch-status")
    public ResponseEntity<Map<Long, Boolean>> getBatchUserPresence(@RequestBody List<Long> userIds) {
        return ResponseEntity.ok(chatService.getBatchUserOnlineStatus(userIds));
    }

    @PostMapping("/thread/{threadKey}/typing")
    public ResponseEntity<Map<String, Object>> setTypingStatus(
            @PathVariable String threadKey,
            @RequestParam(defaultValue = "true") boolean isTyping,
            Authentication authentication
    ) {
        String email = authentication.getName();
        chatService.setTypingStatus(email, threadKey, isTyping);
        return ResponseEntity.ok(Map.of("success", true, "isTyping", isTyping));
    }

    @GetMapping("/thread/{threadKey}/typing")
    public ResponseEntity<Map<String, Object>> getThreadTypingStatus(
            @PathVariable String threadKey,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getThreadTypingStatus(email, threadKey));
    }
}
