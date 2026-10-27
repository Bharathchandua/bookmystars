package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.AdminRoleDto;
import com.example.bookmystars.dto.AdminUserDto;
import com.example.bookmystars.dto.CreateAdminStaffRequest;
import com.example.bookmystars.dto.UpdateAdminPasswordRequest;
import com.example.bookmystars.service.AdminManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Staff & RBAC Management", description = "Endpoints for managing admin staff accounts and dynamic RBAC roles")
public class AdminStaffController {

    private final AdminManagementService adminManagementService;

    // ─── STAFF MANAGEMENT ───

    @GetMapping("/staff")
    @Operation(summary = "Get list of all admin staff members")
    public ResponseEntity<List<AdminUserDto>> getAllStaff() {
        return ResponseEntity.ok(adminManagementService.getAllStaff());
    }

    @PostMapping("/staff")
    @Operation(summary = "Create a new administrator with login credentials and assigned role")
    public ResponseEntity<?> createStaff(@Valid @RequestBody CreateAdminStaffRequest request) {
        try {
            AdminUserDto created = adminManagementService.createStaff(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create administrator account."));
        }
    }

    @PutMapping("/staff/{id}/role")
    @Operation(summary = "Dynamically assign or reassign role to staff member")
    public ResponseEntity<?> updateStaffRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String newRoleId = body.get("roleId");
            if (newRoleId == null || newRoleId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "roleId is required."));
            }
            AdminUserDto updated = adminManagementService.updateStaffRole(id, newRoleId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/staff/{id}/password")
    @Operation(summary = "Super Admin resets a staff officer's login password")
    public ResponseEntity<?> updateStaffPassword(@PathVariable Long id, @Valid @RequestBody UpdateAdminPasswordRequest request) {
        try {
            adminManagementService.updateStaffPassword(id, request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/staff/{id}/avatar")
    @Operation(summary = "Update administrator profile photo")
    public ResponseEntity<?> updateStaffAvatar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String avatarUrl = body.get("avatarUrl");
            AdminUserDto updated = adminManagementService.updateStaffAvatar(id, avatarUrl);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile/avatar")
    @Operation(summary = "Update current administrator profile photo")
    public ResponseEntity<?> updateCurrentProfileAvatar(@RequestBody Map<String, String> body, org.springframework.security.core.Authentication authentication) {
        try {
            String avatarUrl = body.get("avatarUrl");
            String email = authentication != null ? authentication.getName() : null;
            AdminUserDto updated = adminManagementService.updateCurrentAdminAvatar(email, avatarUrl);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/staff/{id}")
    @Operation(summary = "Remove administrator account")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        try {
            adminManagementService.deleteStaff(id);
            return ResponseEntity.ok(Map.of("message", "Staff account removed successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    // ─── DYNAMIC ROLES & PERMISSIONS ───

    @GetMapping("/roles")
    @Operation(summary = "Get all dynamic roles and permission matrices")
    public ResponseEntity<List<AdminRoleDto>> getAllRoles() {
        return ResponseEntity.ok(adminManagementService.getAllRoles());
    }

    @PostMapping("/roles")
    @Operation(summary = "Create or update a dynamic role with permissions")
    public ResponseEntity<AdminRoleDto> saveRole(@RequestBody AdminRoleDto roleDto) {
        return ResponseEntity.ok(adminManagementService.saveRole(roleDto));
    }

    @DeleteMapping("/roles/{id}")
    @Operation(summary = "Delete custom dynamic role")
    public ResponseEntity<?> deleteRole(@PathVariable String id) {
        try {
            adminManagementService.deleteRole(id);
            return ResponseEntity.ok(Map.of("message", "Custom role deleted successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }
}
