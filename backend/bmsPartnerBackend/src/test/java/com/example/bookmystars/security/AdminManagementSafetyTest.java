package com.example.bookmystars.security;

import com.example.bookmystars.dto.AdminRoleDto;
import com.example.bookmystars.dto.CreateAdminStaffRequest;
import com.example.bookmystars.model.AdminRole;
import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.repository.AdminRoleRepository;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.service.AdminAuthService;
import com.example.bookmystars.service.AdminManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminManagementSafetyTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private AdminRoleRepository adminRoleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AdminAuthService adminAuthService;

    @InjectMocks
    private AdminManagementService adminManagementService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminManagementService, "rootAdminEmail", "admin@bookmystars.com");
    }

    private void authenticateAs(String email, String role) {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                email,
                null,
                List.of(new SimpleGrantedAuthority(role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Non-Super Admin cannot create a staff account with ROLE_SUPER_ADMIN (privilege escalation blocked)")
    void nonSuperAdmin_cannotCreateSuperAdminAccount() {
        authenticateAs("staff@bookmystars.com", "ROLE_STAFF");

        CreateAdminStaffRequest request = new CreateAdminStaffRequest();
        request.setEmail("newadmin@bookmystars.com");
        request.setName("Attacker");
        request.setPassword("Password123!");
        request.setRoleId("ROLE_SUPER_ADMIN");

        when(adminUserRepository.existsByEmail("newadmin@bookmystars.com")).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> adminManagementService.createStaff(request));
        verify(adminUserRepository, never()).save(any());
    }

    @Test
    @DisplayName("Non-Super Admin cannot promote a user to ROLE_SUPER_ADMIN")
    void nonSuperAdmin_cannotPromoteUserToSuperAdmin() {
        authenticateAs("staff@bookmystars.com", "ROLE_STAFF");

        AdminUser targetUser = AdminUser.builder()
                .id(5L)
                .email("user5@bookmystars.com")
                .roleId("ROLE_CASTING_DIRECTOR")
                .build();

        when(adminUserRepository.findById(5L)).thenReturn(Optional.of(targetUser));

        assertThrows(AccessDeniedException.class, () -> adminManagementService.updateStaffRole(5L, "ROLE_SUPER_ADMIN"));
    }

    @Test
    @DisplayName("Cannot demote the last remaining active Super Admin account")
    void cannotDemote_lastActiveSuperAdmin() {
        authenticateAs("admin@bookmystars.com", "ROLE_SUPER_ADMIN");

        AdminUser superAdminUser = AdminUser.builder()
                .id(1L)
                .email("admin@bookmystars.com")
                .roleId("ROLE_SUPER_ADMIN")
                .build();

        when(adminUserRepository.findById(1L)).thenReturn(Optional.of(superAdminUser));
        when(adminUserRepository.countByRoleId("ROLE_SUPER_ADMIN")).thenReturn(1L);

        assertThrows(IllegalStateException.class, () -> adminManagementService.updateStaffRole(1L, "ROLE_STAFF"));
    }

    @Test
    @DisplayName("Cannot delete the last remaining active Super Admin account")
    void cannotDelete_lastActiveSuperAdmin() {
        authenticateAs("admin@bookmystars.com", "ROLE_SUPER_ADMIN");

        AdminUser superAdminUser = AdminUser.builder()
                .id(2L)
                .email("secondary.admin@bookmystars.com")
                .roleId("ROLE_SUPER_ADMIN")
                .build();

        when(adminUserRepository.findById(2L)).thenReturn(Optional.of(superAdminUser));
        when(adminUserRepository.countByRoleId("ROLE_SUPER_ADMIN")).thenReturn(1L);

        assertThrows(IllegalStateException.class, () -> adminManagementService.deleteStaff(2L));
        verify(adminUserRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Cannot delete the Root Super Admin account configured by the server")
    void cannotDelete_rootSuperAdminAccount() {
        authenticateAs("admin@bookmystars.com", "ROLE_SUPER_ADMIN");

        AdminUser rootSuperAdmin = AdminUser.builder()
                .id(1L)
                .email("admin@bookmystars.com")
                .roleId("ROLE_SUPER_ADMIN")
                .build();

        when(adminUserRepository.findById(1L)).thenReturn(Optional.of(rootSuperAdmin));

        assertThrows(IllegalArgumentException.class, () -> adminManagementService.deleteStaff(1L));
        verify(adminUserRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Cannot alter or override the permissions of the permanent Super Admin system role")
    void cannotAlter_superAdminSystemRole() {
        authenticateAs("admin@bookmystars.com", "ROLE_SUPER_ADMIN");

        AdminRoleDto roleDto = AdminRoleDto.builder()
                .id("ROLE_SUPER_ADMIN")
                .name("Compromised Super Admin")
                .build();

        assertThrows(IllegalArgumentException.class, () -> adminManagementService.saveRole(roleDto));
        verify(adminRoleRepository, never()).save(any());
    }

    @Test
    @DisplayName("Cannot delete the Super Admin system role")
    void cannotDelete_superAdminSystemRole() {
        authenticateAs("admin@bookmystars.com", "ROLE_SUPER_ADMIN");

        assertThrows(IllegalArgumentException.class, () -> adminManagementService.deleteRole("ROLE_SUPER_ADMIN"));
        verify(adminRoleRepository, never()).delete(any());
    }
}
