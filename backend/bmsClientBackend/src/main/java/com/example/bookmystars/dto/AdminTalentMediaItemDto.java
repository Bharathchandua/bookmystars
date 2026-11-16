package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminTalentMediaItemDto {

    private Long id;
    private Long userId;
    private String talentName;
    private String talentEmail;
    private String talentStageName;
    private String talentAvatar;
    private String craft;
    private Boolean isUserApproved; // whether talent has verified star badge

    private String mediaType; // "PHOTO", "VIDEO", "AUDIO"
    private String title;
    private String category;
    private String mediaUrl;
    private String thumbnailUrl;
    private String duration;
    private String format;
    private String sizeStr;

    private String status; // "PENDING", "APPROVED", "REJECTED"
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
