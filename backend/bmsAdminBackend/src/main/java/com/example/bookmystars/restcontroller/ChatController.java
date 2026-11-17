package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.ChatMessageDTO;
import com.example.bookmystars.dto.ConversationSummaryDTO;
import com.example.bookmystars.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
        if (text == null || text.trim().isEmpty()) {
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

        return ResponseEntity.ok(chatService.sendMessageForThread(threadKey, bookingId, recipientId, opportunityId, email, text.trim()));
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
