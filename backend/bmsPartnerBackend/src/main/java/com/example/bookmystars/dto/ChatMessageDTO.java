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
    private Long recipientId;
    private String recipientName;
    private Long opportunityId;
    private String conversationKey;
    private String messageText;
    private String mediaUrl;
    private String mediaType;
    private String fileName;
    private Long fileSize;
    private LocalDateTime createdAt;
}
