package com.example.bookmystars.dto;

import com.example.bookmystars.model.AvailabilityStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class AvailabilityResponse {

    private Long id;

    private Long userId;

    private LocalDate availabilityDate;

    private AvailabilityStatus status;

    private String description;

    private LocalTime startTime;

    private LocalTime endTime;
}