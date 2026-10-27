package com.example.bookmystars.dto;

import com.example.bookmystars.model.ProfileType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TalentSummaryResponse {

    private Long userId;
    private String fullName;
    private String stageName;
    private String email;
    private String profilePhoto;
    private Set<ProfileType> profileTypes;
    private String customProfession;
    private String primaryProfession;
    private String location;
    private String dayRate;
    private Integer yearsExperience;
    private String workType;
    private String about;
    private Boolean isPrivate;

    private LocalDate nextAvailableDate;
    private List<AvailabilityResponse> upcomingSlots;
}
