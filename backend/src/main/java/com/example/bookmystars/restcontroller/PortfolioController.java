package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.PortfolioResponse;
import com.example.bookmystars.service.PortfolioService;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile/portfolio")
@Tag(name = "Portfolio Photos", description = "Talent portfolio picture gallery, headshots, editorial photos, and media")
public class PortfolioController {

    private final PortfolioService portfolioService;


    // =========================
    // UPLOAD PHOTO
    // =========================

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a new photo to the talent portfolio gallery")
    public ResponseEntity<PortfolioResponse> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category)
            throws IOException {

        String email = authentication.getName();

        PortfolioResponse response =
                portfolioService.uploadPhoto(email, file, title, category);

        return ResponseEntity.ok(response);
    }

    // =========================
    // UPDATE PHOTO
    // =========================

    @PutMapping("/{id}")
    @Operation(summary = "Update portfolio photo title, category, or replace image file")
    public ResponseEntity<PortfolioResponse> updatePhoto(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "file", required = false) MultipartFile file)
            throws IOException {

        String email = authentication.getName();

        PortfolioResponse response =
                portfolioService.updatePhoto(email, id, title, category, file);

        return ResponseEntity.ok(response);
    }


    // =========================
    // GET MY PORTFOLIO
    // =========================

    @GetMapping
    @Operation(summary = "Get all portfolio photos for the authenticated talent")
    public ResponseEntity<List<PortfolioResponse>> getMyPortfolio(
            Authentication authentication) {

        String email = authentication.getName();

        List<PortfolioResponse> response =
                portfolioService.getMyPortfolio(email);

        return ResponseEntity.ok(response);
    }


    // =========================
    // DELETE PHOTO
    // =========================

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a portfolio photo by photo ID")
    public ResponseEntity<String> deletePhoto(
            Authentication authentication,
            @PathVariable Long id)
            throws IOException {

        String email = authentication.getName();

        portfolioService.deletePhoto(email, id);

        return ResponseEntity.ok(
                "Portfolio photo deleted successfully"
        );
    }
}
