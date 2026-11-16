package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowcaseItemDto {

    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String companyName;
    private String logoUrl;
    private String entityType; // "CLIENT" or "PARTNER"
    private String title;
    private String description;
    private String mediaType; // "PHOTO" or "VIDEO"
    private String mediaUrl;
    private String thumbnailUrl;
    private String status; // "PENDING", "APPROVED", "REJECTED"
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
