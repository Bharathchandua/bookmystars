package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionalDashboardStats {

    private long totalCastingCalls;
    private long activeCastingCalls;
    private long totalApplicationsReceived;
    private long shortlistedCandidates;
    private long hiredCandidates;
    private long totalTalentsAvailable;
}
