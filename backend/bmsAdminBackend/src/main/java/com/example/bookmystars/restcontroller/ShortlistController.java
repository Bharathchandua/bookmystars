package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.TalentSummaryResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.service.ShortlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/shortlist")
@RequiredArgsConstructor
@Tag(name = "Talent Shortlists", description = "Endpoints for bookmarking and managing shortlisted talents for shoots")
public class ShortlistController {

    private final ShortlistService shortlistService;
    private final UserRepository userRepository;

    @GetMapping("/my")
    @Operation(summary = "Get list of shortlisted talent IDs for the current logged-in client/partner")
    public ResponseEntity<List<Long>> getMyShortlistIds(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(shortlistService.getMyShortlistedTalentIds(user));
    }

    @GetMapping("/my/details")
    @Operation(summary = "Get full talent objects for shortlisted talents")
    public ResponseEntity<List<TalentSummaryResponse>> getMyShortlistedTalents(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(shortlistService.getMyShortlistedTalents(user));
    }

    @PostMapping("/{talentId}/toggle")
    @Operation(summary = "Toggle shortlist bookmark for a talent")
    public ResponseEntity<List<Long>> toggleShortlist(
            Authentication authentication,
            @PathVariable Long talentId) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(shortlistService.toggleShortlist(user, talentId));
    }

    @PostMapping("/{talentId}")
    @Operation(summary = "Add talent to shortlist")
    public ResponseEntity<List<Long>> addToShortlist(
            Authentication authentication,
            @PathVariable Long talentId) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(shortlistService.addToShortlist(user, talentId));
    }

    @DeleteMapping("/{talentId}")
    @Operation(summary = "Remove talent from shortlist")
    public ResponseEntity<List<Long>> removeFromShortlist(
            Authentication authentication,
            @PathVariable Long talentId) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(shortlistService.removeFromShortlist(user, talentId));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
