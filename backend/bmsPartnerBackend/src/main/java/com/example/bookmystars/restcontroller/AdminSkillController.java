package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.MasterSkillRequest;
import com.example.bookmystars.dto.MasterSkillResponse;
import com.example.bookmystars.service.MasterSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/skills")
@RequiredArgsConstructor
@Tag(name = "Admin Master Skills Management", description = "Endpoints for platform administrators to manage the global skills taxonomy")
public class AdminSkillController {

    private final MasterSkillService masterSkillService;

    @GetMapping
    @PreAuthorize("@rbac.hasPermission(authentication, 'skills', 'view')")
    @Operation(summary = "Get all master skills with talent profile usage statistics")
    public ResponseEntity<List<MasterSkillResponse>> getAdminSkills() {
        return ResponseEntity.ok(masterSkillService.getAdminSkills());
    }

    @GetMapping("/library")
    @PreAuthorize("@rbac.hasPermission(authentication, 'skills', 'view')")
    @Operation(summary = "Get standard reference library of cinema skills")
    public ResponseEntity<List<Map<String, String>>> getStandardLibrary() {
        return ResponseEntity.ok(masterSkillService.getStandardLibrary());
    }

    @PostMapping("/bulk-import")
    @PreAuthorize("@rbac.hasPermission(authentication, 'skills', 'create')")
    @Operation(summary = "One-click bulk import of standard cinema skills")
    public ResponseEntity<Map<String, Object>> bulkImportSkills(Authentication authentication) {
        return ResponseEntity.ok(masterSkillService.bulkImportStandardSkills(authentication));
    }

    @PostMapping
    @PreAuthorize("@rbac.hasPermission(authentication, 'skills', 'create')")
    @Operation(summary = "Add a new official creative skill to the platform catalog")
    public ResponseEntity<MasterSkillResponse> createSkill(
            Authentication authentication,
            @Valid @RequestBody MasterSkillRequest request) {
        MasterSkillResponse response = masterSkillService.createSkill(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("@rbac.hasPermission(authentication, 'skills', 'edit')")
    @Operation(summary = "Toggle skill active status (select / deselect from public UI)")
    public ResponseEntity<MasterSkillResponse> toggleSkill(
            Authentication authentication,
            @PathVariable Long id) {
        MasterSkillResponse response = masterSkillService.toggleSkillStatus(authentication, id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication, 'skills', 'delete')")
    @Operation(summary = "Delete an official skill from the platform catalog")
    public ResponseEntity<?> deleteSkill(
            Authentication authentication,
            @PathVariable Long id) {
        masterSkillService.deleteSkill(authentication, id);
        return ResponseEntity.ok(Map.of("message", "Master skill deleted successfully"));
    }
}
