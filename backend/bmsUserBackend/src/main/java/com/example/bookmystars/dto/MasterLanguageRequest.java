package com.example.bookmystars.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterLanguageRequest {

    @NotBlank(message = "Language name is required")
    private String name;

    private String nativeName;
    private String code;
}
