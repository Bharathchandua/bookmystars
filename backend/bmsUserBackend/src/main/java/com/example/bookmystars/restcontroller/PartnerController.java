package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.PartnerProfileDto;
import com.example.bookmystars.dto.PartnerRegistrationRequest;
import com.example.bookmystars.dto.PartnerResponseDto;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.service.ClientPartnerProfileService;
import com.example.bookmystars.service.PartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Partnership & B2B Management", description = "Endpoints for academy/business partner registration, academy profile, Super Admin verification, and status moderation")
public class PartnerController {

    private final PartnerService partnerService;
    private final ClientPartnerProfileService clientPartnerProfileService;
    private final UserRepository userRepository;

    // --- PUBLIC REGISTRATION ENDPOINT (BECOME A PARTNER PAGE) ---
    // Accessible via /api/partners/register or /api/auth/partners/register to guarantee 100% public access
    @PostMapping({"/partners/register", "/auth/partners/register", "/auth/partner/register"})
    @Operation(summary = "Register a new business / academy partner (Pending Super Admin verification)")
    public ResponseEntity<PartnerResponseDto> registerPartner(
            @Valid @RequestBody PartnerRegistrationRequest request) {
        PartnerResponseDto registered = partnerService.registerPartner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }

    @GetMapping("/partners/profile/me")
    @Operation(summary = "Get official academy / partner brand profile for current logged-in partner")
    public ResponseEntity<PartnerProfileDto> getMyProfile(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(clientPartnerProfileService.getOrCreatePartnerProfile(user));
    }

    @PutMapping("/partners/profile/me")
    @Operation(summary = "Update official academy / partner brand profile for current logged-in partner")
    public ResponseEntity<PartnerProfileDto> updateMyProfile(
            Authentication authentication,
            @RequestBody PartnerProfileDto dto) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(clientPartnerProfileService.updatePartnerProfile(user, dto));
    }

    // --- SUPER ADMIN VERIFICATION & DESK ENDPOINTS ---

    @GetMapping("/admin/partners")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'view')")
    @Operation(summary = "Get list of registered partners with optional status filter (ALL, PENDING, APPROVED, REJECTED)")
    public ResponseEntity<List<PartnerResponseDto>> getPartners(
            @RequestParam(value = "status", required = false, defaultValue = "ALL") String status) {
        return ResponseEntity.ok(partnerService.getPartners(status));
    }

    @GetMapping("/admin/partners/pending-count")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'view')")
    @Operation(summary = "Get count of pending partner applications for the Super Admin notification bell")
    public ResponseEntity<Map<String, Long>> getPendingCount() {
        long count = partnerService.getPendingPartnersCount();
        return ResponseEntity.ok(Map.of("pendingCount", count));
    }

    @PostMapping("/admin/partners/{id}/verify")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'approve')")
    @Operation(summary = "Super Admin verifies and activates a partner academy account")
    public ResponseEntity<PartnerResponseDto> verifyPartner(
            @PathVariable Long id) {
        PartnerResponseDto approved = partnerService.verifyPartner(id, true, null);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/admin/partners/{id}/reject")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'edit')")
    @Operation(summary = "Super Admin rejects a partner application with feedback reason")
    public ResponseEntity<PartnerResponseDto> rejectPartner(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null && body.containsKey("reason") ? body.get("reason") : "Does not meet platform guidelines";
        PartnerResponseDto rejected = partnerService.verifyPartner(id, false, reason);
        return ResponseEntity.ok(rejected);
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
