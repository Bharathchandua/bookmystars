package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicProfileResponse {

    private ProfileResponse profile;
    private List<PortfolioResponse> portfolio;
    private List<VideoResponse> videos;
    private List<WorkExperienceResponse> workExperiences;
    private MeasurementResponse measurements;
    private List<AudioResponse> audios;
    private List<DocumentResponse> documents;

    // Instagram-style Privacy Fields
    private Boolean isPrivate;
    private String accessStatus; // "PUBLIC", "APPROVED", "PENDING", "REJECTED", "LOCKED"
}
