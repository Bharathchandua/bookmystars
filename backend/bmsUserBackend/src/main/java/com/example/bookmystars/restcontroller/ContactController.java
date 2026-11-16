package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.ContactResponse;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Tag(name = "User Contacts", description = "Endpoints for managing saved user contacts")
public class ContactController {

    private final ContactService contactService;
    private final UserRepository userRepository;

    @GetMapping("/my")
    @Operation(summary = "Get list of saved contacts for the current user")
    public ResponseEntity<List<ContactResponse>> getMyContacts(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(contactService.getMyContacts(user));
    }

    @PostMapping("/save/{contactUserId}")
    @Operation(summary = "Save a user to contacts")
    public ResponseEntity<ContactResponse> saveContact(
            Authentication authentication,
            @PathVariable Long contactUserId) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(contactService.saveContact(user, contactUserId));
    }

    @DeleteMapping("/{contactUserId}")
    @Operation(summary = "Remove a user from contacts")
    public ResponseEntity<Map<String, String>> removeContact(
            Authentication authentication,
            @PathVariable Long contactUserId) {
        User user = getCurrentUser(authentication);
        contactService.removeContact(user, contactUserId);
        return ResponseEntity.ok(Map.of("message", "Contact removed successfully"));
    }

    @PostMapping("/{contactUserId}/toggle-star")
    @Operation(summary = "Toggle starred status for a contact")
    public ResponseEntity<ContactResponse> toggleStarContact(
            Authentication authentication,
            @PathVariable Long contactUserId) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(contactService.toggleStarContact(user, contactUserId));
    }

    @GetMapping("/check/{contactUserId}")
    @Operation(summary = "Check if a user is saved in contacts")
    public ResponseEntity<Map<String, Boolean>> isContactSaved(
            Authentication authentication,
            @PathVariable Long contactUserId) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(contactService.isContactSaved(user, contactUserId));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
