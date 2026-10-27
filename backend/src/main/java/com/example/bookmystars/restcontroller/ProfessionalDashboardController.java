package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.*;
import com.example.bookmystars.model.ProfileType;
import com.example.bookmystars.service.ProfessionalDashboardService;
import com.example.bookmystars.service.TalentDirectoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professional")
@RequiredArgsConstructor
@Tag(name = "Professional Dashboard", description = "Professional company profile, casting metrics, and talent directory roster")
public class ProfessionalDashboardController {

    private final ProfessionalDashboardService professionalDashboardService;
    private final TalentDirectoryService talentDirectoryService;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get professional dashboard statistics (active castings, applicants, confirmed bookings)")
    public ResponseEntity<ProfessionalDashboardStats> getStats(Authentication authentication) {
        return ResponseEntity.ok(professionalDashboardService.getDashboardStats(authentication));
    }

    @GetMapping("/dashboard/profile")
    @Operation(summary = "Get professional company profile information")
    public ResponseEntity<ProfessionalProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(professionalDashboardService.getProfile(authentication));
    }

    @PutMapping("/dashboard/profile")
    @Operation(summary = "Update professional company profile, website, and office address")
    public ResponseEntity<ProfessionalProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody ProfessionalProfileRequest request) {

        return ResponseEntity.ok(professionalDashboardService.updateProfile(authentication, request));
    }

    @GetMapping("/talents")
    @Operation(summary = "Discover talents with 3-day availability schedule and filter by talent type")
    public ResponseEntity<List<TalentSummaryResponse>> getTalents(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "query", required = false) String query) {

        return ResponseEntity.ok(talentDirectoryService.getTalents(type, query));
    }
}
