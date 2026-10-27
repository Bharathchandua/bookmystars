package com.example.bookmystars.controller;

import com.example.bookmystars.dto.MasterProfessionResponse;
import com.example.bookmystars.service.MasterProfessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/professions")
@RequiredArgsConstructor
@Tag(name = "Master Professions (Public)", description = "Public catalog of primary professions for sign-up and user profiles")
public class MasterProfessionPublicController {

    private final MasterProfessionService masterProfessionService;

    @GetMapping
    @Operation(summary = "Get all active primary professions for the Sign-Up screen")
    public ResponseEntity<List<MasterProfessionResponse>> getActiveProfessions() {
        return ResponseEntity.ok(masterProfessionService.getPublicActiveProfessions());
    }
}
