package com.example.bookmystars.service;

import com.example.bookmystars.dto.RegistrationRequest;
import com.example.bookmystars.model.Profile;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.ProfileRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegistrationRequest request) {

        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        // 1. Strict cross-table unique email check (users & admin_users tables)
        if (userRepository.existsByEmailIgnoreCase(email) || adminUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("The email address '" + email + "' is already registered in the system. Each account must have a strictly unique email address.");
        }

        // 2. Strict unique mobile number check
        String mobile = request.getMobileNumber() != null ? request.getMobileNumber().trim() : "";
        if (userRepository.existsByMobileNumber(mobile)) {
            throw new IllegalArgumentException("The mobile number '" + mobile + "' is already registered in the system. Please use a unique contact number.");
        }

        // Build base user entity
        User user = User.builder()
                .accountType(request.getAccountType())
                .fullName(request.getFullName())
                .stageName(request.getStageName())
                .email(email)
                .mobileNumber(mobile)
                .password(passwordEncoder.encode(request.getPassword()))
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .location(request.getLocation())
                .referralSource(request.getReferralSource())
                .termsAccepted(request.getTermsAccepted())
                .customProfession(request.getCustomProfession())
                .primaryProfession(request.getPrimaryProfession())
                .build();

        // Assign profile types if present
        if (request.getProfileTypes() != null && !request.getProfileTypes().isEmpty()) {
            user.setProfileTypes(request.getProfileTypes());
        }

        User savedUser = userRepository.save(user);
        log.info("New User successfully registered: ID {}, Email {}, Role {}", savedUser.getId(), savedUser.getEmail(), savedUser.getAccountType());

        // Also seed initial Profile entity with languages and talent category
        try {
            Profile profile = Profile.builder()
                    .user(savedUser)
                    .languages(request.getLanguages() != null ? request.getLanguages() : "English, Hindi")
                    .talentCategory(request.getPrimaryProfession() != null ? request.getPrimaryProfession() : "Actor / Model")
                    .about("Welcome to my profile!")
                    .available(true)
                    .openForNewProjects(true)
                    .yearsExperience(0)
                    .projectsCompleted(0)
                    .brandsWorked(0)
                    .magazineFeatures(0)
                    .build();
            profileRepository.save(profile);
        } catch (Exception e) {
            log.warn("Could not seed initial profile on registration for user {}: {}", savedUser.getId(), e.getMessage());
        }

        return savedUser;
    }
}
