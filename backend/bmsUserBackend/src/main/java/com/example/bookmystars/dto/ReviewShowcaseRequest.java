package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewShowcaseRequest {
    private String status; // "APPROVED" or "REJECTED"
    private String reason;
}
