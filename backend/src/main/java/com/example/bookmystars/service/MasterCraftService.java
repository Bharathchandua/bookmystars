package com.example.bookmystars.service;

import com.example.bookmystars.dto.MasterCraftRequest;
import com.example.bookmystars.dto.MasterCraftResponse;
import com.example.bookmystars.model.MasterCraft;
import com.example.bookmystars.repository.MasterCraftRepository;
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
public class MasterCraftService {

    private final MasterCraftRepository masterCraftRepository;

    public static final String[][] THE_24_CINEMA_CRAFTS = {
            {"Direction", "Film, series, stage and commercial direction"},
            {"Screenplay & Writing", "Screenplays, dialogs, script doctoring and story arts"},
            {"Acting & Performance", "Screen acting, method performance, comedy, theater and stage arts"},
            {"Cinematography", "Director of photography, camera capture, drone and lighting arts"},
            {"Film Editing", "Offline, online storytelling, assembly, and pacing"},
            {"Music Direction & Composition", "Original soundtracks, background scoring, and orchestration"},
            {"Sound Recording & Design", "Sync sound, boom operation, Foley, ADR and Dolby Atmos mixing"},
            {"Art & Production Design", "World building, architectural sets, props and scenery"},
            {"Stunts & Action", "Combat choreography, wire rigging, fight coordination and stunt execution"},
            {"Dance & Choreography", "Classical, contemporary, cinematic, and street choreographies"},
            {"Costume Design & Styling", "Wardrobe fabrication, period dressing, and couture styling"},
            {"Hair & Makeup Styling", "Character cosmetology, prosthetics, SFX, and period hairdressing"},
            {"Visual Effects (VFX)", "CGI modeling, compositing, green-screen keying, and simulations"},
            {"Color Grading (DI)", "Digital intermediate, LUT mastering, and color timing"},
            {"Production Management", "Line production, scheduling, logistics, and budgeting"},
            {"Casting Direction", "Auditions, character scouting, and talent packaging"},
            {"Playback Singing", "Studio vocal recordings across all cinematic genres"},
            {"Lyrics Writing", "Lyrical poetry, meter construction, and song writing"},
            {"Gaffer & Lighting", "Lighting design, power distribution, and mood illumination"},
            {"Grip & Rigging", "Dolly tracks, cranes, Steadicam stabilization, and safety rigging"},
            {"Voice Dubbing & Foley", "Multi-lingual dubbing, voice matching, and live sound reproduction"},
            {"Modeling & Commercials", "Fashion runways, print advertising, and brand campaigns"},
            {"Still Photography & BTS", "Set publicity stills, promotional posters, and behind-the-scenes"},
            {"PR, Publicity & Promotion", "Press relations, digital promotion, and studio marketing"}
    };

    @PostConstruct
    @Transactional
    public void seedInitialCrafts() {
        try {
            if (masterCraftRepository.count() == 0) {
                log.info("Seeding initial 24 master crafts into PostgreSQL master_crafts table...");
                for (String[] seed : THE_24_CINEMA_CRAFTS) {
                    if (!masterCraftRepository.existsByNameIgnoreCase(seed[0])) {
                        MasterCraft craft = MasterCraft.builder()
                                .name(seed[0])
                                .description(seed[1])
                                .isActive(true)
                                .build();
                        masterCraftRepository.save(craft);
                    }
                }
                log.info("Successfully seeded 24 initial master crafts.");
            }
        } catch (Exception e) {
            log.warn("Could not seed master crafts: {}", e.getMessage());
        }
    }

    public List<Map<String, String>> getStandardLibrary() {
        List<Map<String, String>> list = new ArrayList<>();
        for (String[] entry : THE_24_CINEMA_CRAFTS) {
            list.add(Map.of("name", entry[0], "description", entry[1]));
        }
        return list;
    }

