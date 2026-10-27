package com.example.bookmystars.service;

import com.example.bookmystars.dto.CastingApplicationRequest;
import com.example.bookmystars.dto.CastingApplicationResponse;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.CastingApplicationRepository;
import com.example.bookmystars.repository.CastingCallRepository;
import com.example.bookmystars.repository.ProfileRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CastingApplicationService {

    private final CastingApplicationRepository castingApplicationRepository;
    private final CastingCallRepository castingCallRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public CastingApplicationResponse applyForCastingCall(Authentication authentication, CastingApplicationRequest request) {
        User applicant = getAuthenticatedUser(authentication);

        CastingCall castingCall = castingCallRepository.findById(request.getCastingCallId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found"));

        if (castingCall.getStatus() != CastingStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Casting call is not accepting applications");
        }

        if (castingApplicationRepository.existsByCastingCallIdAndApplicantId(castingCall.getId(), applicant.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already applied for this casting call");
        }

        CastingApplication application = CastingApplication.builder()
                .castingCall(castingCall)
                .applicant(applicant)
                .status(ApplicationStatus.APPLIED)
                .coverNote(request.getCoverNote())
                .proposedRate(request.getProposedRate())
                .build();

        CastingApplication saved = castingApplicationRepository.save(application);
        return mapToResponse(saved);
    }

    public List<CastingApplicationResponse> getApplicantsForCastingCall(Authentication authentication, Long castingCallId) {
        User professional = getAuthenticatedUser(authentication);

        CastingCall castingCall = castingCallRepository.findById(castingCallId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found"));

        // Ensure only the professional who posted the casting call can view applicants
        if (!castingCall.getPostedBy().getId().equals(professional.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view applicants for your own casting calls");
        }

        return castingApplicationRepository.findByCastingCallIdOrderByAppliedAtDesc(castingCallId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CastingApplicationResponse> getMyApplications(Authentication authentication) {
        User applicant = getAuthenticatedUser(authentication);
        return castingApplicationRepository.findByApplicantIdOrderByAppliedAtDesc(applicant.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CastingApplicationResponse> getReceivedApplications(Authentication authentication) {
        User professional = getAuthenticatedUser(authentication);
        return castingApplicationRepository.findByCastingCallPostedByIdOrderByAppliedAtDesc(professional.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CastingApplicationResponse updateApplicationStatus(Authentication authentication, Long applicationId, ApplicationStatus status) {
        User professional = getAuthenticatedUser(authentication);

        CastingApplication application = castingApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        if (!application.getCastingCall().getPostedBy().getId().equals(professional.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only change status for your own casting calls");
        }

        application.setStatus(status);
        CastingApplication updated = castingApplicationRepository.save(application);
        return mapToResponse(updated);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private CastingApplicationResponse mapToResponse(CastingApplication app) {
        User applicant = app.getApplicant();
        Profile profile = profileRepository.findByUser(applicant).orElse(null);

        return CastingApplicationResponse.builder()
                .id(app.getId())
                .castingCallId(app.getCastingCall().getId())
                .castingCallTitle(app.getCastingCall().getTitle())
                .applicantId(applicant.getId())
                .applicantName(applicant.getFullName())
                .applicantPhoto(profile != null ? profile.getProfilePhoto() : null)
                .applicantLocation(applicant.getLocation())
                .applicantProfileTypes(applicant.getProfileTypes())
                .applicantDayRate(profile != null ? profile.getDayRate() : null)
                .status(app.getStatus())
                .coverNote(app.getCoverNote())
                .proposedRate(app.getProposedRate())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
