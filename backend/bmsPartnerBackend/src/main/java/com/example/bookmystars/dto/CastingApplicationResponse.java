package com.example.bookmystars.dto;

import com.example.bookmystars.model.ApplicationStatus;
import com.example.bookmystars.model.ProfileType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CastingApplicationResponse {

    private Long id;
    private Long castingCallId;
    private String castingCallTitle;
    private Long applicantId;
    private String applicantName;
    private String applicantPhoto;
    private String applicantLocation;
    private Set<ProfileType> applicantProfileTypes;
    private String applicantDayRate;
    private ApplicationStatus status;
    private String coverNote;
    private BigDecimal proposedRate;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
