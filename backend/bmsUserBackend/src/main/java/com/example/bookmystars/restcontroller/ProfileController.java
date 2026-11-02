package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.ProfileResponse;
import com.example.bookmystars.dto.ProfileUpdateRequest;
import com.example.bookmystars.dto.PublicProfileResponse;
import com.example.bookmystars.dto.ShareResponse;
import com.example.bookmystars.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
@Tag(name = "Talent Profile", description = "Talent bio, profile photo upload, public profile view, and social sharing links")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/share")
    @Operation(summary = "Generate shareable portfolio profile links for WhatsApp, Email, LinkedIn, etc.")
    public ResponseEntity<ShareResponse> getShareProfile(
            Authentication authentication,
            @RequestHeader(value = "Origin", required = false) String origin) {
        String email = authentication.getName();
        return ResponseEntity.ok(profileService.getShareProfileInfo(email, origin));
    }

    @GetMapping("/public/{userId}")
    @Operation(summary = "Get talent public profile and portfolio by User ID (Public endpoint with Instagram-style privacy)")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(
            @PathVariable Long userId,
            Authentication authentication,
            @RequestParam(value = "viewerEmail", required = false) String viewerEmail) {
        return ResponseEntity.ok(profileService.getPublicProfile(userId, authentication, viewerEmail));
    }

    @PatchMapping("/privacy")
    @Operation(summary = "Toggle profile privacy mode (Instagram-style Public vs Private)")
    public ResponseEntity<ProfileResponse> updatePrivacy(
            Authentication authentication,
            @RequestParam("isPrivate") Boolean isPrivate) {
        String email = authentication.getName();
        return ResponseEntity.ok(profileService.updatePrivacy(email, isPrivate));
    }

    @PostMapping("/access-request/{talentUserId}")
    @Operation(summary = "Send access request to view a private profile")
    public ResponseEntity<com.example.bookmystars.dto.ProfileAccessRequestDto> requestAccess(
            @PathVariable Long talentUserId,
            @RequestBody(required = false) com.example.bookmystars.dto.ProfileAccessRequestDto requestDto,
            Authentication authentication) {
        return ResponseEntity.ok(profileService.requestAccess(talentUserId, requestDto, authentication));
    }

    @GetMapping("/access-requests")
    @Operation(summary = "Get all incoming profile view requests for the authenticated talent")
    public ResponseEntity<java.util.List<com.example.bookmystars.dto.ProfileAccessRequestDto>> getAccessRequests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(profileService.getAccessRequests(email));
    }

    @PutMapping("/access-requests/{requestId}/status")
    @Operation(summary = "Approve or reject a profile view access request")
    public ResponseEntity<com.example.bookmystars.dto.ProfileAccessRequestDto> respondToAccessRequest(
            Authentication authentication,
            @PathVariable Long requestId,
            @RequestParam("approved") boolean approved) {
        String email = authentication.getName();
        return ResponseEntity.ok(profileService.respondToAccessRequest(email, requestId, approved));
    }

    @GetMapping
    @Operation(summary = "Get full profile information for the authenticated talent")
    public ProfileResponse getProfile(Authentication authentication) {
        String email = authentication.getName();
        return profileService.getProfile(email);
    }

    @PutMapping
    @Operation(summary = "Update talent bio, stage name, location, and years of experience")
    public ProfileResponse updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        String email = authentication.getName();
        return profileService.updateProfile(email, request);
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and update talent profile photo / avatar image")
    public ProfileResponse uploadProfilePhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) throws IOException {
        String email = authentication.getName();
        return profileService.uploadProfilePhoto(email, file);
    }
}
