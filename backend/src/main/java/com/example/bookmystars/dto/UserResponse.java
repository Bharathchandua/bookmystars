package com.example.bookmystars.dto;

import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.Gender;
import com.example.bookmystars.model.ProfileType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Builder
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private AccountType accountType;
    private String fullName;
    private String stageName;
    private String email;
    private String mobileNumber;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String location;
    private Set<ProfileType> profileTypes;
    private String primaryProfession;
    private String referralSource;
    private Boolean termsAccepted;
}
