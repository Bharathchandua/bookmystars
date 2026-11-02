package com.example.bookmystars.dto;

import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Company or production banner is required")
    private String company;

    @NotBlank(message = "Project or role title is required")
    private String title;
    private String description;
    private String category;
    private String startDate;
    private String endDate;
    private String fileUrl;
    private String fileName;
}