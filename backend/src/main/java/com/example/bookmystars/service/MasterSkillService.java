package com.example.bookmystars.service;

import com.example.bookmystars.dto.MasterSkillRequest;
import com.example.bookmystars.dto.MasterSkillResponse;
import com.example.bookmystars.model.AdminUser;
import com.example.bookmystars.model.MasterSkill;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.MasterSkillRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MasterSkillService {

    private final MasterSkillRepository masterSkillRepository;
    private final AdminUserRepository adminUserRepository;

    public static final String[][] STANDARD_INDUSTRY_SKILLS = {
            // Acting & Performance
            {"Method Acting", "Acting & Performance"},
            {"Monologue Delivery", "Acting & Performance"},
            {"Improvisation", "Acting & Performance"},
            {"Comic Timing", "Acting & Performance"},
            {"Dialect & Accent Control", "Acting & Performance"},
            {"Micro-Expressions", "Acting & Performance"},
            {"Classical Theater", "Acting & Performance"},
            {"Voice Modulation", "Music & Voice"},
            {"Mimicry", "Acting & Performance"},
            {"Standup Comedy", "Acting & Performance"},

            // Dance & Movement
            {"Bharatanatyam", "Dance & Movement"},
            {"Kathak", "Dance & Movement"},
            {"Kuchipudi", "Dance & Movement"},
            {"Hip-Hop / Street Dance", "Dance & Movement"},
            {"Contemporary Dance", "Dance & Movement"},
            {"Freestyle Dance", "Dance & Movement"},
            {"Aerial Silk & Acrobatics", "Dance & Movement"},
            {"Choreography Design", "Dance & Movement"},

            // Music & Vocal
            {"Carnatic Classical Vocal", "Music & Voice"},
            {"Hindustani Classical Vocal", "Music & Voice"},
            {"Western Pop / Jazz Vocal", "Music & Voice"},
            {"Playback Singing", "Music & Voice"},
            {"Rap / Hip-Hop Vocal", "Music & Voice"},
            {"Beatboxing", "Music & Voice"},
            {"Acoustic Guitar", "Music & Voice"},
            {"Piano / Synthesizer", "Music & Voice"},
            {"Flute", "Music & Voice"},
            {"Music Programming / DAW", "Music & Voice"},

            // Stunts & Action
            {"Kickboxing & MMA", "Stunts & Action"},
            {"Kalarippayattu", "Stunts & Action"},
            {"Martial Arts / Karate", "Stunts & Action"},
            {"Wirework & Rigging", "Stunts & Action"},
            {"Sword Fighting & Fencing", "Stunts & Action"},
            {"High Falls & Airbag Landings", "Stunts & Action"},
            {"Precision Stunt Driving", "Stunts & Action"},
            {"Gymnastics & Parkour", "Stunts & Action"},

            // Camera & Technical
            {"Cinematography", "Technical & Camera"},
            {"Steadicam Operation", "Technical & Camera"},
            {"Drone Pilot (DGCA Licensed)", "Technical & Camera"},
            {"Gimbal Balancing (Ronin)", "Technical & Camera"},
            {"Anamorphic Lenses", "Technical & Camera"},
            {"Lighting & Gaffing", "Technical & Camera"},

            // Post-Production & VFX
            {"Adobe Premiere Pro", "Post-Production & VFX"},
            {"DaVinci Resolve Color Grading", "Post-Production & VFX"},
            {"Final Cut Pro", "Post-Production & VFX"},
            {"Avid Media Composer", "Post-Production & VFX"},
            {"Nuke Compositing", "Post-Production & VFX"},
            {"Blender 3D", "Post-Production & VFX"},
            {"Maya Animation", "Post-Production & VFX"},
            {"After Effects Motion Graphics", "Post-Production & VFX"},
            {"Pro Tools Audio Mixing", "Music & Voice"},
            {"Foley Creation", "Music & Voice"},

            // Makeup, Hair & Art
            {"Prosthetics & Silicone SFX", "Hair, Makeup & Costume"},
            {"Airbrush Makeup", "Hair, Makeup & Costume"},
            {"Period Hairdressing", "Hair, Makeup & Costume"},
            {"Digital Storyboarding", "Art & Production Design"},
            {"Set Miniature Model Making", "Art & Production Design"},
            {"Calligraphy & Prop Design", "Art & Production Design"}
    };

    @PostConstruct
    @Transactional
    public void seedDefaultSkills() {
        try {
            if (masterSkillRepository.count() == 0) {
                log.info("Seeding default Master Skills into PostgreSQL...");
                for (String[] entry : STANDARD_INDUSTRY_SKILLS) {
                    if (!masterSkillRepository.existsByNameIgnoreCase(entry[0])) {
                        masterSkillRepository.save(MasterSkill.builder()
                                .name(entry[0])
                                .category(entry[1])
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .build());
                    }
                }
                log.info("Successfully seeded default Master Skills.");
            }
        } catch (Exception e) {
            log.warn("Could not seed default master skills: {}", e.getMessage());
        }
    }

    public List<Map<String, String>> getStandardLibrary() {
        List<Map<String, String>> list = new ArrayList<>();
        for (String[] entry : STANDARD_INDUSTRY_SKILLS) {
            list.add(Map.of("name", entry[0], "category", entry[1]));
        }
        return list;
    }

    @Transactional
    public Map<String, Object> bulkImportStandardSkills(Authentication auth) {
        verifyAdmin(auth);
        int added = 0;
        for (String[] entry : STANDARD_INDUSTRY_SKILLS) {
            String name = entry[0].trim();
            String cat = entry[1].trim();
            if (!masterSkillRepository.existsByNameIgnoreCase(name)) {
                masterSkillRepository.save(MasterSkill.builder()
                        .name(name)
                        .category(cat)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build());
                added++;
            }
        }
        log.info("Bulk imported {} skills into catalog", added);
        return Map.of(
                "status", "SUCCESS",
                "importedCount", added,
                "totalInCatalog", masterSkillRepository.count(),
                "librarySize", STANDARD_INDUSTRY_SKILLS.length
        );
    }

    public List<MasterSkillResponse> getPublicActiveSkills() {
        return masterSkillRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(s -> MasterSkillResponse.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .category(s.getCategory() != null ? s.getCategory() : "General")
                        .isActive(s.getIsActive())
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<MasterSkillResponse> getAdminSkills() {
        return masterSkillRepository.findAllByOrderByNameAsc()
                .stream()
                .map(s -> {
                    long usage = 0;
                    try {
                        usage = masterSkillRepository.countProfileUsage(s.getName());
                    } catch (Exception ignored) {}

                    return MasterSkillResponse.builder()
                            .id(s.getId())
                            .name(s.getName())
                            .category(s.getCategory() != null ? s.getCategory() : "General")
                            .isActive(s.getIsActive())
                            .usageCount(usage)
                            .createdAt(s.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MasterSkillResponse createSkill(Authentication auth, MasterSkillRequest request) {
        verifyAdmin(auth);

        String trimmedName = request.getName() != null ? request.getName().trim() : "";
        if (trimmedName.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Skill name cannot be blank.");
        }

        Optional<MasterSkill> existingOpt = masterSkillRepository.findByNameIgnoreCase(trimmedName);
        if (existingOpt.isPresent()) {
            MasterSkill existing = existingOpt.get();
            if (existing.getIsActive() != null && existing.getIsActive()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Skill '" + trimmedName + "' already exists in catalog.");
            }
            existing.setIsActive(true);
            if (request.getCategory() != null && !request.getCategory().isBlank()) {
                existing.setCategory(request.getCategory().trim());
            }
            MasterSkill reactivated = masterSkillRepository.save(existing);
            log.info("Admin reactivated master skill: ID={}, Name='{}'", reactivated.getId(), reactivated.getName());

            long usage = 0;
            try {
                usage = masterSkillRepository.countProfileUsage(reactivated.getName());
            } catch (Exception ignored) {}

            return MasterSkillResponse.builder()
                    .id(reactivated.getId())
                    .name(reactivated.getName())
                    .category(reactivated.getCategory())
                    .isActive(reactivated.getIsActive())
                    .usageCount(usage)
                    .createdAt(reactivated.getCreatedAt())
                    .build();
        }

        String category = request.getCategory() != null && !request.getCategory().isBlank()
                ? request.getCategory().trim()
                : "General Creative";

        MasterSkill skill = MasterSkill.builder()
                .name(trimmedName)
                .category(category)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        MasterSkill saved = masterSkillRepository.save(skill);
        log.info("MASTER SKILL CREATED: '{}' (Category: {})", saved.getName(), saved.getCategory());

        return MasterSkillResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .category(saved.getCategory())
                .isActive(saved.getIsActive())
                .usageCount(0)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public MasterSkillResponse toggleSkillStatus(Authentication auth, Long id) {
        verifyAdmin(auth);

        MasterSkill skill = masterSkillRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found with ID: " + id));

        boolean newStatus = skill.getIsActive() == null || !skill.getIsActive();
        skill.setIsActive(newStatus);
        MasterSkill saved = masterSkillRepository.save(skill);
        log.info("Admin toggled skill '{}' (ID={}) status to isActive={}", saved.getName(), saved.getId(), newStatus);

        long usage = 0;
        try {
            usage = masterSkillRepository.countProfileUsage(saved.getName());
        } catch (Exception ignored) {}

        return MasterSkillResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .category(saved.getCategory() != null ? saved.getCategory() : "General")
                .isActive(saved.getIsActive())
                .usageCount(usage)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteSkill(Authentication auth, Long id) {
        verifyAdmin(auth);

        MasterSkill skill = masterSkillRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Skill not found with ID: " + id));

        masterSkillRepository.delete(skill);
        log.info("MASTER SKILL DELETED: '{}' (ID: {})", skill.getName(), id);
    }

    private void verifyAdmin(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin authentication required.");
        }
        String email = auth.getName().trim().toLowerCase();
        AdminUser admin = adminUserRepository.findByEmail(email).orElse(null);
        if (admin == null && !"admin@bookmystars.com".equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only platform administrators can manage master skills.");
        }
    }
}
