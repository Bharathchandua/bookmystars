package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.MeasurementRequest;
import com.example.bookmystars.dto.MeasurementResponse;
import com.example.bookmystars.service.MeasurementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile/measurements")
@Tag(name = "Physical Measurements", description = "Talent physical stats, height, bust/chest, waist, hips, shoe size, and attributes")
public class MeasurementController {

    private final MeasurementService measurementService;

    // Create measurements
    @PostMapping
    @Operation(summary = "Save or initialize physical measurements for talent")
    public ResponseEntity<MeasurementResponse> createMeasurement(
            Authentication authentication,
            @RequestBody MeasurementRequest request) {

        String email = authentication.getName();

        MeasurementResponse response =
                measurementService.createMeasurement(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // Get my measurements
    @GetMapping
    @Operation(summary = "Get physical measurements for the authenticated talent")
    public ResponseEntity<MeasurementResponse> getMyMeasurements(
            Authentication authentication) {

        String email = authentication.getName();

        MeasurementResponse response =
                measurementService.getMyMeasurements(email);

        return ResponseEntity.ok(response);
    }

    // Update my measurements
    @PutMapping
    @Operation(summary = "Update physical measurements for the authenticated talent")
    public ResponseEntity<MeasurementResponse> updateMeasurements(
            Authentication authentication,
            @RequestBody MeasurementRequest request) {

        String email = authentication.getName();

        MeasurementResponse response =
                measurementService.updateMeasurements(
                        email,
                        request
                );

        return ResponseEntity.ok(response);
    }
}
