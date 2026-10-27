package com.example.bookmystars.controller;

import com.example.bookmystars.dto.MasterProfessionRequest;
import com.example.bookmystars.dto.MasterProfessionResponse;
import com.example.bookmystars.service.MasterProfessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/professions")
@RequiredArgsConstructor
@Tag(name = "Master Professions (Admin)", description = "Administrative endpoints to create and manage sign-up primary professions")
public class AdminProfessionController {

    private final MasterProfessionService masterProfessionService;

    @GetMapping
    @Operation(summary = "Get all professions with talent usage statistics")
    public ResponseEntity<List<MasterProfessionResponse>> getAllProfessions() {
        return ResponseEntity.ok(masterProfessionService.getAdminProfessions());
    }

    @GetMapping("/library")
    @Operation(summary = "Get standard industry reference library of ~114 cinema professions")
    public ResponseEntity<List<Map<String, String>>> getStandardLibrary() {
        return ResponseEntity.ok(masterProfessionService.getStandardLibrary());
    }

    @PostMapping("/bulk-import")
    @Operation(summary = "One-click bulk import of all ~114 standard industry cinema professions")
    public ResponseEntity<Map<String, Object>> bulkImportProfessions() {
        return ResponseEntity.ok(masterProfessionService.bulkImportStandardProfessions());
    }

    @PostMapping
    @Operation(summary = "Add a new official primary profession to the platform catalog")
    public ResponseEntity<MasterProfessionResponse> createProfession(@Valid @RequestBody MasterProfessionRequest request) {
        MasterProfessionResponse created = masterProfessionService.createProfession(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle profession active status (select / deselect from public UI)")
    public ResponseEntity<MasterProfessionResponse> toggleProfession(@PathVariable Long id) {
        return ResponseEntity.ok(masterProfessionService.toggleProfessionStatus(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an official primary profession from catalog")
    public ResponseEntity<?> deleteProfession(@PathVariable Long id) {
        masterProfessionService.deleteProfession(id);
        return ResponseEntity.ok(Map.of("message", "Master profession deleted successfully", "id", id));
    }
}
