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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CastingCallService {

    private final CastingCallRepository castingCallRepository;
    private final CastingApplicationRepository castingApplicationRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final UserRepository userRepository;
    private final Path oppUploadDirectory = Paths.get("uploads/opportunities");

    public String uploadOpportunityMedia(Authentication authentication, MultipartFile file) throws IOException {
        User user = getAuthenticatedUser(authentication);
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        Files.createDirectories(oppUploadDirectory);
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = "opp_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
        Path filePath = oppUploadDirectory.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/opportunities/" + fileName;
    }

    public CastingCallResponse createCastingCall(Authentication authentication, CastingCallRequest request) {
        User user = getAuthenticatedUser(authentication);
        validateCastingCallRequest(request);

        CastingCall castingCall = CastingCall.builder()
                .postedBy(user)
                .title(request.getTitle())
                .projectType(request.getProjectType())
                .postType(request.getPostType() != null && !request.getPostType().isBlank() ? request.getPostType().trim() : (request.getRoleType() != null ? request.getRoleType().name() : "ACTING"))
                .requiredLanguages(request.getRequiredLanguages() != null ? request.getRequiredLanguages().trim() : null)
                .roleType(request.getRoleType())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .location(request.getLocation())
                .budget(request.getBudget())
                .shootStartDate(request.getShootStartDate())
                .shootEndDate(request.getShootEndDate())
                .applicationDeadline(request.getApplicationDeadline())
                .videoUrl(request.getVideoUrl())
                .posterUrl(request.getPosterUrl())
                .customCraft(request.getCustomCraft())
                .age(request.getAge())
                .gender(request.getGender())
                .height(request.getHeight())
                .weight(request.getWeight())
                .status(request.getStatus() != null && request.getStatus() != CastingStatus.OPEN ? request.getStatus() : CastingStatus.IN_REVIEW)
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

        validateCastingCallRequest(request);

        call.setTitle(request.getTitle());
        call.setProjectType(request.getProjectType());
        if (request.getPostType() != null) {
            call.setPostType(request.getPostType().trim());
        }
        if (request.getRequiredLanguages() != null) {
            call.setRequiredLanguages(request.getRequiredLanguages().trim());
        }
        call.setRoleType(request.getRoleType());
        call.setDescription(request.getDescription());
        call.setRequirements(request.getRequirements());
        call.setLocation(request.getLocation());
        call.setBudget(request.getBudget());
        call.setShootStartDate(request.getShootStartDate());
        call.setShootEndDate(request.getShootEndDate());
        call.setApplicationDeadline(request.getApplicationDeadline());
        if (request.getVideoUrl() != null) {
            call.setVideoUrl(request.getVideoUrl());
        }
        if (request.getPosterUrl() != null) {
            call.setPosterUrl(request.getPosterUrl());
        }
        if (request.getCustomCraft() != null) {
            call.setCustomCraft(request.getCustomCraft());
        }
        if (request.getAge() != null) {
            call.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            call.setGender(request.getGender());
        }
        if (request.getHeight() != null) {
            call.setHeight(request.getHeight());
        }
        if (request.getWeight() != null) {
            call.setWeight(request.getWeight());
        }
        if (request.getStatus() != null) {
            call.setStatus(request.getStatus());
        }

        CastingCall updated = castingCallRepository.save(call);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCastingCall(Authentication authentication, Long id) {
        User user = getAuthenticatedUser(authentication);
        CastingCall call = castingCallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found"));

        if (!call.getPostedBy().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own casting calls");
        }

        castingApplicationRepository.deleteByCastingCallId(call.getId());
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
                .postType(call.getPostType() != null ? call.getPostType() : (call.getRoleType() != null ? call.getRoleType().name() : "ACTING"))
                .requiredLanguages(call.getRequiredLanguages())
                .roleType(call.getRoleType())
                .description(call.getDescription())
                .requirements(call.getRequirements())
                .location(call.getLocation())
                .budget(call.getBudget())
                .shootStartDate(call.getShootStartDate())
                .shootEndDate(call.getShootEndDate())
                .applicationDeadline(call.getApplicationDeadline())
                .videoUrl(call.getVideoUrl())
                .posterUrl(call.getPosterUrl())
                .customCraft(call.getCustomCraft())
                .age(call.getAge())
                .gender(call.getGender())
                .height(call.getHeight())
                .weight(call.getWeight())
                .status(call.getStatus())
                .applicantCount(applicantCount)
                .createdAt(call.getCreatedAt())
                .updatedAt(call.getUpdatedAt())
                .build();
    }

    private void validateCastingCallRequest(CastingCallRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Casting call request payload cannot be empty");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project or film title is required");
        }
        if (request.getRoleType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Talent / craft role type is required");
        }
        if (request.getRoleType() == ProfileType.OTHER && (request.getCustomCraft() == null || request.getCustomCraft().trim().isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specific craft / role name is required when role type is OTHER");
        }
        if (request.getAge() == null || request.getAge().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Age requirement is mandatory (e.g. 20-30 or 25 years)");
        }
        if (request.getGender() == null || request.getGender().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gender requirement is mandatory (e.g. Any, Male, Female)");
        }
    }
}
