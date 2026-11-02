package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRoleDto {
    private String id;
    private String name;
    private String description;
    private String color;
    private Boolean isSystem;
    private Integer userCount;
    private Map<String, Object> permissions;
}
