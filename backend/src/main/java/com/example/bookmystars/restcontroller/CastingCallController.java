package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.CastingCallRequest;
import com.example.bookmystars.dto.CastingCallResponse;
import com.example.bookmystars.model.ProfileType;
import com.example.bookmystars.service.CastingCallService;
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
@RequestMapping("/api/professional/castings")
@RequiredArgsConstructor
@Tag(name = "Casting Calls", description = "Post, browse, and manage auditions and casting notices")
public class CastingCallController {

    private final CastingCallService castingCallService;

    @PostMapping
    @Operation(summary = "Create and publish a new casting call (Professionals only)")
    public ResponseEntity<CastingCallResponse> createCastingCall(
            Authentication authentication,
            @Valid @RequestBody CastingCallRequest request) {

        CastingCallResponse response = castingCallService.createCastingCall(authentication, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @Operation(summary = "Get all casting calls posted by the logged-in professional")
    public ResponseEntity<List<CastingCallResponse>> getMyCastingCalls(
            Authentication authentication) {

        return ResponseEntity.ok(castingCallService.getMyCastingCalls(authentication));
    }

    @GetMapping("/public")
    @Operation(summary = "Browse public open casting calls (Public endpoint)")
    public ResponseEntity<List<CastingCallResponse>> getPublicCastingCalls(
            @RequestParam(value = "roleType", required = false) ProfileType roleType) {

        return ResponseEntity.ok(castingCallService.getPublicCastingCalls(roleType));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full details of a specific casting call by ID")
    public ResponseEntity<CastingCallResponse> getCastingCallById(
            @PathVariable Long id) {

        return ResponseEntity.ok(castingCallService.getCastingCallById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing casting call by ID")
    public ResponseEntity<CastingCallResponse> updateCastingCall(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CastingCallRequest request) {

        return ResponseEntity.ok(castingCallService.updateCastingCall(authentication, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a casting call by ID")
    public ResponseEntity<String> deleteCastingCall(
            Authentication authentication,
            @PathVariable Long id) {

        castingCallService.deleteCastingCall(authentication, id);
        return ResponseEntity.ok("Casting call deleted successfully");
    }
}
