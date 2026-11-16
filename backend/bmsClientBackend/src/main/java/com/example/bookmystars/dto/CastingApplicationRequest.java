package com.example.bookmystars.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CastingApplicationRequest {

    @NotNull(message = "Casting call ID is required")
    private Long castingCallId;

    private String coverNote;

    private BigDecimal proposedRate;
}
