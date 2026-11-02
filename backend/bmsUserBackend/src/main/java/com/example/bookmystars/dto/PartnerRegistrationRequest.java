package com.example.bookmystars.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerRegistrationRequest {

    @NotBlank(message = "Academy / Business name is required")
    private String businessName;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Contact person name is required")
    private String contactPersonName;

    @NotBlank(message = "Official email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "Contact mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "City / Location is required")
    private String location;

    private String address;

    private String websiteUrl;

    private String requirements;
}
