package com.example.bookmystars.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String category;

    private String fileUrl;

    private String format;
}
