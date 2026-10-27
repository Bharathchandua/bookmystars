package com.example.bookmystars.controller;

import com.example.bookmystars.dto.MasterCraftRequest;
import com.example.bookmystars.dto.MasterCraftResponse;
import com.example.bookmystars.service.MasterCraftService;
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
@RequestMapping("/api/admin/crafts")
@RequiredArgsConstructor
@Tag(name = "Master Crafts (Admin)", description = "Administrative endpoints to create, view and manage crafts")
public class AdminCraftController {

    private final MasterCraftService masterCraftService;

    @GetMapping
    @Operation(summary = "Get all crafts with skill count statistics")
    public ResponseEntity<List<MasterCraftResponse>> getAllCrafts() {
        return ResponseEntity.ok(masterCraftService.getAdminCrafts());
    }

    @GetMapping("/library")
    @Operation(summary = "Get standard reference library of 24 cinema crafts")
    public ResponseEntity<List<Map<String, String>>> getStandardLibrary() {
        return ResponseEntity.ok(masterCraftService.getStandardLibrary());
    }

    @PostMapping("/bulk-import")
    @Operation(summary = "One-click bulk import of the 24 canonical cinema crafts")
    public ResponseEntity<Map<String, Object>> bulkImportCrafts() {
        return ResponseEntity.ok(masterCraftService.bulkImport24Crafts());
    }

    @PostMapping
    @Operation(summary = "Add a new official craft or discipline to the catalog")
    public ResponseEntity<MasterCraftResponse> createCraft(@Valid @RequestBody MasterCraftRequest request) {
        MasterCraftResponse created = masterCraftService.createCraft(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle craft active status (select / deselect from public UI)")
    public ResponseEntity<MasterCraftResponse> toggleCraft(@PathVariable Long id) {
        return ResponseEntity.ok(masterCraftService.toggleCraftStatus(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an official craft from catalog")
    public ResponseEntity<?> deleteCraft(@PathVariable Long id) {
        masterCraftService.deleteCraft(id);
        return ResponseEntity.ok(Map.of("message", "Master craft deleted successfully", "id", id));
    }
}
