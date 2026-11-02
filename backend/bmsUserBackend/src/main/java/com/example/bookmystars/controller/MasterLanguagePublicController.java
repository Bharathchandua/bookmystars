package com.example.bookmystars.controller;

import com.example.bookmystars.dto.MasterLanguageResponse;
import com.example.bookmystars.service.MasterLanguageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/languages")
@RequiredArgsConstructor
@Tag(name = "Master Languages (Public)", description = "Public catalog of active languages for talent profiles, signup, and casting calls")
public class MasterLanguagePublicController {

    private final MasterLanguageService masterLanguageService;

    @GetMapping
    @Operation(summary = "Get all active languages for talent profiles and casting forms")
    public ResponseEntity<List<MasterLanguageResponse>> getActiveLanguages() {
        return ResponseEntity.ok(masterLanguageService.getPublicActiveLanguages());
    }
}
