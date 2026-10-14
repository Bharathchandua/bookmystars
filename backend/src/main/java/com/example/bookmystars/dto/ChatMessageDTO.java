package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private Long id;
    private Long bookingId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String messageText;
    private LocalDateTime createdAt;
}
