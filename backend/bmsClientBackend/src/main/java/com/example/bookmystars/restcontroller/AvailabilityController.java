package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.AvailabilityRequest;
import com.example.bookmystars.dto.AvailabilityResponse;
import com.example.bookmystars.service.AvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/profile/availability")
@RequiredArgsConstructor
@Tag(name = "Talent Availability", description = "Manage talent schedule, available shoot dates, and calendar slots")
public class AvailabilityController {

    private final AvailabilityService availabilityService;


    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    @Operation(summary = "Create or schedule a new availability date for talent")
    public ResponseEntity<AvailabilityResponse> createAvailability(
            Authentication authentication,
            @Valid @RequestBody AvailabilityRequest request) {

        AvailabilityResponse response =
                availabilityService.createAvailability(
                        authentication,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET LOGGED-IN USER'S AVAILABILITY
    // =========================================================

    @GetMapping("/my")
    @Operation(summary = "Get complete availability schedule for logged-in talent")
    public ResponseEntity<List<AvailabilityResponse>> getMyAvailability(
            Authentication authentication) {

        return ResponseEntity.ok(
                availabilityService.getMyAvailability(authentication)
        );
    }


    // =========================================================
    // GET COMPLETE CALENDAR
    // =========================================================

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get complete calendar schedule for a specific talent by User ID")
    public ResponseEntity<List<AvailabilityResponse>>
    getUserAvailability(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                availabilityService.getUserAvailability(userId)
        );
    }


    // =========================================================
    // GET ONE DATE
    // =========================================================

    @GetMapping("/user/{userId}/date/{date}")
    @Operation(summary = "Check availability status for a specific talent on a specific date")
    public ResponseEntity<AvailabilityResponse>
    getAvailabilityByDate(
            @PathVariable Long userId,
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                availabilityService.getAvailabilityByDate(
                        userId,
                        date
                )
        );
    }


    // =========================================================
    // GET AVAILABLE DATES
    // =========================================================

    @GetMapping("/user/{userId}/available")
    @Operation(summary = "Get list of all open/available dates for a talent")
    public ResponseEntity<List<AvailabilityResponse>>
    getAvailableDates(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                availabilityService.getAvailableDates(userId)
        );
    }


    // =========================================================
    // GET NEXT AVAILABLE DATE
    // =========================================================

    @GetMapping("/user/{userId}/next")
    @Operation(summary = "Get the next immediately available date for a talent")
    public ResponseEntity<AvailabilityResponse>
    getNextAvailableDate(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                availabilityService.getNextAvailableDate(userId)
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{availabilityId}")
    @Operation(summary = "Update an availability slot status or description by ID")
    public ResponseEntity<AvailabilityResponse>
    updateAvailability(
            Authentication authentication,
            @PathVariable Long availabilityId,
            @Valid @RequestBody AvailabilityRequest request) {

        AvailabilityResponse response =
                availabilityService.updateAvailability(
                        authentication,
                        availabilityId,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{availabilityId}")
    @Operation(summary = "Delete an availability slot by ID")
    public ResponseEntity<String> deleteAvailability(
            Authentication authentication,
            @PathVariable Long availabilityId) {

        availabilityService.deleteAvailability(
                authentication,
                availabilityId
        );

        return ResponseEntity.ok(
                "Availability deleted successfully"
        );
    }

    @DeleteMapping("/date/{date}")
    @Operation(summary = "Delete an availability slot for a specific date")
    public ResponseEntity<String> deleteAvailabilityByDate(
            Authentication authentication,
            @PathVariable LocalDate date) {

        availabilityService.deleteAvailabilityByDate(
                authentication,
                date
        );

        return ResponseEntity.ok(
                "Availability deleted successfully"
        );
    }
}
