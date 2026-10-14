package com.example.bookmystars.service;

import com.example.bookmystars.dto.ProfessionalDashboardStats;
import com.example.bookmystars.dto.ProfessionalProfileRequest;
import com.example.bookmystars.dto.ProfessionalProfileResponse;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.CastingApplicationRepository;
import com.example.bookmystars.repository.CastingCallRepository;
import com.example.bookmystars.repository.ProfessionalProfileRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProfessionalDashboardService {

    private final CastingCallRepository castingCallRepository;
    private final CastingApplicationRepository castingApplicationRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final UserRepository userRepository;

    public ProfessionalDashboardStats getDashboardStats(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Long userId = user.getId();

        long totalCastings = castingCallRepository.countByPostedById(userId);
        long activeCastings = castingCallRepository.countByPostedByIdAndStatus(userId, CastingStatus.OPEN);
        long totalApps = castingApplicationRepository.countByCastingCallPostedById(userId);
        long shortlisted = castingApplicationRepository.countByCastingCallPostedByIdAndStatus(userId, ApplicationStatus.SHORTLISTED);
        long hired = castingApplicationRepository.countByCastingCallPostedByIdAndStatus(userId, ApplicationStatus.HIRED);
        long totalTalents = userRepository.countByAccountType(AccountType.TALENT);

        return ProfessionalDashboardStats.builder()
                .totalCastingCalls(totalCastings)
                .activeCastingCalls(activeCastings)
                .totalApplicationsReceived(totalApps)
                .shortlistedCandidates(shortlisted)
                .hiredCandidates(hired)
                .totalTalentsAvailable(totalTalents)
                .build();
    }

    public ProfessionalProfileResponse getProfile(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        ProfessionalProfile profile = professionalProfileRepository.findByUser(user)
                .orElseGet(() -> ProfessionalProfile.builder()
                        .user(user)
                        .companyName(user.getFullName() + " Productions")
                        .companyType("Production House")
                        .businessEmail(user.getEmail())
                        .contactPhone(user.getMobileNumber())
                        .officeAddress(user.getLocation())
                        .build());

        return mapToResponse(profile);
    }

    public ProfessionalProfileResponse updateProfile(Authentication authentication, ProfessionalProfileRequest request) {
        User user = getAuthenticatedUser(authentication);

        ProfessionalProfile profile = professionalProfileRepository.findByUser(user)
                .orElseGet(() -> ProfessionalProfile.builder().user(user).build());

        profile.setCompanyName(request.getCompanyName());
        profile.setCompanyType(request.getCompanyType());
        profile.setWebsite(request.getWebsite());
        profile.setAbout(request.getAbout());
        profile.setLogoUrl(request.getLogoUrl());
        profile.setOfficeAddress(request.getOfficeAddress());
        profile.setContactPhone(request.getContactPhone());
        profile.setBusinessEmail(request.getBusinessEmail());

        ProfessionalProfile saved = professionalProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private ProfessionalProfileResponse mapToResponse(ProfessionalProfile p) {
        return ProfessionalProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .companyName(p.getCompanyName())
                .companyType(p.getCompanyType())
                .website(p.getWebsite())
                .about(p.getAbout())
                .logoUrl(p.getLogoUrl())
                .officeAddress(p.getOfficeAddress())
                .contactPhone(p.getContactPhone())
                .businessEmail(p.getBusinessEmail())
                .isVerified(p.getIsVerified())
                .build();
    }
}
