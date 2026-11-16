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
public class CastingCallResponse {

    private Long id;
    private Long postedByUserId;
    private String postedByUserName;
    private String companyName;
    private String title;
    private String projectType;
    private String postType;
    private String requiredLanguages;
    private ProfileType roleType;
    private String description;
    private String requirements;
    private String location;
    private BigDecimal budget;
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
    private CastingStatus status;
    private long applicantCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
