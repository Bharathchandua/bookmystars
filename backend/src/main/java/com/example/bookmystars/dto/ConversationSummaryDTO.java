package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationSummaryDTO {
    private String id; // e.g. "book-1", "user-2", "opp-5-2"
    private String conversationKey;
    private Long targetUserId;
    private String name;
    private String role;
    private String company;
    private String avatar;
    private String email;
    private String phone;
    private String lastMsg;
    private LocalDateTime lastMsgTime;
    private int unreadCount;
    private Long bookingId;
    private Long opportunityId;
    private Object bookingRequest;
    private Object accessRequest;
}
