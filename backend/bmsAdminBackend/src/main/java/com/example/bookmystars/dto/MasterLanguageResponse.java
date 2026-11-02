package com.example.bookmystars.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterLanguageResponse {

    private Long id;
    private String name;
    private String nativeName;
    private String code;
    private Boolean isActive;
    private long talentCount;
    private LocalDateTime createdAt;
}
