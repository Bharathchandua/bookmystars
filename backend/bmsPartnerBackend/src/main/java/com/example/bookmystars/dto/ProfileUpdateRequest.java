package com.example.bookmystars.dto;

import com.example.bookmystars.model.ProfileType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileUpdateRequest {

    private String fullName;

    private String stageName;

    private String location;

    private String about;

    private String languages;

    private String actingLanguages;

    private String talentCategory;

    private String workType;

    private String dayRate;

    private String profilePhoto;

    private Integer yearsExperience;

    private Integer projectsCompleted;

    private Integer brandsWorked;

    private Integer magazineFeatures;

    private Set<ProfileType> profileTypes;

    private Boolean isPrivate;

    private String customProfession;
    
    private Set<String> skills;
}
