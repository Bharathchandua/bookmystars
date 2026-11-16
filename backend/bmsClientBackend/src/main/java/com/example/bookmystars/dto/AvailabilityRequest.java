package com.example.bookmystars.dto;

import com.example.bookmystars.model.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AvailabilityRequest {

    @NotNull(message = "Availability date is required")
    private LocalDate availabilityDate;

    @NotNull(message = "Availability status is required")
    private AvailabilityStatus status;

    private String description;

    private LocalTime startTime;

    private LocalTime endTime;
}