package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.LoginRequest;
import com.example.bookmystars.dto.LoginResponse;
import com.example.bookmystars.dto.RegistrationRequest;
import com.example.bookmystars.dto.RegistrationResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.service.LoginService;
import com.example.bookmystars.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, and JWT authentication")
public class AuthController {

    private final RegistrationService registrationService;
    private final LoginService loginService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user (Professional or Talent)")
    public ResponseEntity<RegistrationResponse> register(
            @Valid @RequestBody RegistrationRequest request) {

        User registeredUser = registrationService.register(request);

        RegistrationResponse response = RegistrationResponse.builder()
                .id(registeredUser.getId())
                .accountType(registeredUser.getAccountType())
                .fullName(registeredUser.getFullName())
                .stageName(registeredUser.getStageName())
                .email(registeredUser.getEmail())
                .mobileNumber(registeredUser.getMobileNumber())
                .dateOfBirth(registeredUser.getDateOfBirth())
                .gender(registeredUser.getGender())
                .location(registeredUser.getLocation())
                .profileTypes(registeredUser.getProfileTypes())
                .referralSource(registeredUser.getReferralSource())
                .termsAccepted(registeredUser.getTermsAccepted())
                .customProfession(registeredUser.getCustomProfession())
                .primaryProfession(registeredUser.getPrimaryProfession())
                .build();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT access token")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        try {
            LoginResponse response = loginService.login(request);
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("message", "Invalid email or password"));
        }
    }
}
