package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.WorkExperienceRequest;
import com.example.bookmystars.dto.WorkExperienceResponse;
import com.example.bookmystars.service.WorkExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile/work-experience")
@Tag(name = "Work Experience", description = "Talent filmography, acting credits, productions, and commercial projects")
public class WorkExperienceController {

    private final WorkExperienceService workExperienceService;

    // Upload attachment / proof file for work experience
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload proof/certificate/attachment file for work experience")
    public ResponseEntity<Map<String, String>> uploadWorkFile(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        String email = authentication.getName();
        String fileUrl = workExperienceService.uploadWorkFile(email, file);
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";

        return ResponseEntity.ok(Map.of("fileUrl", fileUrl, "fileName", fileName));
    }

    // Add work experience
    @PostMapping
    @Operation(summary = "Add a new filmography or work experience entry for talent")
    public ResponseEntity<WorkExperienceResponse> addWorkExperience(
            Authentication authentication,
            @jakarta.validation.Valid @RequestBody WorkExperienceRequest request) {

        String email = authentication.getName();

        WorkExperienceResponse response =
                workExperienceService.addWorkExperience(email, request);

        return ResponseEntity.ok(response);
    }

    // Get logged-in user's work experiences
    @GetMapping
    @Operation(summary = "Get all work experience and credits for the logged-in talent")
    public ResponseEntity<List<WorkExperienceResponse>> getMyWorkExperiences(
            Authentication authentication) {

        String email = authentication.getName();

        List<WorkExperienceResponse> response =
                workExperienceService.getMyWorkExperiences(email);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing work experience entry by ID")
    public ResponseEntity<WorkExperienceResponse> updateWorkExperience(
            Authentication authentication,
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody WorkExperienceRequest request) {

        String email = authentication.getName();

        WorkExperienceResponse response =
            workExperienceService.updateWorkExperience(
                    email,
                    id,
                    request
            );

        return ResponseEntity.ok(response);
    }

    // Delete work experience
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a work experience entry by ID")
    public ResponseEntity<String> deleteWorkExperience(
            Authentication authentication,
            @PathVariable Long id) {

        String email = authentication.getName();

        workExperienceService.deleteWorkExperience(email, id);

        return ResponseEntity.ok(
                "Work experience deleted successfully"
        );
    }
}
