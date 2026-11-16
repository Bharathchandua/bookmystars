package com.example.bookmystars.service;

import com.example.bookmystars.dto.AdminLoginRequest;
import com.example.bookmystars.dto.AdminLoginResponse;
import com.example.bookmystars.dto.AdminUserDto;
import com.example.bookmystars.model.AdminRole;
import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.repository.AdminRoleRepository;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.security.JwtService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final AdminRoleRepository adminRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        AdminUser adminUser = adminUserRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new BadCredentialsException("No administrator account found with this corporate email."));

        if (!passwordEncoder.matches(request.getPassword(), adminUser.getPassword())) {
            throw new BadCredentialsException("Incorrect administrator password. Please try again.");
        }

        if (!"ACTIVE".equalsIgnoreCase(adminUser.getStatus())) {
            throw new BadCredentialsException("This administrator account has been deactivated. Please contact the Super Admin.");
        }

        adminUser.setLastLogin(LocalDateTime.now());
        adminUserRepository.save(adminUser);

        String token = jwtService.generateToken(adminUser.getEmail());
        AdminUserDto userDto = convertToDto(adminUser);

        return AdminLoginResponse.builder()
                .token(token)
                .user(userDto)
                .build();
    }

    public AdminUserDto getCurrentAdmin(String email) {
        AdminUser adminUser = adminUserRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Admin account not found."));
        return convertToDto(adminUser);
    }

    @org.springframework.transaction.annotation.Transactional
    public AdminUserDto updateAvatar(String email, String avatarUrl) {
        AdminUser adminUser = null;
        if (email != null && !email.trim().isEmpty()) {
            adminUser = adminUserRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        }
        if (adminUser == null) {
            adminUser = adminUserRepository.findById(1L)
                    .orElseThrow(() -> new RuntimeException("Admin account not found."));
        }
        adminUser.setAvatarUrl(avatarUrl != null && !avatarUrl.trim().isEmpty() ? avatarUrl.trim() : null);
        AdminUser saved = adminUserRepository.save(adminUser);
        return convertToDto(saved);
    }

    public AdminUserDto convertToDto(AdminUser adminUser) {
        AdminRole role = adminRoleRepository.findById(adminUser.getRoleId()).orElse(null);
        String roleName = role != null ? role.getName() : adminUser.getRoleId();

        Map<String, Object> permissions = Collections.emptyMap();
        if (role != null && role.getPermissions() != null) {
            try {
                permissions = objectMapper.readValue(role.getPermissions(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.error("Failed to parse permissions for role {}: {}", role.getId(), e.getMessage());
            }
        }

        return AdminUserDto.builder()
                .id(adminUser.getId())
                .name(adminUser.getName())
                .email(adminUser.getEmail())
                .department(adminUser.getDepartment())
                .roleId(adminUser.getRoleId())
                .roleName(roleName)
                .status(adminUser.getStatus())
                .avatar(adminUser.getAvatarUrl())
                .createdAt(adminUser.getCreatedAt())
                .lastLogin(adminUser.getLastLogin())
                .permissions(permissions)
                .build();
    }
}
