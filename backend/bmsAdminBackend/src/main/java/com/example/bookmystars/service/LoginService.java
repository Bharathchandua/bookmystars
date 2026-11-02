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

        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        // 1. Find user by email (if not yet registered -> Invalid email or password)
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        // 2. Portal / Workspace Role Gatekeeper:
        // Enforce that Partners only log in at Partner Portal, Clients at Client Portal, and Talents at Talent Portal
        if (request.getPortal() != null && !request.getPortal().trim().isEmpty()) {
            String portal = request.getPortal().trim().toUpperCase();
            AccountType userType = user.getAccountType();

            if ("PARTNER".equals(portal) && userType != AccountType.PARTNER) {
                String target = (userType == AccountType.CLIENT) ? "Client Brand portal" : "Talent / Professional portal";
                String roleName = (userType == AccountType.CLIENT) ? "Client Brand" : "Talent/Professional";
                throw new BadCredentialsException("This account is registered as " + roleName + ". Please use the " + target + " to sign in.");
            } else if ("CLIENT".equals(portal) && userType != AccountType.CLIENT) {
                String target = (userType == AccountType.PARTNER) ? "Partner Academy portal" : "Talent / Professional portal";
                String roleName = (userType == AccountType.PARTNER) ? "Partner Academy" : "Talent/Professional";
                throw new BadCredentialsException("This account is registered as " + roleName + ". Please use the " + target + " to sign in.");
            } else if (("TALENT".equals(portal) || "USER".equals(portal) || "PROFESSIONAL".equals(portal)) && (userType == AccountType.PARTNER || userType == AccountType.CLIENT)) {
                String target = (userType == AccountType.PARTNER) ? "Partner Academy portal" : "Client Brand portal";
                String roleName = (userType == AccountType.PARTNER) ? "Partner Academy" : "Client Brand";
                throw new BadCredentialsException("This account is registered as " + roleName + ". Please use the " + target + " to sign in.");
            }
        }

        // 3. Partner & Client Verification Gatekeeper:
        // If they registered and are waiting for Super Admin approval, notify them directly!
        if (user.getAccountType() == AccountType.PARTNER || user.getAccountType() == AccountType.CLIENT) {
            String roleName = user.getAccountType() == AccountType.CLIENT ? "Client Brand" : "Partner Academy";
            if ("REJECTED".equalsIgnoreCase(user.getVerificationStatus())) {
                String reason = user.getRejectionReason() != null ? user.getRejectionReason() : "Application does not meet platform criteria";
                throw new BadCredentialsException("Your " + roleName + " account has not been approved. Reason: " + reason);
            }
            if (Boolean.FALSE.equals(user.getIsApproved()) || "PENDING".equalsIgnoreCase(user.getVerificationStatus())) {
                throw new BadCredentialsException("Your account has not been approved yet. You will be able to log in once your application is approved.");
            }
        }

        // 4. Check password (only for approved or regular accounts)
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new BadCredentialsException("Invalid email or password");
        }

        // 5. Generate JWT
        String token = jwtService.generateToken(user.getEmail());

        // 6. Retrieve profile photo if present
        String profilePhoto = profileRepository.findByUser(user)
                .map(Profile::getProfilePhoto)
                .orElse(null);

        // 7. Return login response
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
