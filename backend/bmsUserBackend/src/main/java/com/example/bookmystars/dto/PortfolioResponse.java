package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioResponse {

    private Long id;

    private String imageUrl;

    private String title;

    private String category;

    private String status;

    private String rejectionReason;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;
}
