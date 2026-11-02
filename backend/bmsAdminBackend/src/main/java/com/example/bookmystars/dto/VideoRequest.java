package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VideoRequest {

    private String title;

    private String category;

    private String videoUrl;

    private String thumbnailUrl;

    private String duration;

    private Integer year;
}