package com.example.bookmystars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LoginResponse {

    private String message;
    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private String profilePhoto;
    private String accountType;
    private String customProfession;
}