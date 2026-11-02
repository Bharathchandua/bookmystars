package com.example.bookmystars.service;

import com.example.bookmystars.dto.MasterProfessionRequest;
import com.example.bookmystars.dto.MasterProfessionResponse;
import com.example.bookmystars.model.MasterProfession;
import com.example.bookmystars.repository.MasterProfessionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MasterProfessionService {

    private final MasterProfessionRepository masterProfessionRepository;

    public static final String[][] STANDARD_INDUSTRY_PROFESSIONS = {
            // 1. Writing & Direction (10)
            {"Film Director", "Writing & Direction"},
            {"Assistant Director (1st AD)", "Writing & Direction"},
            {"Second Assistant Director (2nd AD)", "Writing & Direction"},
            {"Associate Director", "Writing & Direction"},
            {"Creative Director", "Writing & Direction"},
            {"Screenplay Writer", "Writing & Direction"},
            {"Dialogue Writer", "Writing & Direction"},
            {"Story Writer", "Writing & Direction"},
            {"Script Supervisor", "Writing & Direction"},
            {"Continuity Supervisor", "Writing & Direction"},

            // 2. Acting & Performance (14)
            {"Actor", "Acting & Performance"},
            {"Lead Actor", "Acting & Performance"},
            {"Lead Actress", "Acting & Performance"},
            {"Supporting Actor", "Acting & Performance"},
            {"Character Actor", "Acting & Performance"},
            {"Child Artist", "Acting & Performance"},
            {"Theater Artist", "Acting & Performance"},
            {"Standup Comedian", "Acting & Performance"},
            {"Mimicry Artist", "Acting & Performance"},
            {"Voice Artist", "Acting & Performance"},
            {"Dubbing Artist", "Acting & Performance"},
            {"Body Double", "Acting & Performance"},
            {"Stunt Double", "Acting & Performance"},
            {"Background Artist / Extra", "Acting & Performance"},

            // 3. Modeling & Commercials (7)
            {"Model", "Acting & Performance"},
            {"Fashion Model", "Acting & Performance"},
            {"Commercial Model", "Acting & Performance"},
            {"Runway / Ramp Model", "Acting & Performance"},
            {"Fitness Model", "Acting & Performance"},
            {"Hand & Parts Model", "Acting & Performance"},
            {"Editorial Model", "Acting & Performance"},

            // 4. Cinematography & Camera (10)
            {"Director of Photography (DoP)", "Technical & Camera"},
            {"Cinematographer", "Technical & Camera"},
            {"Camera Operator", "Technical & Camera"},
            {"Steadicam Operator", "Technical & Camera"},
            {"Drone / Aerial Cinematographer", "Technical & Camera"},
            {"1st Assistant Camera (Focus Puller)", "Technical & Camera"},
            {"2nd Assistant Camera (Clapper Loader)", "Technical & Camera"},
            {"Gimbal Operator", "Technical & Camera"},
            {"Underwater Camera Specialist", "Technical & Camera"},
            {"DIT (Digital Imaging Technician)", "Technical & Camera"},

            // 5. Lighting & Grip (7)
            {"Gaffer (Chief Lighting Technician)", "Technical & Camera"},
            {"Best Boy Electric", "Technical & Camera"},
            {"Key Grip", "Technical & Camera"},
            {"Best Boy Grip", "Technical & Camera"},
            {"Dolly Grip", "Technical & Camera"},
            {"Rigging Grip", "Technical & Camera"},
            {"Lighting Programmer", "Technical & Camera"},

            // 6. Sound & Audio Engineering (9)
            {"Production Sound Mixer", "Music & Voice"},
            {"Boom Operator", "Music & Voice"},
            {"Sound Designer", "Music & Voice"},
            {"Foley Artist", "Music & Voice"},
            {"Supervising Sound Editor", "Music & Voice"},
            {"ADR Recordist", "Music & Voice"},
            {"Re-recording Mixer", "Music & Voice"},
            {"Audio Mastering Engineer", "Music & Voice"},
            {"Sound Effects (SFX) Editor", "Music & Voice"},

            // 7. Music & Singing (8)
            {"Music Director / Composer", "Music & Voice"},
            {"Singer", "Music & Voice"},
            {"Playback Singer (Male)", "Music & Voice"},
            {"Playback Singer (Female)", "Music & Voice"},
            {"Background Score Composer", "Music & Voice"},
            {"Lyricist", "Music & Voice"},
            {"Music Arranger / Programmer", "Music & Voice"},
            {"Instrumentalist / Session Musician", "Music & Voice"},

            // 8. Dance & Movement (7)
            {"Choreographer", "Dance & Movement"},
            {"Associate Choreographer", "Dance & Movement"},
            {"Dancer", "Dance & Movement"},
            {"Background Dancer", "Dance & Movement"},
            {"Classical Dancer", "Dance & Movement"},
            {"Contemporary Dancer", "Dance & Movement"},
            {"Hip-Hop / Folk Dancer", "Dance & Movement"},

            // 9. Stunts & Action (7)
            {"Action Director / Stunt Coordinator", "Stunts & Action"},
            {"Fight Master", "Stunts & Action"},
            {"Stunt Performer", "Stunts & Action"},
            {"Wirework Specialist", "Stunts & Action"},
            {"Precision Stunt Driver", "Stunts & Action"},
            {"Horse & Equestrian Stunt Artist", "Stunts & Action"},
            {"Martial Arts Specialist", "Stunts & Action"},

            // 10. Art & Production Design (9)
            {"Production Designer", "Art & Production Design"},
            {"Art Director", "Art & Production Design"},
            {"Assistant Art Director", "Art & Production Design"},
            {"Set Decorator", "Art & Production Design"},
            {"Set Dresser", "Art & Production Design"},
            {"Prop Master", "Art & Production Design"},
            {"Construction Coordinator", "Art & Production Design"},
            {"Concept Artist", "Art & Production Design"},
            {"Storyboard Artist", "Art & Production Design"},

            // 11. Costume & Styling (6)
            {"Costume Designer", "Hair, Makeup & Costume"},
            {"Celebrity Fashion Stylist", "Hair, Makeup & Costume"},
            {"Wardrobe Supervisor", "Hair, Makeup & Costume"},
            {"Set Costumer", "Hair, Makeup & Costume"},
            {"Textile & Dye Specialist", "Hair, Makeup & Costume"},
            {"Costume Standby", "Hair, Makeup & Costume"},

            // 12. Hair, Makeup & Prosthetics (6)
            {"Key Makeup Artist", "Hair, Makeup & Costume"},
            {"Prosthetics & SFX Makeup Artist", "Hair, Makeup & Costume"},
            {"Character Makeup Artist", "Hair, Makeup & Costume"},
            {"Hair Stylist", "Hair, Makeup & Costume"},
            {"Wig & Beard Specialist", "Hair, Makeup & Costume"},
            {"Airbrush Makeup Specialist", "Hair, Makeup & Costume"},

            // 13. Post-Production, Editing & VFX (10)
            {"Film Editor", "Post-Production & VFX"},
            {"Assistant Film Editor", "Post-Production & VFX"},
            {"Colorist / DI Specialist", "Post-Production & VFX"},
            {"VFX Supervisor", "Post-Production & VFX"},
            {"VFX Compositor", "Post-Production & VFX"},
            {"3D Modeler & Animator", "Post-Production & VFX"},
            {"Roto & Paint Artist", "Post-Production & VFX"},
            {"Motion Graphics Designer", "Post-Production & VFX"},
            {"Title Sequence Designer", "Post-Production & VFX"},
            {"CGI Artist", "Post-Production & VFX"},

            // 14. Production Management & Executive (8)
            {"Producer", "Writing & Direction"},
            {"Executive Producer (EP)", "Writing & Direction"},
            {"Line Producer", "Writing & Direction"},
            {"Production Manager", "Writing & Direction"},
            {"Unit Production Manager (UPM)", "Writing & Direction"},
            {"Production Controller", "Writing & Direction"},
            {"Location Manager", "Writing & Direction"},
            {"Post-Production Supervisor", "Writing & Direction"},

            // 15. Casting, Publicity & BTS (6)
            {"Casting Director", "Writing & Direction"},
            {"Casting Associate", "Writing & Direction"},
            {"Talent Agent / Artist Manager", "Specialized Craft"},
            {"Publicist / PR Manager", "Specialized Craft"},
            {"Still Photographer", "Technical & Camera"},
            {"BTS Videographer (Making-of)", "Technical & Camera"}
    };

    @PostConstruct
    @Transactional
    public void seedInitialProfessions() {
        try {
            if (masterProfessionRepository.count() == 0) {
                log.info("Seeding initial master professions into PostgreSQL master_professions table...");
                for (String[] seed : STANDARD_INDUSTRY_PROFESSIONS) {
                    if (!masterProfessionRepository.existsByNameIgnoreCase(seed[0])) {
                        MasterProfession prof = MasterProfession.builder()
                                .name(seed[0])
                                .craftCategory(seed[1])
                                .isActive(true)
                                .build();
                        masterProfessionRepository.save(prof);
                    }
                }
                log.info("Successfully seeded master professions.");
            }
        } catch (Exception e) {
            log.warn("Could not seed master professions: {}", e.getMessage());
        }
    }

    public List<Map<String, String>> getStandardLibrary() {
        List<Map<String, String>> list = new ArrayList<>();
        for (String[] entry : STANDARD_INDUSTRY_PROFESSIONS) {
            list.add(Map.of("name", entry[0], "craftCategory", entry[1]));
        }
        return list;
    }

    @Transactional
    public Map<String, Object> bulkImportStandardProfessions() {
        int added = 0;
        for (String[] entry : STANDARD_INDUSTRY_PROFESSIONS) {
            String name = entry[0].trim();
            String category = entry[1].trim();
            if (!masterProfessionRepository.existsByNameIgnoreCase(name)) {
                MasterProfession prof = MasterProfession.builder()
                        .name(name)
                        .craftCategory(category)
                        .isActive(true)
                        .build();
                masterProfessionRepository.save(prof);
                added++;
            }
        }
        log.info("Bulk imported {} new standard industry professions into catalog", added);
        return Map.of(
                "status", "SUCCESS",
                "importedCount", added,
                "totalInCatalog", masterProfessionRepository.count(),
                "librarySize", STANDARD_INDUSTRY_PROFESSIONS.length
        );
    }

    public List<MasterProfessionResponse> getPublicActiveProfessions() {
        return masterProfessionRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MasterProfessionResponse> getAdminProfessions() {
        return masterProfessionRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MasterProfessionResponse createProfession(MasterProfessionRequest request) {
        String cleanName = request.getName().trim();
        if (cleanName.isEmpty()) {
            throw new IllegalArgumentException("Profession name cannot be empty");
        }

        Optional<MasterProfession> existingOpt = masterProfessionRepository.findByNameIgnoreCase(cleanName);
        if (existingOpt.isPresent()) {
            MasterProfession existing = existingOpt.get();
            if (existing.getIsActive() != null && existing.getIsActive()) {
                throw new IllegalArgumentException("Profession '" + cleanName + "' already exists in catalog");
            }
            existing.setIsActive(true);
            if (request.getCraftCategory() != null && !request.getCraftCategory().trim().isEmpty()) {
                existing.setCraftCategory(request.getCraftCategory().trim());
            }
            MasterProfession reactivated = masterProfessionRepository.save(existing);
            log.info("Admin reactivated master profession: ID={}, Name='{}', Craft='{}'", reactivated.getId(), reactivated.getName(), reactivated.getCraftCategory());
            return mapToResponse(reactivated);
        }

        String craft = request.getCraftCategory() != null && !request.getCraftCategory().trim().isEmpty()
                ? request.getCraftCategory().trim()
                : "Specialized Craft";

        MasterProfession profession = MasterProfession.builder()
                .name(cleanName)
                .craftCategory(craft)
                .isActive(true)
                .build();

        MasterProfession saved = masterProfessionRepository.save(profession);
        log.info("Admin created new master profession: ID={}, Name='{}', Craft='{}'", saved.getId(), saved.getName(), saved.getCraftCategory());

        return mapToResponse(saved);
    }

    @Transactional
    public MasterProfessionResponse toggleProfessionStatus(Long id) {
        MasterProfession prof = masterProfessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profession not found with ID: " + id));

        boolean newStatus = prof.getIsActive() == null || !prof.getIsActive();
        prof.setIsActive(newStatus);
        MasterProfession saved = masterProfessionRepository.save(prof);
        log.info("Admin toggled profession '{}' (ID={}) status to isActive={}", saved.getName(), saved.getId(), newStatus);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteProfession(Long id) {
        MasterProfession prof = masterProfessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profession not found with ID: " + id));

        long count = masterProfessionRepository.countUsersWithProfession(prof.getName());
        if (count > 0) {
            throw new IllegalStateException("Cannot delete profession '" + prof.getName() + "' because " + count + " talent/user profile(s) are registered with it.");
        }

        masterProfessionRepository.delete(prof);
        log.info("Admin deleted master profession: ID={}, Name='{}'", prof.getId(), prof.getName());
    }

    private MasterProfessionResponse mapToResponse(MasterProfession prof) {
        long userCount = 0;
        try {
            userCount = masterProfessionRepository.countUsersWithProfession(prof.getName());
        } catch (Exception ignored) {}

        return MasterProfessionResponse.builder()
                .id(prof.getId())
                .name(prof.getName())
                .craftCategory(prof.getCraftCategory())
                .isActive(prof.getIsActive())
                .userCount(userCount)
                .createdAt(prof.getCreatedAt())
                .build();
    }
}
