package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminTalentKycDto {

    private Long id;
    private Long userId;
    private String talent; // full name
    private String accountType; // TALENT | PROFESSIONAL | CLIENT
    private String email;
    private String phone;
    private String craft;
    private String primaryProfession;
    private List<String> profileTypes;
    private String avatar;
    private String location;
    private String submittedOn;
    private String docType;
    private String docNumber;
    private Boolean idVerified;
    private Boolean phoneVerified;
    private Boolean emailVerified;
    private String status; // VERIFIED | PENDING
    private String statusBg;
    private String statusColor;
    private String statusBorder;
    private LocalDate memberSince;
    private String stageName;
    private String bio;
    private String gender;
    private LocalDate dateOfBirth;
    private Integer yearsExperience;
    private java.util.Set<String> skills;
    private Boolean isPrivate;
    private String languages;
    private String actingLanguages;
    private String talentCategory;
    private String workType;
}
