package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDto {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String roleId;
    private String roleName;
    private String status;
    private String avatar;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Map<String, Object> permissions;
}
