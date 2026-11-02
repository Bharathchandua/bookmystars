package com.example.bookmystars.security;

import com.example.bookmystars.model.AdminRole;
import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.repository.AdminRoleRepository;
import com.example.bookmystars.repository.AdminUserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Slf4j
@Component("rbac")
@RequiredArgsConstructor
public class AdminSecurityService {

    private final AdminUserRepository adminUserRepository;
    private final AdminRoleRepository adminRoleRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.security.root-admin-email:admin@bookmystars.com}")
    private String rootAdminEmail;

    /**
     * Evaluates whether the authenticated user has permission to perform a specific action in a module.
     *
     * @param authentication Current Spring Security authentication
     * @param module         Target module (e.g. "castings", "kyc", "escrow", "skills", "overview", "rbac")
     * @param action         Target action ("view", "create", "edit", "delete", "approve")
     * @return true if authorized, false otherwise
     */
    public boolean hasPermission(Authentication authentication, String module, String action) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // 1. Root Super Admin has full, unrestricted access across all platform modules
        if (isSuperAdmin(authentication)) {
            return true;
        }

        // 2. Identify the authenticated staff member
        String email = authentication.getName();
        if (email == null || email.isBlank()) {
            return false;
        }

        AdminUser staff = adminUserRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (staff == null || !"ACTIVE".equalsIgnoreCase(staff.getStatus())) {
            log.debug("RBAC check failed: Admin user '{}' not found or inactive", email);
            return false;
        }

        // Overview module default access: any active admin staff member can view overview desk
        if ("overview".equalsIgnoreCase(module) && "view".equalsIgnoreCase(action)) {
            return true;
        }

        // 3. Retrieve staff member's assigned role and evaluate module permissions
        String roleId = staff.getRoleId();
        if (roleId == null || roleId.isBlank()) {
            log.warn("Staff '{}' has no role assigned", email);
            return false;
        }

        AdminRole role = adminRoleRepository.findById(roleId).orElse(null);
        if (role == null || role.getPermissions() == null || role.getPermissions().isBlank()) {
            log.warn("Role '{}' not found or has empty permissions for staff '{}'", roleId, email);
            return false;
        }

        try {
            JsonNode rootNode = objectMapper.readTree(role.getPermissions());
            JsonNode moduleNode = rootNode.path(module.toLowerCase());
            if (moduleNode.isMissingNode() || moduleNode.isNull()) {
                log.debug("Role '{}' has no permissions block for module '{}'", roleId, module);
                return false;
            }

            boolean granted = moduleNode.path(action.toLowerCase()).asBoolean(false);
            if (!granted) {
                log.debug("RBAC: Staff '{}' ({}) denied '{}' on module '{}'", email, roleId, action, module);
            }
            return granted;
        } catch (Exception e) {
            log.error("Failed to parse role permissions JSON for role '{}': {}", roleId, e.getMessage());
            return false;
        }
    }

    /**
     * Checks if the authenticated principal possesses Super Admin authority.
     */
    public boolean isSuperAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Check granted authorities for ROLE_SUPER_ADMIN
        boolean hasSuperAdminAuthority = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()) ||
                               "SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));

        if (hasSuperAdminAuthority) {
            return true;
        }

        // Check if caller is the designated root admin email
        String email = authentication.getName();
        if (email != null && rootAdminEmail != null && email.trim().equalsIgnoreCase(rootAdminEmail.trim())) {
            return true;
        }

        // Check database record directly
        if (email != null) {
            AdminUser user = adminUserRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
            return user != null && "ROLE_SUPER_ADMIN".equalsIgnoreCase(user.getRoleId()) && "ACTIVE".equalsIgnoreCase(user.getStatus());
        }

        return false;
    }
}
