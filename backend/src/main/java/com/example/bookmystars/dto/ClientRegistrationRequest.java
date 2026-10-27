package com.example.bookmystars.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientRegistrationRequest {

    @NotBlank(message = "Company / Brand name is required")
    private String companyName;

    @NotBlank(message = "Industry / Sector is required")
    private String industry;

    @NotBlank(message = "Authorized contact person name is required")
    private String contactPersonName;

    @NotBlank(message = "Official corporate email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Contact phone / WhatsApp number is required")
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Operating city / HQ location is required")
    private String location;

    private String address;

    private String websiteUrl;

    private String requirements; // Ad campaign details & artist requirements
}
