package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.ChatMessageDTO;
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
