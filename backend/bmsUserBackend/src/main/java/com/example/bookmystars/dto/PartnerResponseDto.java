package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerResponseDto {
    private Long id;
    private String businessName;
    private String category;
    private String contactPersonName;
    private String email;
    private String mobileNumber;
    private String location;
    private String address;
    private String websiteUrl;
    private String requirements;
    private Boolean isApproved;
    private String verificationStatus; // PENDING, APPROVED, REJECTED
    private String rejectionReason;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
}
