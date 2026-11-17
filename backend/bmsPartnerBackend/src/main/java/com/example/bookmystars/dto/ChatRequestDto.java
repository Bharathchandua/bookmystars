package com.example.bookmystars.dto;

import com.example.bookmystars.model.ChatRequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequestDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String senderAvatar;
    private String senderEmail;
    private String senderCraft;

    private Long recipientId;
    private String recipientName;
    private String recipientRole;
    private String recipientAvatar;
    private String recipientEmail;

    private ChatRequestStatus status;
    private String message;
    private String conversationKey;
    private Integer attemptCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
