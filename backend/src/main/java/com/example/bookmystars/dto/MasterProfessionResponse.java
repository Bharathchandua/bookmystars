package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterProfessionResponse {

    private Long id;
    private String name;
    private String craftCategory;
    private Boolean isActive;
    private long userCount;
    private LocalDateTime createdAt;
}
