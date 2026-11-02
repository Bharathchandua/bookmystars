package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.MasterSkillResponse;
import com.example.bookmystars.service.MasterSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@Tag(name = "Master Skills Directory", description = "Public endpoints for talents to retrieve available platform skills")
public class MasterSkillPublicController {

    private final MasterSkillService masterSkillService;

    @GetMapping
    @Operation(summary = "Get all active master creative skills available for talent profiles")
    public ResponseEntity<List<MasterSkillResponse>> getPublicSkills() {
        return ResponseEntity.ok(masterSkillService.getPublicActiveSkills());
    }
}
