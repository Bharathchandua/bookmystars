package com.example.bookmystars.security;

import com.example.bookmystars.model.AdminRole;
import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.repository.AdminRoleRepository;
import com.example.bookmystars.repository.AdminUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminSecurityServiceTest {

    @Mock
    private AdminUserRepository adminUserRepository;

    @Mock
    private AdminRoleRepository adminRoleRepository;

    @InjectMocks
    private AdminSecurityService adminSecurityService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminSecurityService, "rootAdminEmail", "admin@bookmystars.com");
    }

    @Test
    @DisplayName("Super Admin with ROLE_SUPER_ADMIN authority has full access to all modules and actions")
    void superAdmin_withAuthority_hasAccessToAllModules() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "admin@bookmystars.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))
        );

        assertTrue(adminSecurityService.hasPermission(auth, "castings", "approve"));
        assertTrue(adminSecurityService.hasPermission(auth, "kyc", "approve"));
        assertTrue(adminSecurityService.hasPermission(auth, "escrow", "approve"));
        assertTrue(adminSecurityService.hasPermission(auth, "rbac", "delete"));
        assertTrue(adminSecurityService.hasPermission(auth, "skills", "delete"));
        assertTrue(adminSecurityService.hasPermission(auth, "overview", "view"));
    }

    @Test
    @DisplayName("Designated Root Super Admin email has full access even without explicit authority list")
    void superAdmin_byEmail_hasFullAccess() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                "admin@bookmystars.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        assertTrue(adminSecurityService.hasPermission(auth, "castings", "approve"));
        assertTrue(adminSecurityService.hasPermission(auth, "rbac", "create"));
    }

    @Test
    @DisplayName("Casting Director can approve castings but cannot approve KYC or manage staff")
    void castingDirector_canApproveCastings_cannotAccessKycOrRbac() {
        String staffEmail = "casting@bookmystars.com";
        Authentication auth = new UsernamePasswordAuthenticationToken(
                staffEmail,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_STAFF"))
        );

        AdminUser staffUser = AdminUser.builder()
                .id(10L)
                .email(staffEmail)
                .roleId("ROLE_CASTING_DIRECTOR")
                .status("ACTIVE")
                .build();

        AdminRole castingRole = AdminRole.builder()
                .id("ROLE_CASTING_DIRECTOR")
                .name("Casting Director")
                .permissions("{\"castings\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"kyc\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"rbac\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false}}")
                .build();

        when(adminUserRepository.findByEmail(staffEmail)).thenReturn(Optional.of(staffUser));
        when(adminRoleRepository.findById("ROLE_CASTING_DIRECTOR")).thenReturn(Optional.of(castingRole));

        // Permitted casting actions
        assertTrue(adminSecurityService.hasPermission(auth, "castings", "view"));
        assertTrue(adminSecurityService.hasPermission(auth, "castings", "approve"));
        assertTrue(adminSecurityService.hasPermission(auth, "castings", "delete"));

        // Forbidden KYC and RBAC actions
        assertFalse(adminSecurityService.hasPermission(auth, "kyc", "view"));
        assertFalse(adminSecurityService.hasPermission(auth, "kyc", "approve"));
        assertFalse(adminSecurityService.hasPermission(auth, "rbac", "create"));
        assertFalse(adminSecurityService.hasPermission(auth, "rbac", "delete"));
    }

    @Test
    @DisplayName("KYC Compliance officer can view and approve KYC, but cannot approve castings or edit escrow")
    void kycOfficer_canApproveKyc_cannotApproveCastingsOrEscrow() {
        String staffEmail = "kyc@bookmystars.com";
        Authentication auth = new UsernamePasswordAuthenticationToken(
                staffEmail,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_STAFF"))
        );

        AdminUser staffUser = AdminUser.builder()
                .id(11L)
                .email(staffEmail)
                .roleId("ROLE_KYC_COMPLIANCE")
                .status("ACTIVE")
                .build();

        AdminRole kycRole = AdminRole.builder()
                .id("ROLE_KYC_COMPLIANCE")
                .name("KYC Compliance Lead")
                .permissions("{\"kyc\":{\"view\":true,\"create\":false,\"edit\":true,\"delete\":false,\"approve\":true},\"castings\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"escrow\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false}}")
                .build();

        when(adminUserRepository.findByEmail(staffEmail)).thenReturn(Optional.of(staffUser));
        when(adminRoleRepository.findById("ROLE_KYC_COMPLIANCE")).thenReturn(Optional.of(kycRole));

        // Permitted KYC actions
        assertTrue(adminSecurityService.hasPermission(auth, "kyc", "view"));
        assertTrue(adminSecurityService.hasPermission(auth, "kyc", "approve"));

        // Forbidden casting and escrow actions
        assertFalse(adminSecurityService.hasPermission(auth, "castings", "approve"));
        assertFalse(adminSecurityService.hasPermission(auth, "escrow", "approve"));
        assertFalse(adminSecurityService.hasPermission(auth, "escrow", "view"));
    }

    @Test
    @DisplayName("Inactive staff accounts are denied all permissions regardless of assigned role")
    void inactiveStaff_isDeniedAllPermissions() {
        String staffEmail = "inactive@bookmystars.com";
        Authentication auth = new UsernamePasswordAuthenticationToken(
                staffEmail,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_STAFF"))
        );

        AdminUser staffUser = AdminUser.builder()
                .id(12L)
                .email(staffEmail)
                .roleId("ROLE_CASTING_DIRECTOR")
                .status("DEACTIVATED")
                .build();

        when(adminUserRepository.findByEmail(staffEmail)).thenReturn(Optional.of(staffUser));

        assertFalse(adminSecurityService.hasPermission(auth, "castings", "view"));
        assertFalse(adminSecurityService.hasPermission(auth, "castings", "approve"));
    }

    @Test
    @DisplayName("Unauthenticated or null authentication returns false")
    void unauthenticatedOrNull_returnsFalse() {
        assertFalse(adminSecurityService.hasPermission(null, "castings", "view"));

        Authentication unauth = mock(Authentication.class);
        when(unauth.isAuthenticated()).thenReturn(false);
        assertFalse(adminSecurityService.hasPermission(unauth, "castings", "view"));
    }

    @Test
    @DisplayName("Skills catalog granular permissions check view, create, edit, delete individually")
    void skillsCatalog_enforcesSeparateCrudActions() {
        String staffEmail = "skills.editor@bookmystars.com";
        Authentication auth = new UsernamePasswordAuthenticationToken(
                staffEmail,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_STAFF"))
        );

        AdminUser staffUser = AdminUser.builder()
                .id(15L)
                .email(staffEmail)
                .roleId("ROLE_SKILLS_EDITOR")
                .status("ACTIVE")
                .build();

        // Permitted: view, create, edit. Forbidden: delete
        AdminRole editorRole = AdminRole.builder()
                .id("ROLE_SKILLS_EDITOR")
                .name("Skills Editor")
                .permissions("{\"skills\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":false,\"approve\":false}}")
                .build();

        when(adminUserRepository.findByEmail(staffEmail)).thenReturn(Optional.of(staffUser));
        when(adminRoleRepository.findById("ROLE_SKILLS_EDITOR")).thenReturn(Optional.of(editorRole));

        assertTrue(adminSecurityService.hasPermission(auth, "skills", "view"));
        assertTrue(adminSecurityService.hasPermission(auth, "skills", "create"));
        assertTrue(adminSecurityService.hasPermission(auth, "skills", "edit"));
        assertFalse(adminSecurityService.hasPermission(auth, "skills", "delete"));
    }
}
