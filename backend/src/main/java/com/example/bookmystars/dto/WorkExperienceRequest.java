package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkExperienceRequest {

    private String company;
    private String title;
    private String description;
    private String category;
    private String startDate;
    private String endDate;
    private String fileUrl;
    private String fileName;
}