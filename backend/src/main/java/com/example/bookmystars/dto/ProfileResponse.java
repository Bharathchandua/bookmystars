package com.example.bookmystars.dto;

import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.Gender;
import com.example.bookmystars.model.ProfileType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

    // User information
    private Long id;

    private AccountType accountType;

    private String fullName;

    private String stageName;

    private String email;

    private String mobileNumber;

    private LocalDate dateOfBirth;

    private Gender gender;

    private String location;

    private Set<ProfileType> profileTypes;

    private String referralSource;

    private Boolean termsAccepted;


    // Profile information
    private String profilePhoto;

    private String about;

    private String languages;

    private String actingLanguages;

    private String talentCategory;

    private String workType;

    private String dayRate;

    private Integer yearsExperience;

    private Integer projectsCompleted;

    private Integer brandsWorked;

    private Integer magazineFeatures;


    // Availability
    private Boolean available;

    private Boolean openForNewProjects;

    private LocalDate nextAvailableFrom;


    // Profile details
    private LocalDate memberSince;

    private Boolean idVerified;

    private Boolean phoneVerified;

    private Boolean emailVerified;

    private Boolean isPrivate;

    private String customProfession;

    private String primaryProfession;
    
    private Set<String> skills;
}
