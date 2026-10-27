package com.example.bookmystars.controller;

import com.example.bookmystars.dto.MasterLanguageRequest;
import com.example.bookmystars.dto.MasterLanguageResponse;
import com.example.bookmystars.service.MasterLanguageService;
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
@RequestMapping("/api/admin/languages")
@RequiredArgsConstructor
@Tag(name = "Master Languages (Admin)", description = "Administrative endpoints to create, view and manage platform languages")
public class AdminLanguageController {

    private final MasterLanguageService masterLanguageService;

    @GetMapping
    @Operation(summary = "Get all languages with talent count statistics")
    public ResponseEntity<List<MasterLanguageResponse>> getAllLanguages() {
        return ResponseEntity.ok(masterLanguageService.getAdminLanguages());
    }

    @GetMapping("/library")
    @Operation(summary = "Get standard reference library of 24 canonical cinema languages")
    public ResponseEntity<List<Map<String, String>>> getStandardLibrary() {
        return ResponseEntity.ok(masterLanguageService.getStandardLibrary());
    }

    @PostMapping("/bulk-import")
    @Operation(summary = "One-click bulk import of the 24 canonical cinema languages")
    public ResponseEntity<Map<String, Object>> bulkImportLanguages() {
        return ResponseEntity.ok(masterLanguageService.bulkImportLanguages());
    }

    @PostMapping
    @Operation(summary = "Add a new official language to the catalog")
    public ResponseEntity<MasterLanguageResponse> createLanguage(@Valid @RequestBody MasterLanguageRequest request) {
        MasterLanguageResponse created = masterLanguageService.createLanguage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle language active status (select / deselect from public UI)")
    public ResponseEntity<MasterLanguageResponse> toggleLanguage(@PathVariable Long id) {
        return ResponseEntity.ok(masterLanguageService.toggleLanguageStatus(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an official language from catalog")
    public ResponseEntity<?> deleteLanguage(@PathVariable Long id) {
        masterLanguageService.deleteLanguage(id);
        return ResponseEntity.ok(Map.of("message", "Master language deleted successfully", "id", id));
    }
}
