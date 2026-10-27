package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.CastingApplicationRequest;
import com.example.bookmystars.dto.CastingApplicationResponse;
import com.example.bookmystars.model.ApplicationStatus;
import com.example.bookmystars.service.CastingApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professional/applications")
@RequiredArgsConstructor
@Tag(name = "Casting Applications", description = "Talent audition submissions and candidate review workflow")
public class CastingApplicationController {

    private final CastingApplicationService castingApplicationService;

    @PostMapping
    @Operation(summary = "Apply for a casting call with cover note and proposed rate (Talent only)")
    public ResponseEntity<CastingApplicationResponse> apply(
            Authentication authentication,
            @Valid @RequestBody CastingApplicationRequest request) {

        CastingApplicationResponse response = castingApplicationService.applyForCastingCall(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/casting/{castingCallId}")
    @Operation(summary = "Get list of candidate applicants for a specific casting call (Professionals only)")
    public ResponseEntity<List<CastingApplicationResponse>> getApplicants(
            Authentication authentication,
            @PathVariable Long castingCallId) {

        return ResponseEntity.ok(castingApplicationService.getApplicantsForCastingCall(authentication, castingCallId));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all audition applications submitted by the logged-in talent")
    public ResponseEntity<List<CastingApplicationResponse>> getMyApplications(
            Authentication authentication) {

        return ResponseEntity.ok(castingApplicationService.getMyApplications(authentication));
    }

    @GetMapping("/received")
    @Operation(summary = "Get all candidate applications received on any casting call posted by the logged-in user")
    public ResponseEntity<List<CastingApplicationResponse>> getReceivedApplications(
            Authentication authentication) {

        return ResponseEntity.ok(castingApplicationService.getReceivedApplications(authentication));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update candidate application status (e.g., SHORTLISTED, SELECTED, REJECTED)")
    public ResponseEntity<CastingApplicationResponse> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam("status") ApplicationStatus status) {

        return ResponseEntity.ok(castingApplicationService.updateApplicationStatus(authentication, id, status));
    }
}
