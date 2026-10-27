package com.example.bookmystars.service;

import com.example.bookmystars.dto.AdminRoleDto;
import com.example.bookmystars.dto.AdminUserDto;
import com.example.bookmystars.dto.CreateAdminStaffRequest;
import com.example.bookmystars.model.AdminRole;
import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.repository.AdminRoleRepository;
import com.example.bookmystars.repository.AdminUserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminManagementService {

    private final AdminUserRepository adminUserRepository;
    private final AdminRoleRepository adminRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AdminAuthService adminAuthService;

    public List<AdminUserDto> getAllStaff() {
        return adminUserRepository.findAll().stream()
                .map(adminAuthService::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserDto createStaff(CreateAdminStaffRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (adminUserRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("An administrator with corporate email " + cleanEmail + " already exists.");
        }

        String avatar = request.getAvatar();
        if (avatar == null || avatar.trim().isEmpty()) {
            avatar = "https://images.unsplash.com/photo-" + (1534528741775L + (long)(Math.random() * 5000)) + "?auto=format&fit=crop&w=120&h=120&q=80";
        }

        AdminUser newAdmin = AdminUser.builder()
                .name(request.getName().trim())
                .email(cleanEmail)
                .password(passwordEncoder.encode(request.getPassword().trim()))
                .department(request.getDepartment() != null ? request.getDepartment() : "Operations")
                .roleId(request.getRoleId())
                .status("ACTIVE")
                .avatarUrl(avatar)
                .createdAt(LocalDateTime.now())
                .build();

        AdminUser saved = adminUserRepository.save(newAdmin);
        return adminAuthService.convertToDto(saved);
    }

    @Transactional
    public AdminUserDto updateStaffRole(Long staffId, String newRoleId) {
        AdminUser adminUser = adminUserRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found with ID: " + staffId));

        if (adminUser.getId() == 1L) {
            throw new IllegalArgumentException("The Master Super Admin role cannot be modified.");
        }

        adminUser.setRoleId(newRoleId);
        AdminUser saved = adminUserRepository.save(adminUser);
        return adminAuthService.convertToDto(saved);
    }

    @Transactional
    public void updateStaffPassword(Long staffId, String newPassword) {
        AdminUser adminUser = adminUserRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found with ID: " + staffId));

        adminUser.setPassword(passwordEncoder.encode(newPassword.trim()));
        adminUserRepository.save(adminUser);
    }

    @Transactional
    public void deleteStaff(Long staffId) {
        AdminUser adminUser = adminUserRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found with ID: " + staffId));

        if (adminUser.getId() == 1L || "admin@bookmystars.com".equalsIgnoreCase(adminUser.getEmail())) {
            throw new IllegalArgumentException("The Master Super Admin account cannot be deleted.");
        }

        adminUserRepository.delete(adminUser);
    }

    public List<AdminRoleDto> getAllRoles() {
        List<AdminUser> allStaff = adminUserRepository.findAll();
        Map<String, Long> roleCounts = allStaff.stream()
                .collect(Collectors.groupingBy(AdminUser::getRoleId, Collectors.counting()));

        return adminRoleRepository.findAll().stream().map(role -> {
            Map<String, Object> perms = Collections.emptyMap();
            if (role.getPermissions() != null) {
                try {
                    perms = objectMapper.readValue(role.getPermissions(), new TypeReference<Map<String, Object>>() {});
                } catch (Exception e) {
                    log.error("Failed to parse permissions for role {}: {}", role.getId(), e.getMessage());
                }
            }

            int count = roleCounts.getOrDefault(role.getId(), 0L).intValue();

            return AdminRoleDto.builder()
                    .id(role.getId())
                    .name(role.getName())
                    .description(role.getDescription())
                    .color(role.getColor())
                    .isSystem(role.getIsSystem())
                    .userCount(count)
                    .permissions(perms)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public AdminRoleDto saveRole(AdminRoleDto roleDto) {
        String roleId = roleDto.getId();
        if (roleId == null || roleId.trim().isEmpty()) {
            roleId = "ROLE_CUSTOM_" + System.currentTimeMillis();
        }

        AdminRole existing = adminRoleRepository.findById(roleId).orElse(null);
        boolean isSystem = existing != null && Boolean.TRUE.equals(existing.getIsSystem());

        String permsJson = "{}";
        if (roleDto.getPermissions() != null) {
            try {
                permsJson = objectMapper.writeValueAsString(roleDto.getPermissions());
            } catch (Exception e) {
                log.error("Failed to serialize permissions for role {}: {}", roleId, e.getMessage());
            }
        }

        AdminRole role = AdminRole.builder()
                .id(roleId)
                .name(roleDto.getName())
                .description(roleDto.getDescription())
                .color(roleDto.getColor() != null ? roleDto.getColor() : "#ee008f")
                .isSystem(isSystem)
                .permissions(permsJson)
                .build();

        AdminRole saved = adminRoleRepository.save(role);

        Map<String, Object> perms = Collections.emptyMap();
        try {
            perms = objectMapper.readValue(saved.getPermissions(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception ignored) {}

        return AdminRoleDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .color(saved.getColor())
                .isSystem(saved.getIsSystem())
                .permissions(perms)
                .build();
    }

    @Transactional
    public void deleteRole(String roleId) {
        AdminRole role = adminRoleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + roleId));

        if (Boolean.TRUE.equals(role.getIsSystem())) {
            throw new IllegalArgumentException("System default roles cannot be deleted!");
        }

        adminRoleRepository.delete(role);
    }

    @Transactional
    public AdminUserDto updateStaffAvatar(Long id, String avatarUrl) {
        AdminUser user = adminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + id));
        user.setAvatarUrl(avatarUrl != null && !avatarUrl.trim().isEmpty() ? avatarUrl.trim() : null);
        AdminUser saved = adminUserRepository.save(user);
        return adminAuthService.convertToDto(saved);
    }

    @Transactional
    public AdminUserDto updateCurrentAdminAvatar(String email, String avatarUrl) {
        AdminUser user = (email != null && !email.trim().isEmpty())
                ? adminUserRepository.findByEmail(email).orElse(null)
                : null;
        if (user == null) {
            user = adminUserRepository.findById(1L)
                    .orElseThrow(() -> new IllegalArgumentException("Admin account not found."));
        }
        user.setAvatarUrl(avatarUrl != null && !avatarUrl.trim().isEmpty() ? avatarUrl.trim() : null);
        AdminUser saved = adminUserRepository.save(user);
        return adminAuthService.convertToDto(saved);
    }
}