    @Transactional
    public Map<String, Object> bulkImport24Crafts() {
        int added = 0;
        for (String[] entry : THE_24_CINEMA_CRAFTS) {
            String name = entry[0].trim();
            String desc = entry[1].trim();
            if (!masterCraftRepository.existsByNameIgnoreCase(name)) {
                MasterCraft craft = MasterCraft.builder()
                        .name(name)
                        .description(desc)
                        .isActive(true)
                        .build();
                masterCraftRepository.save(craft);
                added++;
            }
        }
        log.info("Bulk imported {} crafts into catalog", added);
        return Map.of(
                "status", "SUCCESS",
                "importedCount", added,
                "totalInCatalog", masterCraftRepository.count(),
                "librarySize", THE_24_CINEMA_CRAFTS.length
        );
    }

    public List<MasterCraftResponse> getPublicActiveCrafts() {
        return masterCraftRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(craft -> MasterCraftResponse.builder()
                        .id(craft.getId())
                        .name(craft.getName())
                        .description(craft.getDescription())
                        .isActive(craft.getIsActive())
                        .skillCount(masterCraftRepository.countSkillsInCraft(craft.getName()))
                        .createdAt(craft.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<MasterCraftResponse> getAdminCrafts() {
        return masterCraftRepository.findAllByOrderByNameAsc().stream()
                .map(craft -> MasterCraftResponse.builder()
                        .id(craft.getId())
                        .name(craft.getName())
                        .description(craft.getDescription())
                        .isActive(craft.getIsActive())
                        .skillCount(masterCraftRepository.countSkillsInCraft(craft.getName()))
                        .createdAt(craft.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public MasterCraftResponse createCraft(MasterCraftRequest request) {
        String cleanName = request.getName().trim();
        if (cleanName.isEmpty()) {
            throw new IllegalArgumentException("Craft name cannot be empty");
        }

        Optional<MasterCraft> existingOpt = masterCraftRepository.findByNameIgnoreCase(cleanName);
        if (existingOpt.isPresent()) {
            MasterCraft existing = existingOpt.get();
            if (existing.getIsActive() != null && existing.getIsActive()) {
                throw new IllegalArgumentException("Craft '" + cleanName + "' already exists in catalog");
            }
            existing.setIsActive(true);
            if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
                existing.setDescription(request.getDescription().trim());
            }
            MasterCraft reactivated = masterCraftRepository.save(existing);
            log.info("Admin reactivated master craft: ID={}, Name='{}'", reactivated.getId(), reactivated.getName());

            return MasterCraftResponse.builder()
                    .id(reactivated.getId())
                    .name(reactivated.getName())
                    .description(reactivated.getDescription())
                    .isActive(reactivated.getIsActive())
                    .skillCount(masterCraftRepository.countSkillsInCraft(reactivated.getName()))
                    .createdAt(reactivated.getCreatedAt())
                    .build();
        }

        MasterCraft craft = MasterCraft.builder()
                .name(cleanName)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .isActive(true)
                .build();

        MasterCraft saved = masterCraftRepository.save(craft);
        log.info("Admin created new master craft: ID={}, Name='{}'", saved.getId(), saved.getName());

        return MasterCraftResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .isActive(saved.getIsActive())
                .skillCount(0)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public MasterCraftResponse toggleCraftStatus(Long id) {
        MasterCraft craft = masterCraftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Craft not found with ID: " + id));

        boolean newStatus = craft.getIsActive() == null || !craft.getIsActive();
        craft.setIsActive(newStatus);
        MasterCraft saved = masterCraftRepository.save(craft);
        log.info("Admin toggled craft '{}' (ID={}) status to isActive={}", saved.getName(), saved.getId(), newStatus);

        return MasterCraftResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .description(saved.getDescription())
                .isActive(saved.getIsActive())
                .skillCount(masterCraftRepository.countSkillsInCraft(saved.getName()))
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteCraft(Long id) {
        MasterCraft craft = masterCraftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Craft not found with ID: " + id));

        long skillCount = masterCraftRepository.countSkillsInCraft(craft.getName());
        if (skillCount > 0) {
            throw new IllegalStateException("Cannot delete craft '" + craft.getName() + "' because " + skillCount + " skill(s) currently belong to it. Reassign or delete those skills first.");
        }

        masterCraftRepository.delete(craft);
        log.info("Admin deleted master craft: ID={}, Name='{}'", craft.getId(), craft.getName());
    }
}
