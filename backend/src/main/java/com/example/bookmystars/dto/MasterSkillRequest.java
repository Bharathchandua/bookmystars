package com.example.bookmystars.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterSkillRequest {

    @NotBlank(message = "Skill name is required")
    private String name;

    private String category;
}
