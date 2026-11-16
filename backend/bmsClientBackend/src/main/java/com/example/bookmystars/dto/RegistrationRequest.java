package com.example.bookmystars.dto;

import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.Gender;
import com.example.bookmystars.model.ProfileType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationRequest {

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String stageName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must contain at least 8 characters")
    private String password;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    @NotNull(message = "Gender is required")
    private Gender gender;

    @NotBlank(message = "Location is required")
    private String location;

    @NotEmpty(message = "At least one profile type is required")
    private Set<ProfileType> profileTypes;

    private String referralSource;

    @NotNull(message = "Terms acceptance is required")
    private Boolean termsAccepted;

    private String customProfession;

    private String primaryProfession;

    private String languages;

    private String actingLanguages;

    private String talentCategory;
}
