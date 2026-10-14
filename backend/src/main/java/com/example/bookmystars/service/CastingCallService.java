package com.example.bookmystars.service;

import com.example.bookmystars.dto.CastingCallRequest;
import com.example.bookmystars.dto.CastingCallResponse;
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

import java.util.List;

@Service
@RequiredArgsConstructor
public class CastingCallService {

    private final CastingCallRepository castingCallRepository;
    private final CastingApplicationRepository castingApplicationRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final UserRepository userRepository;

    public CastingCallResponse createCastingCall(Authentication authentication, CastingCallRequest request) {
        User user = getAuthenticatedUser(authentication);

        CastingCall castingCall = CastingCall.builder()
                .postedBy(user)
                .title(request.getTitle())
                .projectType(request.getProjectType())
                .roleType(request.getRoleType())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .location(request.getLocation())
                .budget(request.getBudget())
                .shootStartDate(request.getShootStartDate())
                .shootEndDate(request.getShootEndDate())
                .applicationDeadline(request.getApplicationDeadline())
                .status(request.getStatus() != null ? request.getStatus() : CastingStatus.OPEN)
                .build();

        CastingCall saved = castingCallRepository.save(castingCall);
        return mapToResponse(saved);
    }

    public List<CastingCallResponse> getMyCastingCalls(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return castingCallRepository.findByPostedByIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CastingCallResponse> getPublicCastingCalls(ProfileType roleType) {
        if (roleType != null) {
            return castingCallRepository.findByRoleTypeAndStatusOrderByCreatedAtDesc(roleType, CastingStatus.OPEN)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }
        return castingCallRepository.findByStatusOrderByCreatedAtDesc(CastingStatus.OPEN)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CastingCallResponse getCastingCallById(Long id) {
        CastingCall call = castingCallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found"));
        return mapToResponse(call);
    }

    public CastingCallResponse updateCastingCall(Authentication authentication, Long id, CastingCallRequest request) {
        User user = getAuthenticatedUser(authentication);
        CastingCall call = castingCallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found"));

        if (!call.getPostedBy().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own casting calls");
        }

        call.setTitle(request.getTitle());
        call.setProjectType(request.getProjectType());
        call.setRoleType(request.getRoleType());
        call.setDescription(request.getDescription());
        call.setRequirements(request.getRequirements());
        call.setLocation(request.getLocation());
        call.setBudget(request.getBudget());
        call.setShootStartDate(request.getShootStartDate());
        call.setShootEndDate(request.getShootEndDate());
        call.setApplicationDeadline(request.getApplicationDeadline());
        if (request.getStatus() != null) {
            call.setStatus(request.getStatus());
        }

        CastingCall updated = castingCallRepository.save(call);
        return mapToResponse(updated);
    }

    public void deleteCastingCall(Authentication authentication, Long id) {
        User user = getAuthenticatedUser(authentication);
        CastingCall call = castingCallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found"));

        if (!call.getPostedBy().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own casting calls");
        }

        castingCallRepository.delete(call);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private CastingCallResponse mapToResponse(CastingCall call) {
        long applicantCount = castingApplicationRepository.countByCastingCallId(call.getId());
        String companyName = professionalProfileRepository.findByUserId(call.getPostedBy().getId())
                .map(ProfessionalProfile::getCompanyName)
                .orElse(null);

        return CastingCallResponse.builder()
                .id(call.getId())
                .postedByUserId(call.getPostedBy().getId())
                .postedByUserName(call.getPostedBy().getFullName())
                .companyName(companyName)
                .title(call.getTitle())
                .projectType(call.getProjectType())
                .roleType(call.getRoleType())
                .description(call.getDescription())
                .requirements(call.getRequirements())
                .location(call.getLocation())
                .budget(call.getBudget())
                .shootStartDate(call.getShootStartDate())
                .shootEndDate(call.getShootEndDate())
                .applicationDeadline(call.getApplicationDeadline())
                .status(call.getStatus())
                .applicantCount(applicantCount)
                .createdAt(call.getCreatedAt())
                .updatedAt(call.getUpdatedAt())
                .build();
    }
}
