package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequestStatusResponse {
    // "NONE", "OUTGOING_PENDING", "INCOMING_PENDING", "ACCEPTED", "DECLINED", "SELF", "BLOCKED", "BLOCKED_BY_ME"
    private String status;
    private Long requestId;
    private String conversationKey;
    private String message;
    private Integer attemptCount;
}
