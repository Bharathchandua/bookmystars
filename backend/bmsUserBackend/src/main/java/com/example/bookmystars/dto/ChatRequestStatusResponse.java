package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequestStatusResponse {
    // "NONE", "OUTGOING_PENDING", "INCOMING_PENDING", "ACCEPTED", "DECLINED", "SELF"
    private String status;
    private Long requestId;
    private String conversationKey;
    private String message;
    private Integer attemptCount;
}
