package com.example.bookmystars.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterProfessionRequest {

    @NotBlank(message = "Profession name cannot be empty")
    private String name;

    private String craftCategory;
}
