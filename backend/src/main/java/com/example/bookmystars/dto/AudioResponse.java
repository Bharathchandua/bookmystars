package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AudioResponse {

    private Long id;

    private String title;

    private String category;

    private String audioUrl;

    private String format;

    private String duration;

    private String sizeStr;

    private LocalDateTime createdAt;
}
