package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewMediaRequest {

    /**
     * "APPROVED" or "REJECTED"
     */
    private String status;

    /**
     * Rejection or moderation reason (e.g. "Blurry photo", "Watermarked audio", etc.)
     */
    private String rejectionReason;
}
