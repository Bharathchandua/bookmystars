package com.example.bookmystars.service;

import com.example.bookmystars.dto.LoginRequest;
import com.example.bookmystars.dto.LoginResponse;
import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.Profile;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.ProfileRepository;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {

        // 1. Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        // 2. Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new BadCredentialsException("Invalid email or password");
        }

        // 2b. Partner & Client Verification Gatekeeper: must be approved by Super Admin before login
        if (user.getAccountType() == AccountType.PARTNER || user.getAccountType() == AccountType.CLIENT) {
            String roleName = user.getAccountType() == AccountType.CLIENT ? "Client Brand" : "Partner Academy";
            if ("REJECTED".equalsIgnoreCase(user.getVerificationStatus())) {
                String reason = user.getRejectionReason() != null ? user.getRejectionReason() : "Application does not meet platform criteria";
                throw new BadCredentialsException(roleName + " registration was rejected by Super Admin. Reason: " + reason);
            }
            if (Boolean.FALSE.equals(user.getIsApproved()) || "PENDING".equalsIgnoreCase(user.getVerificationStatus())) {
                throw new BadCredentialsException("Your " + roleName + " account is pending Super Admin verification. You will be able to log in once your company details and requirements are approved.");
            }
        }

        // 3. Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        // 4. Retrieve profile photo if present
        String profilePhoto = profileRepository.findByUser(user)
                .map(Profile::getProfilePhoto)
                .orElse(null);

        // 5. Return login response
        return LoginResponse.builder()
                .message("Login successful")
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .profilePhoto(profilePhoto)
                .accountType(user.getAccountType() != null ? user.getAccountType().name() : "TALENT")
                .customProfession(user.getCustomProfession())
                .build();
    }
}
