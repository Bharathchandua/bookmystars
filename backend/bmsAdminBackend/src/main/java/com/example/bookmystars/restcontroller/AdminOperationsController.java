package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.AdminCastingDto;
import com.example.bookmystars.dto.AdminOverviewMetricsDto;
import com.example.bookmystars.dto.AdminTalentKycDto;
import com.example.bookmystars.service.AdminOperationsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Operations & Moderation", description = "Endpoints for screening castings, verifying talent KYC badges, and overview metrics")
public class AdminOperationsController {

    private final AdminOperationsService adminOperationsService;

    // ─── OVERVIEW METRICS ───

    @GetMapping("/metrics/overview")
    @PreAuthorize("@rbac.hasPermission(authentication, 'overview', 'view')")
    @Operation(summary = "Get live system operational scorecards & queue counts from PostgreSQL database")
    public ResponseEntity<AdminOverviewMetricsDto> getOverviewMetrics(Authentication authentication) {
        return ResponseEntity.ok(adminOperationsService.getOverviewMetrics(authentication));
    }

    // ─── CASTING SCREENING QUEUE ───

    @GetMapping("/castings")
    @PreAuthorize("@rbac.hasPermission(authentication, 'castings', 'view')")
    @Operation(summary = "Get all casting calls for administrative moderation with optional status filter")
    public ResponseEntity<List<AdminCastingDto>> getCastings(
            @RequestParam(value = "status", required = false, defaultValue = "ALL") String status) {
        return ResponseEntity.ok(adminOperationsService.getCastings(status));
    }

    @PostMapping("/castings/{id}/approve")
    @PreAuthorize("@rbac.hasPermission(authentication, 'castings', 'approve')")
    @Operation(summary = "Screen and approve casting notice into OPEN status so normal talent users see it live")
    public ResponseEntity<AdminCastingDto> approveCasting(
            Authentication authentication,
            @PathVariable Long id) {
        AdminCastingDto approved = adminOperationsService.approveCasting(authentication, id);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/castings/{id}/reject")
    @PreAuthorize("@rbac.hasPermission(authentication, 'castings', 'edit')")
    @Operation(summary = "Screen and reject casting notice into CLOSED status with reason")
    public ResponseEntity<AdminCastingDto> rejectCasting(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null && body.containsKey("reason") ? body.get("reason") : "Does not meet editorial guidelines";
        AdminCastingDto rejected = adminOperationsService.rejectCasting(authentication, id, reason);
        return ResponseEntity.ok(rejected);
    }

    @DeleteMapping("/castings/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication, 'castings', 'delete')")
    @Operation(summary = "Permanently delete casting call from PostgreSQL database")
    public ResponseEntity<?> deleteCasting(
            Authentication authentication,
            @PathVariable Long id) {
        adminOperationsService.deleteCasting(authentication, id);
        return ResponseEntity.ok(Map.of("message", "Casting call permanently deleted from database."));
    }

    // ─── TALENT KYC & STAR BADGE VERIFICATION ───

    @GetMapping("/talents/kyc")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'view')")
    @Operation(summary = "Get all registered talent profiles and their live verification statuses from database")
    public ResponseEntity<List<AdminTalentKycDto>> getTalentsKyc() {
        return ResponseEntity.ok(adminOperationsService.getTalentsKycList());
    }

    @PostMapping("/talents/{id}/verify")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'approve')")
    @Operation(summary = "Award official Verified Star Badge and KYC certification to talent user")
    public ResponseEntity<AdminTalentKycDto> verifyTalent(
            Authentication authentication,
            @PathVariable Long id) {
        AdminTalentKycDto updated = adminOperationsService.verifyTalentKyc(authentication, id, true);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/talents/{id}/unverify")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'approve')")
    @Operation(summary = "Revoke Verified Star Badge and return KYC status to pending")
    public ResponseEntity<AdminTalentKycDto> unverifyTalent(
            Authentication authentication,
            @PathVariable Long id) {
        AdminTalentKycDto updated = adminOperationsService.verifyTalentKyc(authentication, id, false);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/talents/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication, 'talents', 'edit')")
    @Operation(summary = "Update talent details, credentials, and verification as platform administrator")
    public ResponseEntity<AdminTalentKycDto> updateTalent(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        AdminTalentKycDto updated = adminOperationsService.updateTalentDetails(authentication, id, updates);
        return ResponseEntity.ok(updated);
    }
}
