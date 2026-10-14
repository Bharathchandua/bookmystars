package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.RatePackageRequest;
import com.example.bookmystars.dto.RatePackageResponse;
import com.example.bookmystars.service.RatePackageService;
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
@RequestMapping("/api/profile/rates")
@RequiredArgsConstructor
@Tag(name = "Rate Packages", description = "Talent commercial rates, daily/hourly shoot packages, and inclusions")
public class RatePackageController {

    private final RatePackageService ratePackageService;


    // =========================================================
    // CREATE PACKAGE
    // =========================================================

    @PostMapping
    @Operation(summary = "Create a new pricing/rate package for talent")
    public ResponseEntity<RatePackageResponse> createPackage(
            Authentication authentication,
            @Valid @RequestBody RatePackageRequest request) {

        RatePackageResponse response =
                ratePackageService.createPackage(
                        authentication,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET PROFILE PACKAGES
    // =========================================================

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all pricing/rate packages for a talent by User ID")
    public ResponseEntity<List<RatePackageResponse>>
    getProfilePackages(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                ratePackageService.getProfilePackages(userId)
        );
    }


    // =========================================================
    // GET MY PACKAGES (AUTHENTICATED TALENT)
    // =========================================================

    @GetMapping("/my")
    @Operation(summary = "Get all pricing/rate packages for the currently authenticated talent")
    public ResponseEntity<List<RatePackageResponse>> getMyPackages(
            Authentication authentication) {

        return ResponseEntity.ok(
                ratePackageService.getMyPackages(authentication)
        );
    }


    // =========================================================
    // GET ONE PACKAGE
    // =========================================================

    @GetMapping("/{packageId}")
    @Operation(summary = "Get details of a specific rate package by package ID")
    public ResponseEntity<RatePackageResponse>
    getPackageById(
            @PathVariable Long packageId) {

        return ResponseEntity.ok(
                ratePackageService.getPackageById(packageId)
        );
    }


    // =========================================================
    // UPDATE PACKAGE
    // =========================================================

    @PutMapping("/{packageId}")
    @Operation(summary = "Update an existing rate package by package ID")
    public ResponseEntity<RatePackageResponse>
    updatePackage(
            Authentication authentication,
            @PathVariable Long packageId,
            @Valid @RequestBody RatePackageRequest request) {

        RatePackageResponse response =
                ratePackageService.updatePackage(
                        authentication,
                        packageId,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DELETE PACKAGE
    // =========================================================

    @DeleteMapping("/{packageId}")
    @Operation(summary = "Delete a rate package by package ID")
    public ResponseEntity<String> deletePackage(
            Authentication authentication,
            @PathVariable Long packageId) {

        ratePackageService.deletePackage(
                authentication,
                packageId
        );

        return ResponseEntity.ok(
                "Rate package deleted successfully"
        );
    }
}
