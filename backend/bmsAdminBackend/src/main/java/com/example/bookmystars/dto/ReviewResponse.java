package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {

    private Long id;

    private String reviewerName;

    private String reviewerRole;

    private Integer rating;

    private String comment;

    private String projectName;

    private LocalDateTime createdAt;
}