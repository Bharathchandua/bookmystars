package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.CompanyShowcaseProfileDto;
import com.example.bookmystars.dto.CreateShowcaseRequest;
import com.example.bookmystars.dto.ReviewShowcaseRequest;
import com.example.bookmystars.dto.ShowcaseItemDto;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.service.ShowcaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Showcase Management", description = "Showcase works, moderation, and public company portfolio endpoints")
public class ShowcaseController {

    private final ShowcaseService showcaseService;
    private final UserRepository userRepository;

    @PostMapping(value = "/showcase/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload photo or video for showcase works portfolio")
    public ResponseEntity<Map<String, String>> uploadShowcaseMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "mediaType", required = false, defaultValue = "PHOTO") String mediaType) {
        Map<String, String> result = showcaseService.uploadShowcaseMedia(file, mediaType);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/showcase")
    @Operation(summary = "Submit a new showcase work for admin approval (enters PENDING)")
    public ResponseEntity<ShowcaseItemDto> createShowcaseItem(
            Authentication authentication,
            @Valid @RequestBody CreateShowcaseRequest request) {
        User user = getCurrentUser(authentication);
        ShowcaseItemDto created = showcaseService.createShowcaseItem(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/showcase/my")
    @Operation(summary = "Get all showcase items for logged-in client or partner")
    public ResponseEntity<List<ShowcaseItemDto>> getMyShowcaseItems(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(showcaseService.getMyShowcaseItems(user));
    }

    @DeleteMapping("/showcase/{id}")
    @Operation(summary = "Delete own showcase item")
    public ResponseEntity<Map<String, String>> deleteMyShowcaseItem(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getCurrentUser(authentication);
        showcaseService.deleteMyShowcaseItem(user, id);
        return ResponseEntity.ok(Map.of("message", "Showcase item deleted successfully"));
    }

    @GetMapping("/public/showcase/{userId}")
    @Operation(summary = "Public read-only: Get approved showcase works for a company or academy")
    public ResponseEntity<List<ShowcaseItemDto>> getPublicApprovedShowcase(@PathVariable Long userId) {
        return ResponseEntity.ok(showcaseService.getPublicApprovedShowcase(userId));
    }

    @GetMapping("/public/showcase/company-profile/{userId}")
    @Operation(summary = "Public read-only: Full company or partner dossier with approved showcase works and active calls")
    public ResponseEntity<CompanyShowcaseProfileDto> getPublicCompanyProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(showcaseService.getPublicCompanyProfile(userId));
    }

    @GetMapping("/admin/showcase")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'view') or @rbac.hasPermission(authentication, 'castings', 'view')")
    @Operation(summary = "Super Admin: Get showcase works for moderation (filter by type: CLIENT/PARTNER, status: PENDING/APPROVED/REJECTED/ALL)")
    public ResponseEntity<List<ShowcaseItemDto>> getAdminShowcase(
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        return ResponseEntity.ok(showcaseService.getAdminShowcaseItems(type, status));
    }

    @PostMapping("/admin/showcase/{id}/approve")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'approve') or @rbac.hasPermission(authentication, 'castings', 'approve')")
    @Operation(summary = "Super Admin: Approve showcase work to go live")
    public ResponseEntity<ShowcaseItemDto> approveShowcase(
            Authentication authentication,
            @PathVariable Long id) {
        String adminEmail = (authentication != null) ? authentication.getName() : "admin";
        return ResponseEntity.ok(showcaseService.approveShowcaseItem(id, adminEmail));
    }

    @PostMapping("/admin/showcase/{id}/reject")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'edit') or @rbac.hasPermission(authentication, 'castings', 'edit')")
    @Operation(summary = "Super Admin: Reject showcase work with reason")
    public ResponseEntity<ShowcaseItemDto> rejectShowcase(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody(required = false) ReviewShowcaseRequest request) {
        String adminEmail = (authentication != null) ? authentication.getName() : "admin";
        String reason = (request != null) ? request.getReason() : null;
        return ResponseEntity.ok(showcaseService.rejectShowcaseItem(id, reason, adminEmail));
    }

    @DeleteMapping("/admin/showcase/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication, 'kyc', 'delete') or @rbac.hasPermission(authentication, 'talents', 'delete')")
    @Operation(summary = "Super Admin: Delete showcase work permanently")
    public ResponseEntity<Map<String, String>> deleteShowcaseByAdmin(@PathVariable Long id) {
        showcaseService.deleteShowcaseItemByAdmin(id);
        return ResponseEntity.ok(Map.of("message", "Showcase work deleted permanently"));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
