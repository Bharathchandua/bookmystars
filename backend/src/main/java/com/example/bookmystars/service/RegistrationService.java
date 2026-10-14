package com.example.bookmystars.service;

import com.example.bookmystars.dto.RegistrationRequest;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegistrationRequest request) {

        // Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // Check duplicate mobile number
        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            throw new RuntimeException("Mobile number is already registered");
        }

        // Terms must be accepted
        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            throw new RuntimeException("You must accept the terms and conditions");
        }

        // Create User entity
        User user = User.builder()
                .accountType(request.getAccountType())
                .fullName(request.getFullName())
                .stageName(request.getStageName())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .location(request.getLocation())
                .profileTypes(request.getProfileTypes())
                .referralSource(request.getReferralSource())
                .termsAccepted(request.getTermsAccepted())
                .customProfession(request.getCustomProfession() != null ? request.getCustomProfession().trim() : null)
                .build();

        return userRepository.save(user);
    }
}