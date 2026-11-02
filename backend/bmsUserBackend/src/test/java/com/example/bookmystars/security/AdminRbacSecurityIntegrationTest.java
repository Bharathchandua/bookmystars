package com.example.bookmystars.security;

import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.AdminRoleRepository;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.CastingApplicationRepository;
import com.example.bookmystars.repository.CastingCallRepository;
import com.example.bookmystars.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class AdminRbacSecurityIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private AdminRoleRepository adminRoleRepository;

    @Autowired
    private CastingCallRepository castingCallRepository;

    @Autowired
    private CastingApplicationRepository castingApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    private Long testPendingCastingId;

    @BeforeEach
    void setupTestData() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // Ensure test staff users exist in PostgreSQL database
        if (!adminUserRepository.existsByEmail("casting.officer@bookmystars.com")) {
            adminUserRepository.save(AdminUser.builder()
                    .name("Casting Officer")
                    .email("casting.officer@bookmystars.com")
                    .password("$2a$10$dummyHash")
                    .department("Casting")
                    .roleId("ROLE_CASTING_DIRECTOR")
                    .status("ACTIVE")
                    .build());
        }

        if (!adminUserRepository.existsByEmail("kyc.officer@bookmystars.com")) {
            adminUserRepository.save(AdminUser.builder()
                    .name("KYC Officer")
                    .email("kyc.officer@bookmystars.com")
                    .password("$2a$10$dummyHash")
                    .department("Compliance")
                    .roleId("ROLE_KYC_COMPLIANCE")
                    .status("ACTIVE")
                    .build());
        }

        if (!adminUserRepository.existsByEmail("finance.officer@bookmystars.com")) {
            adminUserRepository.save(AdminUser.builder()
                    .name("Finance Officer")
                    .email("finance.officer@bookmystars.com")
                    .password("$2a$10$dummyHash")
                    .department("Finance")
                    .roleId("ROLE_FINANCE_OFFICER")
                    .status("ACTIVE")
                    .build());
        }

        // Clean up any stale test casting calls first to guarantee a clean slate
        cleanUpTestData();

        // Create an isolated test client user so real database accounts are never contaminated
        User clientUser = userRepository.findByEmail("integration.isolated.client@bookmystars.test").orElseGet(() ->
                userRepository.save(User.builder()
                        .fullName("Integration Client")
                        .email("integration.isolated.client@bookmystars.test")
                        .mobileNumber("9876543210")
                        .password("$2a$10$dummyHash")
                        .accountType(AccountType.CLIENT)
                        .location("Mumbai")
                        .termsAccepted(true)
                        .build())
        );

        CastingCall pendingCall = castingCallRepository.save(CastingCall.builder()
                .title("Integration Test Feature Film")
                .projectType("Feature Film")
                .roleType(ProfileType.ACTOR)
                .budget(new BigDecimal("500000"))
                .status(CastingStatus.IN_REVIEW)
                .postedBy(clientUser)
                .createdAt(LocalDateTime.now())
                .build());
        testPendingCastingId = pendingCall.getId();
    }

    @org.junit.jupiter.api.AfterEach
    void cleanUpTestData() {
        if (testPendingCastingId != null) {
            castingCallRepository.findById(testPendingCastingId).ifPresent(c -> {
                castingApplicationRepository.deleteByCastingCallId(c.getId());
                castingCallRepository.delete(c);
            });
        }
        castingCallRepository.findAll().stream()
                .filter(c -> "Integration Test Feature Film".equals(c.getTitle()) || "Side Effect Invariant Test Call".equals(c.getTitle()))
                .forEach(c -> {
                    castingApplicationRepository.deleteByCastingCallId(c.getId());
                    castingCallRepository.delete(c);
                });
    }

    @Test
    @DisplayName("Scenario 1: Super Admin can access all authorized administrative modules")
    @WithMockUser(username = "admin@bookmystars.com", roles = {"SUPER_ADMIN"})
    void scenario1_superAdminCanAccessAllModules() throws Exception {
        // Staff management
        mockMvc.perform(get("/api/admin/staff"))
                .andExpect(status().isOk());

        // Dynamic Roles
        mockMvc.perform(get("/api/admin/roles"))
                .andExpect(status().isOk());

        // Casting screening
        mockMvc.perform(get("/api/admin/castings"))
                .andExpect(status().isOk());

        // Talent KYC
        mockMvc.perform(get("/api/admin/talents/kyc"))
                .andExpect(status().isOk());

        // Overview metrics (all fields visible, not masked)
        mockMvc.perform(get("/api/admin/metrics/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.escrowLockedAmount").isString());
    }

    @Test
    @DisplayName("Scenario 2: Casting staff can access permitted casting operations")
    @WithMockUser(username = "casting.officer@bookmystars.com", roles = {"STAFF"})
    void scenario2_castingStaffCanAccessPermittedCastingOperations() throws Exception {
        mockMvc.perform(get("/api/admin/castings"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/castings/" + testPendingCastingId + "/approve"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Scenario 3: Casting staff cannot access KYC operations without permission (403 Forbidden)")
    @WithMockUser(username = "casting.officer@bookmystars.com", roles = {"STAFF"})
    void scenario3_castingStaffCannotAccessKycOperations() throws Exception {
        mockMvc.perform(get("/api/admin/talents/kyc"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Scenario 4: KYC staff can access permitted KYC operations")
    @WithMockUser(username = "kyc.officer@bookmystars.com", roles = {"STAFF"})
    void scenario4_kycStaffCanAccessPermittedKycOperations() throws Exception {
        mockMvc.perform(get("/api/admin/talents/kyc"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Scenario 5: KYC staff cannot approve castings without permission (403 Forbidden)")
    @WithMockUser(username = "kyc.officer@bookmystars.com", roles = {"STAFF"})
    void scenario5_kycStaffCannotApproveCastings() throws Exception {
        mockMvc.perform(post("/api/admin/castings/" + testPendingCastingId + "/approve"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Scenario 6: Finance staff cannot access unauthorized KYC or casting operations")
    @WithMockUser(username = "finance.officer@bookmystars.com", roles = {"STAFF"})
    void scenario6_financeStaffCannotAccessUnauthorizedModules() throws Exception {
        // Finance officer lacks KYC permission
        mockMvc.perform(get("/api/admin/talents/kyc"))
                .andExpect(status().isForbidden());

        // Finance officer lacks casting approval permission
        mockMvc.perform(post("/api/admin/castings/" + testPendingCastingId + "/approve"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Scenario 7: Departmental staff cannot create or delete other staff accounts")
    @WithMockUser(username = "casting.officer@bookmystars.com", roles = {"STAFF"})
    void scenario7_departmentalStaffCannotManageStaffAccounts() throws Exception {
        String staffPayload = "{\"name\":\"Hacker\",\"email\":\"hack@bookmystars.com\",\"password\":\"Pass123!\",\"department\":\"Ops\",\"roleId\":\"ROLE_STAFF\"}";

        mockMvc.perform(post("/api/admin/staff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(staffPayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(delete("/api/admin/staff/999"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Scenario 8: Departmental staff cannot modify roles or permissions")
    @WithMockUser(username = "kyc.officer@bookmystars.com", roles = {"STAFF"})
    void scenario8_departmentalStaffCannotModifyRoles() throws Exception {
        String rolePayload = "{\"id\":\"ROLE_CUSTOM_HACK\",\"name\":\"Hacker Role\"}";

        mockMvc.perform(post("/api/admin/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rolePayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Scenario 9: Regular users (Talents) cannot access administrative endpoints (403 Forbidden)")
    @WithMockUser(username = "talent.user@bookmystars.com", roles = {"USER", "TALENT"})
    void scenario9_regularUsersCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/castings"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(get("/api/admin/staff"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Scenario 10: Unauthenticated requests to admin endpoints return 401 Unauthorized")
    void scenario10_unauthenticatedRequestsReturn401() throws Exception {
        mockMvc.perform(get("/api/admin/castings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Scenario 11: Non-super admin cannot escalate privileges to Super Admin")
    @WithMockUser(username = "casting.officer@bookmystars.com", roles = {"STAFF"})
    void scenario11_nonSuperAdminCannotEscalatePrivileges() throws Exception {
        String escalatePayload = "{\"roleId\":\"ROLE_SUPER_ADMIN\"}";

        mockMvc.perform(put("/api/admin/staff/1/role")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(escalatePayload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("Scenario 12: Unauthorized requests do NOT execute business operations (status unchanged in DB)")
    @WithMockUser(username = "kyc.officer@bookmystars.com", roles = {"STAFF"})
    void scenario12_unauthorizedRequestsDoNotMutateDatabaseRecord() throws Exception {
        User clientUser = userRepository.findAll().stream().findFirst().orElseThrow();

        // Create fresh pending casting
        CastingCall freshCall = castingCallRepository.save(CastingCall.builder()
                .title("Side Effect Invariant Test Call")
                .projectType("Short Film")
                .roleType(ProfileType.ACTOR)
                .postedBy(clientUser)
                .status(CastingStatus.IN_REVIEW)
                .build());

        Long freshId = freshCall.getId();

        // KYC officer attempts to approve casting notice (forbidden)
        mockMvc.perform(post("/api/admin/castings/" + freshId + "/approve"))
                .andExpect(status().isForbidden());

        // Verify that database state was NOT mutated
        CastingCall callAfterAttempt = castingCallRepository.findById(freshId).orElseThrow();
        assertEquals(CastingStatus.IN_REVIEW, callAfterAttempt.getStatus(),
                "Critical Security Invariant: Database record status MUST NOT change on 403 Forbidden!");
    }
}
