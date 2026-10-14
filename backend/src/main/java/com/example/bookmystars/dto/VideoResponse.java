package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoResponse {

    private Long id;

    private String title;

    private String category;

    private String videoUrl;

    private String thumbnailUrl;

    private String duration;

    private Integer year;

    private Long views;
}