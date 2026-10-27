package com.example.bookmystars.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAdminStaffRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid corporate email address")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String department;

    @NotBlank(message = "Role is required")
    private String roleId;

    private String avatar;
}
