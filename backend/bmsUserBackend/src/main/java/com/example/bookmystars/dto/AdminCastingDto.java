package com.example.bookmystars.dto;

import com.example.bookmystars.model.CastingStatus;
import com.example.bookmystars.model.ProfileType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCastingDto {

    private Long id;
    private String project;
    private String category;
    private String postType;
    private String requiredLanguages;
    private ProfileType roleType;
    private String craft;
    private String talent; // Posted by name or studio
    private String talentAvatar;
    private String postedByEmail;
    private String postedByPhone;
    private String postedByCompany;
    private String location;
    private BigDecimal budget;
    private String formattedBudget;
    private String thumb;
    private String submittedOn;
    private String priority;
    private String priorityBg;
    private String priorityColor;
    private String priorityBorder;
    private CastingStatus status;
    private long applicantCount;
    private LocalDateTime createdAt;

    // Full detail fields for review modal
    private String description;
    private String requirements;
    private LocalDate shootStartDate;
    private LocalDate shootEndDate;
    private LocalDate applicationDeadline;
    private String videoUrl;
    private String posterUrl;
    private String customCraft;
    private String age;
    private String gender;
    private String height;
    private String weight;
}
