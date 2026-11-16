package com.example.bookmystars.service;

import com.example.bookmystars.dto.AdminCastingDto;
import com.example.bookmystars.dto.AdminOverviewMetricsDto;
import com.example.bookmystars.dto.AdminTalentKycDto;
import com.example.bookmystars.dto.AdminUserDto;
import com.example.bookmystars.dto.CreateAdminStaffRequest;
import com.example.bookmystars.dto.MasterProfessionRequest;
import com.example.bookmystars.dto.MasterProfessionResponse;
import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.model.CastingCall;
import com.example.bookmystars.model.CastingStatus;
import com.example.bookmystars.model.ProfileType;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.CastingCallRepository;
import com.example.bookmystars.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest
@ActiveProfiles("local")
public class AdminCrudTest {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private AdminManagementService adminManagementService;

    @Autowired
    private AdminOperationsService adminOperationsService;

    @Autowired
    private MasterProfessionService masterProfessionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CastingCallRepository castingCallRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Transactional
    public void testAdminCreationRoleAssignmentAndDutiesCrud() {
        long ts = System.currentTimeMillis() % 100000000;
        String superAdminEmail = "superadmin_" + ts + "@bookmystars.admin";
        String staffEmail = "moderator_" + ts + "@bookmystars.admin";

        // 0. Ensure a Super Admin identity is present in Security Context for administrative authorization
        AdminUser superAdmin = AdminUser.builder()
                .email(superAdminEmail)
                .password(passwordEncoder.encode("RootAdminPass@2026"))
                .name("Chief Executive Admin")
                .roleId("ROLE_SUPER_ADMIN")
                .department("EXECUTIVE")
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();
        superAdmin = adminUserRepository.save(superAdmin);

        Authentication superAdminAuth = new UsernamePasswordAuthenticationToken(
                superAdmin.getEmail(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"), new SimpleGrantedAuthority("SUPER_ADMIN"))
        );
        SecurityContextHolder.getContext().setAuthentication(superAdminAuth);

        // 1. CREATE ADMIN STAFF: Register new Admin staff via AdminManagementService
        CreateAdminStaffRequest staffReq = new CreateAdminStaffRequest();
        staffReq.setName("Talent Verification Officer");
        staffReq.setEmail(staffEmail);
        staffReq.setPassword("OfficerPassword@2026");
        staffReq.setRoleId("STAFF");
        staffReq.setDepartment("TALENT_OPERATIONS");

        AdminUserDto createdStaff = adminManagementService.createStaff(staffReq);
        Assertions.assertNotNull(createdStaff);
        Assertions.assertNotNull(createdStaff.getId());
        Assertions.assertEquals("STAFF", createdStaff.getRoleId());
        System.out.println("1. ADMIN STAFF CREATION SUCCESS: ID " + createdStaff.getId() + ", Email: " + createdStaff.getEmail());

        // 2. ROLE ASSIGNMENT: Update staff role from STAFF to VERIFICATION_MODERATOR
        AdminUserDto updatedStaff = adminManagementService.updateStaffRole(createdStaff.getId(), "ROLE_MODERATOR");
        Assertions.assertNotNull(updatedStaff);
        Assertions.assertEquals("ROLE_MODERATOR", updatedStaff.getRoleId());
        System.out.println("2. ROLE ASSIGNMENT SUCCESS: Staff ID " + updatedStaff.getId() + " new role is " + updatedStaff.getRoleId());

        // 3. ADMIN DUTY - TALENT KYC VERIFICATION:
        // Create an unverified talent in the platform
        User talent = User.builder()
                .email("applicant_actor_" + ts + "@talent.com")
                .fullName("Aarav Sharma")
                .password(passwordEncoder.encode("TalentPass@123"))
                .location("Mumbai, Maharashtra")
                .mobileNumber("98" + String.format("%08d", ts))
                .accountType(AccountType.TALENT)
                .verificationStatus("PENDING")
                .termsAccepted(true)
                .build();
        talent = userRepository.save(talent);

        // Officer reviews and verifies KYC
        AdminTalentKycDto kycResult = adminOperationsService.verifyTalentKyc(superAdminAuth, talent.getId(), true);
        Assertions.assertNotNull(kycResult);
        Assertions.assertTrue(Boolean.TRUE.equals(kycResult.getIdVerified()));
        System.out.println("3. ADMIN DUTY KYC VERIFICATION SUCCESS: Talent ID " + talent.getId() + " idVerified is " + kycResult.getIdVerified());

        // 4. ADMIN DUTY - CASTING CALL APPROVAL:
        // Brand/Production posts a casting call in PENDING review
        CastingCall casting = CastingCall.builder()
                .postedBy(talent)
                .title("Lead Male for Feature Film " + ts)
                .projectType("Feature Film")
                .roleType(ProfileType.ACTOR)
                .description("National award-winning director seeking lead character.")
                .budget(new BigDecimal("1500000"))
                .status(CastingStatus.IN_REVIEW)
                .createdAt(LocalDateTime.now())
                .build();
        casting = castingCallRepository.save(casting);

        // Admin reviews and approves the casting call
        AdminCastingDto approvedCasting = adminOperationsService.approveCasting(superAdminAuth, casting.getId());
        Assertions.assertNotNull(approvedCasting);
        Assertions.assertEquals(CastingStatus.OPEN, approvedCasting.getStatus());
        System.out.println("4. ADMIN DUTY CASTING APPROVAL SUCCESS: Casting ID " + casting.getId() + " status is " + approvedCasting.getStatus());

        // 5. ADMIN DUTY - PLATFORM GOVERNANCE METRICS:
        AdminOverviewMetricsDto metrics = adminOperationsService.getOverviewMetrics(superAdminAuth);
        Assertions.assertNotNull(metrics);
        Assertions.assertTrue(metrics.getTotalTalents() >= 1);
        System.out.println("5. ADMIN DUTY METRICS SUCCESS: Total Platform Talents: " + metrics.getTotalTalents() + ", Opportunities: " + metrics.getTotalCastings());

        // 6. ADMIN DUTY - MASTER DATA MANAGEMENT:
        MasterProfessionRequest profReq = new MasterProfessionRequest();
        profReq.setName("Cinematographer " + ts);
        profReq.setCraftCategory("Camera & Visuals");

        MasterProfessionResponse createdProf = masterProfessionService.createProfession(profReq);
        Assertions.assertNotNull(createdProf);
        Assertions.assertEquals("Cinematographer " + ts, createdProf.getName());

        masterProfessionService.toggleProfessionStatus(createdProf.getId());
        masterProfessionService.deleteProfession(createdProf.getId());
        System.out.println("6. ADMIN DUTY MASTER DATA SUCCESS: Profession created, toggled, and deleted.");

        // 7. CLEANUP: Delete the created test staff
        adminManagementService.deleteStaff(createdStaff.getId());
        var deletedStaff = adminUserRepository.findById(createdStaff.getId()).orElse(null);
        Assertions.assertNull(deletedStaff);
        System.out.println("7. ADMIN STAFF DELETION SUCCESS: Cleaned up staff ID " + createdStaff.getId());
    }
}
