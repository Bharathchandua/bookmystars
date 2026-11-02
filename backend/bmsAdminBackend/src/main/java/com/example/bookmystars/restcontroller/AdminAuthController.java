package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.AdminLoginRequest;
import com.example.bookmystars.dto.AdminLoginResponse;
import com.example.bookmystars.dto.AdminUserDto;
import com.example.bookmystars.service.AdminAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
@Tag(name = "Admin Authentication", description = "Endpoints for Super Admin and Staff Officer login and identity")
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate Super Admin or Staff Officer using corporate email and password")
    public ResponseEntity<?> login(@Valid @RequestBody AdminLoginRequest request) {
        try {
            AdminLoginResponse response = adminAuthService.login(request);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during administrative authentication."));
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated admin user profile and live permission matrix")
    public ResponseEntity<?> getCurrentAdmin(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Not authenticated"));
        }
        try {
            AdminUserDto current = adminAuthService.getCurrentAdmin(authentication.getName());
            return ResponseEntity.ok(current);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/avatar")
    @Operation(summary = "Update current authenticated admin user avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> body, Authentication authentication) {
        try {
            String avatarUrl = body.get("avatarUrl");
            String email = authentication != null ? authentication.getName() : body.get("email");
            AdminUserDto updated = adminAuthService.updateAvatar(email, avatarUrl);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
