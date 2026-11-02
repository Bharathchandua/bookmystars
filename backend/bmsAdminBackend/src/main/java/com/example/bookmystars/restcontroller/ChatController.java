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
}
