package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkExperienceResponse {

    private Long id;

    private String company;

    private String title;

    private String description;

    private String category;

    private LocalDate startDate;

    private LocalDate endDate;

    private String fileUrl;

    private String fileName;
}