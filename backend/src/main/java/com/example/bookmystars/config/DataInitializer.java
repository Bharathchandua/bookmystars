package com.example.bookmystars.config;

import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.CastingApplicationRepository;
import com.example.bookmystars.repository.CastingCallRepository;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.AdminRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CastingCallRepository castingCallRepository;
    private final CastingApplicationRepository castingApplicationRepository;
    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final AdminRoleRepository adminRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            upgradeChatMessagesSchema();
            initOpportunitiesData();
            initAdminRbacData();
        } catch (Exception e) {
            log.error("Error during database initialization: {}", e.getMessage(), e);
        }
    }

    private void upgradeChatMessagesSchema() {
        try {
            jdbcTemplate.execute("ALTER TABLE chat_messages ALTER COLUMN booking_id DROP NOT NULL");
            log.info("chat_messages: booking_id successfully updated to nullable.");
        } catch (Exception e) {
            log.debug("booking_id constraint update: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS recipient_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS opportunity_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS conversation_key VARCHAR(255)");
            log.info("chat_messages: direct messaging columns verified.");
        } catch (Exception e) {
            log.debug("columns verification: {}", e.getMessage());
        }
    }

    private void initOpportunitiesData() {
        boolean alreadySeeded = castingCallRepository.findAll().stream()
                .anyMatch(c -> "Shadows of Truth".equalsIgnoreCase(c.getTitle()));
        if (alreadySeeded) {
            log.info("Cinema opportunities already seeded in database ({} total records).", castingCallRepository.count());
            return;
        }

        log.info("Seeding rich cinema production opportunities into database...");

        // Find or create a production studio / casting director user
        User producer = userRepository.findByEmail("production@bookmystars.com")
                .orElseGet(() -> {
                    // Try to find any existing user with PROFESSIONAL or TALENT account
                    return userRepository.findAll().stream().findFirst().orElseGet(() -> {
                        Set<ProfileType> roles = new HashSet<>();
                        roles.add(ProfileType.DIRECTOR);
                        roles.add(ProfileType.PRODUCER);

                        User newUser = User.builder()
                                .accountType(AccountType.PROFESSIONAL)
                                .fullName("BookMyStars Studios")
                                .stageName("BMS Cinema Hub")
                                .email("production@bookmystars.com")
                                .mobileNumber("9999900001")
                                .password(passwordEncoder.encode("Password@123"))
                                .profileTypes(roles)
                                .build();
                        return userRepository.save(newUser);
                    });
                });

        CastingCall call1 = CastingCall.builder()
                .postedBy(producer)
                .title("Shadows of Truth")
                .projectType("Feature Film")
                .roleType(ProfileType.ACTOR)
                .customCraft("Lead Actor (Male)")
                .description("Looking for a lead actor (Male) aged 25–35 in a thrilling suspense drama directed by award-winning crew.")
                .requirements("Prepare a 2-minute dramatic monologue\nMethod acting experience preferred\nAvailable for shoot: June–October 2024\nMumbai-based or willing to relocate")
                .location("Mumbai")
                .budget(new BigDecimal("750000"))
                .posterUrl("https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80")
                .applicationDeadline(LocalDate.now().plusDays(25))
                .shootStartDate(LocalDate.now().plusMonths(1))
                .status(CastingStatus.OPEN)
                .build();

        CastingCall call2 = CastingCall.builder()
                .postedBy(producer)
                .title("Dil Ki Baat – Season 2")
                .projectType("Web Series")
                .roleType(ProfileType.ACTOR)
                .customCraft("Supporting Role (Male)")
                .description("Supporting role (Male) in a romantic comedy web series on top OTT streaming platform.")
                .requirements("Comedy timing and improvisational skills\nAge group: 22–30 years\nPrevious web series experience a plus\nFluent in Hindi")
                .location("Delhi")
                .budget(new BigDecimal("120000"))
                .posterUrl("https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80")
                .applicationDeadline(LocalDate.now().plusDays(30))
                .shootStartDate(LocalDate.now().plusMonths(1).plusDays(5))
                .status(CastingStatus.OPEN)
                .build();

        CastingCall call3 = CastingCall.builder()
                .postedBy(producer)
                .title("Premium Fragrance – TVC")
                .projectType("Commercial")
                .roleType(ProfileType.MODEL)
                .customCraft("Main Lead")
                .description("Looking for a confident and expressive male actor/model for international luxury perfume campaign.")
                .requirements("Professional headshots and portfolio required\nTall (5'10\" and above), well-groomed\nNo conflicting brand contracts\n2-day shoot: Mumbai")
                .location("Mumbai")
                .budget(new BigDecimal("85000"))
                .posterUrl("https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80")
                .applicationDeadline(LocalDate.now().plusDays(20))
                .shootStartDate(LocalDate.now().plusDays(28))
                .status(CastingStatus.OPEN)
                .build();

        CastingCall call4 = CastingCall.builder()
                .postedBy(producer)
                .title("The Last Stand")
                .projectType("Short Film")
                .roleType(ProfileType.ACTOR)
                .customCraft("Lead Role")
                .description("Lead role in an intense action short film selected for premier national and international film festivals.")
                .requirements("Physical fitness essential — action sequences\nAge 30–45 preferred\nShort film/theatre background welcome\nShoot: Bangalore, 3 days")
                .location("Bangalore")
                .budget(new BigDecimal("35000"))
                .posterUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80")
                .applicationDeadline(LocalDate.now().plusDays(15))
                .shootStartDate(LocalDate.now().plusDays(22))
                .status(CastingStatus.OPEN)
                .build();

        castingCallRepository.save(call1);
        castingCallRepository.save(call2);
        castingCallRepository.save(call3);
        castingCallRepository.save(call4);

        log.info("Successfully seeded 4 cinema casting opportunities into PostgreSQL database.");
    }

    private void initAdminRbacData() {
        try {
            // 1. Seed System Default Roles if not already present
            if (adminRoleRepository.count() == 0) {
                AdminRole superAdminRole = AdminRole.builder()
                        .id("ROLE_SUPER_ADMIN")
                        .name("Super Admin (Executive)")
                        .description("Full root cluster privileges across all platform subsystems, user auditing, and master key management.")
                        .color("#ee008f")
                        .isSystem(true)
                        .permissions("{\"castings\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"kyc\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"escrow\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"media\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"talents\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"reviews\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"auditing\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"rbac\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"security\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"broadcast\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"settings\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true}}")
                        .build();

                AdminRole castingDirectorRole = AdminRole.builder()
                        .id("ROLE_CASTING_DIRECTOR")
                        .name("Casting Director")
                        .description("Review casting notices, review talent submissions, approve production budgets, and schedule auditions.")
                        .color("#8b5cf6")
                        .isSystem(true)
                        .permissions("{\"castings\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"talents\":{\"view\":true,\"create\":false,\"edit\":true,\"delete\":false,\"approve\":false},\"kyc\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"media\":{\"view\":true,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"escrow\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"rbac\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false}}")
                        .build();

                AdminRole contentModeratorRole = AdminRole.builder()
                        .id("ROLE_CONTENT_MODERATOR")
                        .name("Content Moderator")
                        .description("Screen media submissions, review audition tapes, enforce community guidelines, and moderate user reports.")
                        .color("#3b82f6")
                        .isSystem(true)
                        .permissions("{\"media\":{\"view\":true,\"create\":false,\"edit\":true,\"delete\":true,\"approve\":true},\"reviews\":{\"view\":true,\"create\":false,\"edit\":true,\"delete\":true,\"approve\":true},\"talents\":{\"view\":true,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"castings\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"escrow\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"rbac\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false}}")
                        .build();

                AdminRole financeOfficerRole = AdminRole.builder()
                        .id("ROLE_FINANCE_OFFICER")
                        .name("Finance & Escrow Officer")
                        .description("Oversee locked milestone funds, authorize talent disbursements, inspect invoice trails, and resolve refund claims.")
                        .color("#10b981")
                        .isSystem(true)
                        .permissions("{\"escrow\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":false,\"approve\":true},\"auditing\":{\"view\":true,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"castings\":{\"view\":true,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"talents\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"rbac\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false}}")
                        .build();

                AdminRole kycComplianceRole = AdminRole.builder()
                        .id("ROLE_KYC_COMPLIANCE")
                        .name("KYC Compliance Lead")
                        .description("Verify government identification, validate production trade licenses, and issue rosette badges.")
                        .color("#f59e0b")
                        .isSystem(true)
                        .permissions("{\"kyc\":{\"view\":true,\"create\":false,\"edit\":true,\"delete\":false,\"approve\":true},\"talents\":{\"view\":true,\"create\":false,\"edit\":true,\"delete\":false,\"approve\":false},\"auditing\":{\"view\":true,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"escrow\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false},\"rbac\":{\"view\":false,\"create\":false,\"edit\":false,\"delete\":false,\"approve\":false}}")
                        .build();

                adminRoleRepository.save(superAdminRole);
                adminRoleRepository.save(castingDirectorRole);
                adminRoleRepository.save(contentModeratorRole);
                adminRoleRepository.save(financeOfficerRole);
                adminRoleRepository.save(kycComplianceRole);
                log.info("Default Admin RBAC Roles successfully initialized in database.");
            }

            // 2. Seed Master Super Admin if not present
            if (!adminUserRepository.existsByEmail("admin@bookmystars.com")) {
                AdminUser masterSuperAdmin = AdminUser.builder()
                        .name("Vikram Malhotra")
                        .email("admin@bookmystars.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .department("Executive Management")
                        .roleId("ROLE_SUPER_ADMIN")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80")
                        .createdAt(java.time.LocalDateTime.now())
                        .build();
                adminUserRepository.save(masterSuperAdmin);
                log.info("Master Super Admin account seeded in PostgreSQL: admin@bookmystars.com / Admin@123");
            }

            // 3. Seed default department officers for initial testing
            if (!adminUserRepository.existsByEmail("rhea.sen@bookmystars.com")) {
                adminUserRepository.save(AdminUser.builder()
                        .name("Rhea Sen")
                        .email("rhea.sen@bookmystars.com")
                        .password(passwordEncoder.encode("Rhea@123"))
                        .department("Casting Operations")
                        .roleId("ROLE_CASTING_DIRECTOR")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80")
                        .createdAt(java.time.LocalDateTime.now())
                        .build());
            }

            if (!adminUserRepository.existsByEmail("pooja.finance@bookmystars.com")) {
                adminUserRepository.save(AdminUser.builder()
                        .name("Pooja Hegde")
                        .email("pooja.finance@bookmystars.com")
                        .password(passwordEncoder.encode("Pooja@123"))
                        .department("Finance & Accounts")
                        .roleId("ROLE_FINANCE_OFFICER")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80")
                        .createdAt(java.time.LocalDateTime.now())
                        .build());
            }

            if (!adminUserRepository.existsByEmail("arjun.m@bookmystars.com")) {
                adminUserRepository.save(AdminUser.builder()
                        .name("Arjun Mehta")
                        .email("arjun.m@bookmystars.com")
                        .password(passwordEncoder.encode("Arjun@123"))
                        .department("Trust & Safety")
                        .roleId("ROLE_CONTENT_MODERATOR")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80")
                        .createdAt(java.time.LocalDateTime.now())
                        .build());
            }

            if (!adminUserRepository.existsByEmail("dev.patel@bookmystars.com")) {
                adminUserRepository.save(AdminUser.builder()
                        .name("Dev Patel")
                        .email("dev.patel@bookmystars.com")
                        .password(passwordEncoder.encode("Dev@123"))
                        .department("KYC Compliance")
                        .roleId("ROLE_KYC_COMPLIANCE")
                        .status("ACTIVE")
                        .avatarUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80")
                        .createdAt(java.time.LocalDateTime.now())
                        .build());
            }

        } catch (Exception e) {
            log.error("Failed to seed Admin RBAC data: {}", e.getMessage(), e);
        }
    }
}
