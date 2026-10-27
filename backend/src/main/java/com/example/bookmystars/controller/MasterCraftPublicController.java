package com.example.bookmystars.controller;

import com.example.bookmystars.dto.MasterCraftResponse;
import com.example.bookmystars.service.MasterCraftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/crafts")
@RequiredArgsConstructor
@Tag(name = "Master Crafts (Public)", description = "Public catalog of creative disciplines and craft categories")
public class MasterCraftPublicController {

    private final MasterCraftService masterCraftService;

    @GetMapping
    @Operation(summary = "Get all active crafts/categories for talent profiles and forms")
    public ResponseEntity<List<MasterCraftResponse>> getActiveCrafts() {
        return ResponseEntity.ok(masterCraftService.getPublicActiveCrafts());
    }
}
