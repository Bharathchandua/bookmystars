package com.example.bookmystars.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShowcaseRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Media type is required (PHOTO or VIDEO)")
    private String mediaType; // "PHOTO" or "VIDEO"

    @NotBlank(message = "Media URL is required")
    private String mediaUrl;

    private String thumbnailUrl;
}
