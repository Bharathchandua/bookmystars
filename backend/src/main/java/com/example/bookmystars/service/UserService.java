package com.example.bookmystars.service;

import com.example.bookmystars.dto.UserResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .accountType(user.getAccountType())
                .fullName(user.getFullName())
                .stageName(user.getStageName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .location(user.getLocation())
                .profileTypes(user.getProfileTypes())
                .referralSource(user.getReferralSource())
                .termsAccepted(user.getTermsAccepted())
                .build();
    }
}