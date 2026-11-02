package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminOverviewMetricsDto {

    private long pendingCastings;
    private long openCastings;
    private long totalCastings;
    private long totalTalents;
    private long totalProfessionals;
    private long kycBadgesPending;
    private long verifiedTalents;
    private long mediaQueueCount;
    private String escrowLockedAmount;
    private int securityHealthPercent;
}
