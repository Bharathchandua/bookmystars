package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.UserResponse;
import com.example.bookmystars.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Current authenticated user account details")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user account information")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication) {

        String email = authentication.getName();

        UserResponse response = userService.getCurrentUser(email);

        return ResponseEntity.ok(response);
    }
}
