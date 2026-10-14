package com.example.bookmystars.service;

import com.example.bookmystars.dto.ChatMessageDTO;
import com.example.bookmystars.model.ChatMessage;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.ChatMessageRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessagesForBooking(Long bookingId) {
        return chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDTO sendMessage(Long bookingId, String userEmail, String text) {
        User sender = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        ChatMessage msg = ChatMessage.builder()
                .bookingId(bookingId)
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .senderRole(sender.getAccountType() != null ? sender.getAccountType().name() : "USER")
                .messageText(text)
                .createdAt(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(msg);
        return toDTO(saved);
    }

    private ChatMessageDTO toDTO(ChatMessage m) {
        return ChatMessageDTO.builder()
                .id(m.getId())
                .bookingId(m.getBookingId())
                .senderId(m.getSenderId())
                .senderName(m.getSenderName())
                .senderRole(m.getSenderRole())
                .messageText(m.getMessageText())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
