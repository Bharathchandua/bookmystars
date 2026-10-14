package com.example.bookmystars.dto;

import com.example.bookmystars.model.CastingStatus;
import com.example.bookmystars.model.ProfileType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CastingCallRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String projectType;

    @NotNull(message = "Role type is required")
    private ProfileType roleType;

    private String description;

    private String requirements;

    private String location;

    private BigDecimal budget;

    private LocalDate shootStartDate;

    private LocalDate shootEndDate;

    private LocalDate applicationDeadline;

    private CastingStatus status;
}
