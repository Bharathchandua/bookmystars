package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewRequest {

    private Long profileUserId;

    private Integer rating;

    private String comment;

    private String projectName;
}