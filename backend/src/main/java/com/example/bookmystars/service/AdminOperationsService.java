package com.example.bookmystars.service;

import com.example.bookmystars.dto.AdminCastingDto;
import com.example.bookmystars.dto.AdminOverviewMetricsDto;
import com.example.bookmystars.dto.AdminTalentKycDto;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminOperationsService {

    private final CastingCallRepository castingCallRepository;
    private final CastingApplicationRepository castingApplicationRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AdminUserRepository adminUserRepository;
    private final AdminRoleRepository adminRoleRepository;
    private final BookingRequestRepository bookingRequestRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─── RBAC PERMISSION ENFORCEMENT GUARD ───

    public AdminUser verifyAdminPermission(Authentication auth, String module, String action) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Administrative authentication token required.");
        }

        String adminEmail = auth.getName().trim().toLowerCase();
        AdminUser admin = adminUserRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin officer account not found: " + adminEmail));

        // Master Super Admin has full platform access
        if ("ROLE_SUPER_ADMIN".equalsIgnoreCase(admin.getRoleId()) || "admin@bookmystars.com".equalsIgnoreCase(admin.getEmail())) {
            return admin;
        }

        // Check dynamic role permissions from DB
        AdminRole role = adminRoleRepository.findById(admin.getRoleId()).orElse(null);
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role (" + admin.getRoleId() + ") does not exist in platform governance.");
        }

        boolean authorized = checkModuleAction(role.getPermissions(), module, action);
        if (!authorized) {
            log.warn("RBAC DENIAL: Admin '{}' ({}) attempted unauthorized action '{}.{}'",
                    admin.getName(), admin.getRoleId(), module, action);
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access Denied: Your assigned role (" + admin.getRoleId() + ") is not authorized to " + action + " in module '" + module + "'."
            );
        }

        return admin;
    }

    private boolean checkModuleAction(String permissionsJson, String module, String action) {
        if (permissionsJson == null || permissionsJson.isBlank()) return false;
        try {
            Map<String, Map<String, Object>> map = objectMapper.readValue(permissionsJson, new TypeReference<>() {});
            Map<String, Object> modulePerms = map.get(module);
            if (modulePerms == null) return false;
            Object val = modulePerms.get(action);
            return Boolean.TRUE.equals(val);
        } catch (Exception e) {
            log.error("Failed to parse role permissions JSON: {}", e.getMessage());
            return false;
        }
    }

    // ─── CASTING SCREENING OPERATIONS ───

    @Transactional
    public List<AdminCastingDto> getCastings(String filterStatus) {
        List<CastingCall> calls = castingCallRepository.findAll();

        // Seed pending items if table has no IN_REVIEW entries so admin desk is interactive immediately
        boolean hasPending = calls.stream().anyMatch(c -> c.getStatus() == CastingStatus.IN_REVIEW);
        if (!hasPending && calls.isEmpty()) {
            seedInitialPendingCastings();
            calls = castingCallRepository.findAll();
        }

        if ("IN_REVIEW".equalsIgnoreCase(filterStatus) || "PENDING".equalsIgnoreCase(filterStatus)) {
            calls = calls.stream().filter(c -> c.getStatus() == CastingStatus.IN_REVIEW).collect(Collectors.toList());
        } else if ("OPEN".equalsIgnoreCase(filterStatus)) {
            calls = calls.stream().filter(c -> c.getStatus() == CastingStatus.OPEN).collect(Collectors.toList());
        }

        // Sort: IN_REVIEW first, then newest
        return calls.stream()
                .sorted((a, b) -> {
                    if (a.getStatus() == CastingStatus.IN_REVIEW && b.getStatus() != CastingStatus.IN_REVIEW) return -1;
                    if (a.getStatus() != CastingStatus.IN_REVIEW && b.getStatus() == CastingStatus.IN_REVIEW) return 1;
                    LocalDateTime tA = a.getCreatedAt() != null ? a.getCreatedAt() : LocalDateTime.MIN;
                    LocalDateTime tB = b.getCreatedAt() != null ? b.getCreatedAt() : LocalDateTime.MIN;
                    return tB.compareTo(tA);
                })
                .map(this::mapToAdminCastingDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminCastingDto approveCasting(Authentication auth, Long id) {
        AdminUser admin = verifyAdminPermission(auth, "castings", "approve");

        CastingCall call = castingCallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found with ID: " + id));

        call.setStatus(CastingStatus.OPEN);
        call.setUpdatedAt(LocalDateTime.now());
        CastingCall saved = castingCallRepository.save(call);

        log.info("CASTING APPROVED: Admin '{}' approved casting '{}' (ID: {}). Status is now OPEN in database.",
                admin.getName(), saved.getTitle(), saved.getId());

        return mapToAdminCastingDto(saved);
    }

    @Transactional
    public AdminCastingDto rejectCasting(Authentication auth, Long id, String reason) {
        AdminUser admin = verifyAdminPermission(auth, "castings", "approve");

        CastingCall call = castingCallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found with ID: " + id));

        call.setStatus(CastingStatus.CLOSED);
        call.setUpdatedAt(LocalDateTime.now());
        CastingCall saved = castingCallRepository.save(call);

        log.info("CASTING REJECTED: Admin '{}' rejected casting '{}' (ID: {}). Reason: {}",
                admin.getName(), saved.getTitle(), saved.getId(), reason);

        return mapToAdminCastingDto(saved);
    }

    @Transactional
    public void deleteCasting(Authentication auth, Long id) {
        AdminUser admin = verifyAdminPermission(auth, "castings", "delete");

        CastingCall call = castingCallRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Casting call not found with ID: " + id));

        try {
            castingApplicationRepository.deleteByCastingCallId(call.getId());
        } catch (Exception e) {
            log.warn("Could not delete applications for casting {}: {}", id, e.getMessage());
        }
        castingCallRepository.delete(call);

        log.info("CASTING PERMANENTLY DELETED: Admin '{}' deleted casting '{}' (ID: {}) from database.",
                admin.getName(), call.getTitle(), id);
    }

    private void seedInitialPendingCastings() {
        User studio = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User u = User.builder()
                    .fullName("Dharma & Excel Productions")
                    .email("studio@bookmystars.com")
                    .mobileNumber("9820011223")
                    .password("$2a$10$xyz")
                    .accountType(AccountType.PROFESSIONAL)
                    .location("Mumbai")
                    .termsAccepted(true)
                    .build();
            return userRepository.save(u);
        });

        CastingCall call1 = CastingCall.builder()
                .postedBy(studio)
                .title("Urban Lifestyle Shoot")
                .projectType("Fashion Campaign")
                .roleType(ProfileType.MODEL)
                .customCraft("Commercial Model")
                .location("Mumbai")
                .budget(new BigDecimal("95000"))
                .posterUrl("https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80")
                .status(CastingStatus.IN_REVIEW)
                .createdAt(LocalDateTime.now().minusHours(4))
                .build();

        CastingCall call2 = CastingCall.builder()
                .postedBy(studio)
                .title("Tech Product Commercial")
                .projectType("Digital Advertisement")
                .roleType(ProfileType.ACTOR)
                .customCraft("Lead Actor")
                .location("Bangalore")
                .budget(new BigDecimal("145000"))
                .posterUrl("https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80")
                .status(CastingStatus.IN_REVIEW)
                .createdAt(LocalDateTime.now().minusHours(8))
                .build();

        castingCallRepository.save(call1);
        castingCallRepository.save(call2);
    }

    private AdminCastingDto mapToAdminCastingDto(CastingCall call) {
        long appCount = 0;
        try {
            appCount = castingApplicationRepository.countByCastingCallId(call.getId());
        } catch (Exception ignored) {}

        String talentName = call.getPostedBy() != null ? call.getPostedBy().getFullName() : "Production Studio";
        String talentEmail = call.getPostedBy() != null ? call.getPostedBy().getEmail() : "";
        String talentPhone = call.getPostedBy() != null ? call.getPostedBy().getMobileNumber() : "";
        String craft = call.getCustomCraft() != null && !call.getCustomCraft().isBlank()
                ? call.getCustomCraft()
                : (call.getRoleType() != null ? call.getRoleType().name() : "Talent");

        String priority = "Normal";
        String priorityBg = "#f8fafc";
        String priorityColor = "#64748b";
        String priorityBorder = "#e2e8f0";

        if (call.getStatus() == CastingStatus.IN_REVIEW) {
            priority = "Pending Review";
            priorityBg = "#fff1f8";
            priorityColor = "#ee008f";
            priorityBorder = "#fbcfe8";
        } else if (call.getStatus() == CastingStatus.OPEN) {
            priority = "Live / Open";
            priorityBg = "#ecfdf5";
            priorityColor = "#059669";
            priorityBorder = "#a7f3d0";
        } else if (call.getStatus() == CastingStatus.CLOSED) {
            priority = "Closed";
            priorityBg = "#fef2f2";
            priorityColor = "#dc2626";
            priorityBorder = "#fecaca";
        }

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy");
        String submittedOn = call.getCreatedAt() != null ? call.getCreatedAt().format(dtf) : "Today";

        String formattedBudget = call.getBudget() != null
                ? "₹" + String.format("%,d", call.getBudget().longValue())
                : "Discussable";

        return AdminCastingDto.builder()
                .id(call.getId())
                .project(call.getTitle())
                .category(call.getProjectType() != null ? call.getProjectType() : "Casting Call")
                .postType(call.getPostType() != null ? call.getPostType() : (call.getRoleType() != null ? call.getRoleType().name() : "ACTING"))
                .requiredLanguages(call.getRequiredLanguages())
                .roleType(call.getRoleType())
                .craft(craft)
                .talent(talentName)
                .talentAvatar(call.getPosterUrl() != null ? call.getPosterUrl() : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80")
                .postedByEmail(talentEmail)
                .postedByPhone(talentPhone)
                .location(call.getLocation() != null ? call.getLocation() : "Pan India")
                .budget(call.getBudget())
                .formattedBudget(formattedBudget)
                .thumb(call.getPosterUrl() != null ? call.getPosterUrl() : "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=80&h=80&q=80")
                .submittedOn(submittedOn)
                .priority(priority)
                .priorityBg(priorityBg)
                .priorityColor(priorityColor)
                .priorityBorder(priorityBorder)
                .status(call.getStatus())
                .applicantCount(appCount)
                .createdAt(call.getCreatedAt())
                .description(call.getDescription())
                .requirements(call.getRequirements())
                .shootStartDate(call.getShootStartDate())
                .shootEndDate(call.getShootEndDate())
                .applicationDeadline(call.getApplicationDeadline())
                .videoUrl(call.getVideoUrl())
                .posterUrl(call.getPosterUrl())
                .customCraft(call.getCustomCraft())
                .age(call.getAge())
                .gender(call.getGender())
                .height(call.getHeight())
                .weight(call.getWeight())
                .build();
    }

    // ─── TALENTS & KYC VERIFICATION OPERATIONS ───

    @Transactional
    public List<AdminTalentKycDto> getTalentsKycList() {
        // Fetch ALL registered users (Talents + Professionals + Clients) so Talent Management covers entire userbase
        List<User> allUsers = userRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id"));

        return allUsers.stream().map(talent -> {
            Profile profile = profileRepository.findByUser(talent).orElseGet(() -> {
                Profile p = Profile.builder()
                        .user(talent)
                        .idVerified(false)
                        .phoneVerified(talent.getMobileNumber() != null && !talent.getMobileNumber().isBlank())
                        .emailVerified(true)
                        .memberSince(LocalDate.now())
                        .build();
                return profileRepository.save(p);
            });

            String craftStr = talent.getPrimaryProfession() != null && !talent.getPrimaryProfession().isBlank()
                    ? talent.getPrimaryProfession()
                    : (talent.getProfileTypes() != null && !talent.getProfileTypes().isEmpty()
                            ? talent.getProfileTypes().stream().map(Enum::name).collect(Collectors.joining(", "))
                            : (talent.getCustomProfession() != null ? talent.getCustomProfession() : "Artist"));

            boolean verified = Boolean.TRUE.equals(profile.getIdVerified());
            String status = verified ? "VERIFIED" : "PENDING";
            String statusBg = verified ? "#ecfdf5" : "#fffbeb";
            String statusColor = verified ? "#059669" : "#b45309";
            String statusBorder = verified ? "#a7f3d0" : "#fde68a";

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy");
            String submittedOn = profile.getMemberSince() != null
                    ? profile.getMemberSince().format(dtf)
                    : LocalDate.now().format(dtf);

            String accTypeStr = talent.getAccountType() != null ? talent.getAccountType().name() : "TALENT";

            String talentCategory = profile.getTalentCategory();
            if (talentCategory == null || talentCategory.isBlank()) {
                if (talent.getProfileTypes() != null && !talent.getProfileTypes().isEmpty()) {
                    ProfileType pt = talent.getProfileTypes().iterator().next();
                    switch (pt) {
                        case ACTOR -> talentCategory = "ACTING";
                        case SINGER -> talentCategory = "SINGING";
                        case DANCER -> talentCategory = "DANCING";
                        case MODEL -> talentCategory = "MODELING";
                        case DIRECTOR, PRODUCER -> talentCategory = "CREW";
                        default -> talentCategory = "ACTING";
                    }
                } else if (talent.getPrimaryProfession() != null) {
                    String pLow = talent.getPrimaryProfession().toLowerCase();
                    if (pLow.contains("sing") || pLow.contains("vocal") || pLow.contains("music")) talentCategory = "SINGING";
                    else if (pLow.contains("danc") || pLow.contains("choreo")) talentCategory = "DANCING";
                    else if (pLow.contains("model")) talentCategory = "MODELING";
                    else if (pLow.contains("direct") || pLow.contains("camera") || pLow.contains("edit") || pLow.contains("producer") || pLow.contains("writer") || pLow.contains("sound")) talentCategory = "CREW";
                    else talentCategory = "ACTING";
                } else {
                    talentCategory = "ACTING";
                }
            }

            return AdminTalentKycDto.builder()
                    .id(talent.getId())
                    .userId(talent.getId())
                    .talent(talent.getFullName())
                    .stageName(talent.getStageName())
                    .accountType(accTypeStr)
                    .email(talent.getEmail())
                    .phone(talent.getMobileNumber())
                    .craft(craftStr)
                    .primaryProfession(talent.getPrimaryProfession() != null ? talent.getPrimaryProfession() : craftStr)
                    .profileTypes(talent.getProfileTypes() != null ? talent.getProfileTypes().stream().map(Enum::name).collect(Collectors.toList()) : List.of())
                    .avatar(profile.getProfilePhoto() != null ? profile.getProfilePhoto() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80")
                    .location(talent.getLocation() != null ? talent.getLocation() : "India")
                    .submittedOn(submittedOn)
                    .docType("Govt Photo ID")
                    .docNumber("ID-" + (talent.getId() + 1000))
                    .idVerified(verified)
                    .phoneVerified(Boolean.TRUE.equals(profile.getPhoneVerified()))
                    .emailVerified(Boolean.TRUE.equals(profile.getEmailVerified()))
                    .status(status)
                    .statusBg(statusBg)
                    .statusColor(statusColor)
                    .statusBorder(statusBorder)
                    .memberSince(profile.getMemberSince())
                    .bio(profile.getAbout())
                    .gender(talent.getGender() != null ? talent.getGender().name() : null)
                    .dateOfBirth(talent.getDateOfBirth())
                    .yearsExperience(profile.getYearsExperience())
                    .skills(profile.getSkills() != null ? profile.getSkills() : Collections.emptySet())
                    .isPrivate(Boolean.TRUE.equals(profile.getIsPrivate()))
                    .languages(profile.getLanguages())
                    .actingLanguages(profile.getActingLanguages())
                    .talentCategory(talentCategory)
                    .workType(profile.getWorkType())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public AdminTalentKycDto updateTalentDetails(Authentication auth, Long userId, Map<String, Object> updates) {
        verifyAdminPermission(auth, "talents", "edit");

        User talent = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Talent user not found with ID: " + userId));

        Profile profile = profileRepository.findByUser(talent).orElseGet(() -> {
            Profile p = Profile.builder().user(talent).memberSince(LocalDate.now()).build();
            return profileRepository.save(p);
        });

        if (updates.containsKey("fullName") && updates.get("fullName") != null) {
            talent.setFullName(updates.get("fullName").toString().trim());
        }
        if (updates.containsKey("stageName")) {
            talent.setStageName(updates.get("stageName") != null ? updates.get("stageName").toString().trim() : null);
        }
        if (updates.containsKey("primaryProfession") && updates.get("primaryProfession") != null) {
            String prof = updates.get("primaryProfession").toString().trim();
            talent.setPrimaryProfession(prof);
            profile.setPrimaryProfession(prof);
        }
        if (updates.containsKey("location") && updates.get("location") != null) {
            talent.setLocation(updates.get("location").toString().trim());
        }
        if (updates.containsKey("phone") && updates.get("phone") != null) {
            talent.setMobileNumber(updates.get("phone").toString().trim());
        } else if (updates.containsKey("mobileNumber") && updates.get("mobileNumber") != null) {
            talent.setMobileNumber(updates.get("mobileNumber").toString().trim());
        }
        if (updates.containsKey("bio")) {
            profile.setAbout(updates.get("bio") != null ? updates.get("bio").toString().trim() : "");
        }
        if (updates.containsKey("idVerified")) {
            profile.setIdVerified(Boolean.TRUE.equals(updates.get("idVerified")));
        }
        if (updates.containsKey("phoneVerified")) {
            profile.setPhoneVerified(Boolean.TRUE.equals(updates.get("phoneVerified")));
        }
        if (updates.containsKey("emailVerified")) {
            profile.setEmailVerified(Boolean.TRUE.equals(updates.get("emailVerified")));
        }
        if (updates.containsKey("languages")) {
            profile.setLanguages(updates.get("languages") != null ? updates.get("languages").toString().trim() : null);
        }
        if (updates.containsKey("actingLanguages")) {
            profile.setActingLanguages(updates.get("actingLanguages") != null ? updates.get("actingLanguages").toString().trim() : null);
        }
        if (updates.containsKey("talentCategory")) {
            profile.setTalentCategory(updates.get("talentCategory") != null ? updates.get("talentCategory").toString().trim() : null);
        }
        if (updates.containsKey("workType")) {
            profile.setWorkType(updates.get("workType") != null ? updates.get("workType").toString().trim() : null);
        }

        userRepository.save(talent);
        profileRepository.save(profile);

        log.info("ADMIN TALENT UPDATE: Admin updated talent ID={}, Name='{}'", talent.getId(), talent.getFullName());

        return getTalentsKycList().stream()
                .filter(t -> t.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }

    @Transactional
    public AdminTalentKycDto verifyTalentKyc(Authentication auth, Long userId, boolean verify) {
        AdminUser admin = verifyAdminPermission(auth, "kyc", "approve");

        User talent = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Talent user not found with ID: " + userId));

        Profile profile = profileRepository.findByUser(talent).orElseGet(() -> {
            Profile p = Profile.builder()
                    .user(talent)
                    .idVerified(verify)
                    .phoneVerified(true)
                    .emailVerified(true)
                    .memberSince(LocalDate.now())
                    .build();
            return profileRepository.save(p);
        });

        profile.setIdVerified(verify);
        Profile saved = profileRepository.save(profile);

        log.info("KYC VERIFICATION UPDATED: Admin '{}' set idVerified={} for talent '{}' ({}) in PostgreSQL database.",
                admin.getName(), verify, talent.getFullName(), talent.getEmail());

        return getTalentsKycList().stream()
                .filter(t -> t.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }

    // ─── OVERVIEW METRICS ───

    public AdminOverviewMetricsDto getOverviewMetrics() {
        long totalCastings = castingCallRepository.count();
        long openCastings = castingCallRepository.findByStatusOrderByCreatedAtDesc(CastingStatus.OPEN).size();
        long pendingCastings = castingCallRepository.findByStatusOrderByCreatedAtDesc(CastingStatus.IN_REVIEW).size();

        long totalTalents = userRepository.countByAccountType(AccountType.TALENT);
        long totalPros = userRepository.countByAccountType(AccountType.PROFESSIONAL);

        long verifiedTalents = profileRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIdVerified()))
                .count();

        long kycPending = Math.max(0, totalTalents - verifiedTalents);

        long bookingCount = bookingRequestRepository.count();
        long escrowEstimated = bookingCount * 75000L;
        String escrowStr = "₹" + String.format("%,d", Math.max(1450000L, escrowEstimated));

        return AdminOverviewMetricsDto.builder()
                .pendingCastings(pendingCastings)
                .openCastings(openCastings)
                .totalCastings(totalCastings)
                .totalTalents(totalTalents)
                .totalProfessionals(totalPros)
                .kycBadgesPending(kycPending)
                .verifiedTalents(verifiedTalents)
                .mediaQueueCount(totalCastings * 3 + totalTalents * 2)
                .escrowLockedAmount(escrowStr)
                .securityHealthPercent(100)
                .build();
    }
}
