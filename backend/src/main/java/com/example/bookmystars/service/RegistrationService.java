package com.example.bookmystars.service;

import com.example.bookmystars.dto.RegistrationRequest;
import com.example.bookmystars.model.Profile;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.ProfileRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegistrationRequest request) {

        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

        // Check duplicate email across ALL tables (users and admin_users)
        if (userRepository.existsByEmailIgnoreCase(email) || adminUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("The email address '" + email + "' is already registered in the system. Each account must have a strictly unique email.");
        }

        // Check duplicate mobile number
        if (userRepository.existsByMobileNumber(request.getMobileNumber().trim())) {
            throw new IllegalArgumentException("Mobile number '" + request.getMobileNumber() + "' is already registered. Please use a unique contact number.");
        }

        // Terms must be accepted
        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            throw new IllegalArgumentException("You must accept the terms and conditions");
        }

        // Create User entity
        User user = User.builder()
                .accountType(request.getAccountType())
                .fullName(request.getFullName())
                .stageName(request.getStageName())
                .email(email)
                .mobileNumber(request.getMobileNumber().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .location(request.getLocation())
                .profileTypes(request.getProfileTypes())
                .referralSource(request.getReferralSource())
                .termsAccepted(request.getTermsAccepted())
                .customProfession(request.getPrimaryProfession() != null && !request.getPrimaryProfession().trim().isEmpty() ? request.getPrimaryProfession().trim() : (request.getCustomProfession() != null ? request.getCustomProfession().trim() : null))
                .primaryProfession(request.getPrimaryProfession() != null && !request.getPrimaryProfession().trim().isEmpty() ? request.getPrimaryProfession().trim() : (request.getCustomProfession() != null ? request.getCustomProfession().trim() : null))
                .build();

        User savedUser = userRepository.save(user);

        // Also seed initial Profile entity with languages and talent category
        try {
            Profile profile = Profile.builder()
                    .user(savedUser)
                    .languages(request.getLanguages())
                    .actingLanguages(request.getActingLanguages())
                    .talentCategory(request.getTalentCategory() != null && !request.getTalentCategory().trim().isEmpty()
                            ? request.getTalentCategory().trim().toUpperCase()
                            : "ACTING")
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
            System.err.println("Warning: could not seed initial profile on registration: " + e.getMessage());
        }

        return savedUser;
    }
}
