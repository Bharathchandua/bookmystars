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
public class MasterCraftResponse {

    private Long id;
    private String name;
    private String description;
    private Boolean isActive;
    private long skillCount;
    private LocalDateTime createdAt;
}
