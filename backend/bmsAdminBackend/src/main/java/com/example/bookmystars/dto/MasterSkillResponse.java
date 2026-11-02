package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterSkillResponse {

    private Long id;
    private String name;
    private String category;
    private Boolean isActive;
    private long usageCount;
    private LocalDateTime createdAt;
}
