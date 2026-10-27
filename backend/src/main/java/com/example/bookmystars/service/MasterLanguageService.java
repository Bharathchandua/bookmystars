package com.example.bookmystars.service;

import com.example.bookmystars.dto.MasterLanguageRequest;
import com.example.bookmystars.dto.MasterLanguageResponse;
import com.example.bookmystars.model.MasterLanguage;
import com.example.bookmystars.repository.MasterLanguageRepository;
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
public class MasterLanguageService {

    private final MasterLanguageRepository masterLanguageRepository;

    public static final String[][] CANONICAL_LANGUAGES = {
            {"Telugu", "తెలుగు", "te"},
            {"Hindi", "हिन्दी", "hi"},
            {"Tamil", "தமிழ்", "ta"},
            {"Kannada", "ಕನ್ನಡ", "kn"},
            {"Malayalam", "മലയാളം", "ml"},
            {"English", "English", "en"},
            {"Bengali", "বাংলা", "bn"},
            {"Marathi", "मराठी", "mr"},
            {"Punjabi", "ਪੰਜਾਬੀ", "pa"},
            {"Gujarati", "ગુજરાતી", "gu"},
            {"Odia", "ଓଡ଼ିଆ", "or"},
            {"Bhojpuri", "भोजपुरी", "bho"},
            {"Urdu", "اردو", "ur"},
            {"Assamese", "অসমীয়া", "as"},
            {"Konkani", "कोंकणी", "kok"},
            {"Sanskrit", "संस्कृतम्", "sa"},
            {"Spanish", "Español", "es"},
            {"French", "Français", "fr"},
            {"German", "Deutsch", "de"},
            {"Arabic", "العربية", "ar"},
            {"Japanese", "日本語", "ja"},
            {"Korean", "한국어", "ko"},
            {"Mandarin Chinese", "中文", "zh"},
            {"Italian", "Italiano", "it"}
    };

    @PostConstruct
    @Transactional
    public void seedInitialLanguages() {
        try {
            if (masterLanguageRepository.count() == 0) {
                log.info("Seeding initial 24 master cinema languages into PostgreSQL master_languages table...");
                for (String[] seed : CANONICAL_LANGUAGES) {
                    if (!masterLanguageRepository.existsByNameIgnoreCase(seed[0])) {
                        MasterLanguage lang = MasterLanguage.builder()
                                .name(seed[0])
                                .nativeName(seed[1])
                                .code(seed[2])
                                .isActive(true)
                                .build();
                        masterLanguageRepository.save(lang);
                    }
                }
                log.info("Successfully seeded 24 initial master languages.");
            }
        } catch (Exception e) {
            log.warn("Could not seed master languages: {}", e.getMessage());
        }
    }

    public List<Map<String, String>> getStandardLibrary() {
        List<Map<String, String>> list = new ArrayList<>();
        for (String[] entry : CANONICAL_LANGUAGES) {
            list.add(Map.of("name", entry[0], "nativeName", entry[1], "code", entry[2]));
        }
        return list;
    }

    @Transactional
    public Map<String, Object> bulkImportLanguages() {
        int added = 0;
        for (String[] entry : CANONICAL_LANGUAGES) {
            String name = entry[0].trim();
            String nativeName = entry[1].trim();
            String code = entry[2].trim();
            if (!masterLanguageRepository.existsByNameIgnoreCase(name)) {
                MasterLanguage lang = MasterLanguage.builder()
                        .name(name)
                        .nativeName(nativeName)
                        .code(code)
                        .isActive(true)
                        .build();
                masterLanguageRepository.save(lang);
                added++;
            }
        }
        log.info("Bulk imported {} languages into catalog", added);
        return Map.of(
                "status", "SUCCESS",
                "importedCount", added,
                "totalInCatalog", masterLanguageRepository.count(),
                "librarySize", CANONICAL_LANGUAGES.length
        );
    }

    public List<MasterLanguageResponse> getPublicActiveLanguages() {
        return masterLanguageRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(lang -> {
                    long talentCount = 0;
                    try {
                        talentCount = masterLanguageRepository.countTalentsWithLanguage(lang.getName());
                    } catch (Exception ignored) {}
                    return MasterLanguageResponse.builder()
                            .id(lang.getId())
                            .name(lang.getName())
                            .nativeName(lang.getNativeName())
                            .code(lang.getCode())
                            .isActive(lang.getIsActive())
                            .talentCount(talentCount)
                            .createdAt(lang.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<MasterLanguageResponse> getAdminLanguages() {
        return masterLanguageRepository.findAllByOrderByNameAsc().stream()
                .map(lang -> {
                    long talentCount = 0;
                    try {
                        talentCount = masterLanguageRepository.countTalentsWithLanguage(lang.getName());
                    } catch (Exception ignored) {}
                    return MasterLanguageResponse.builder()
                            .id(lang.getId())
                            .name(lang.getName())
                            .nativeName(lang.getNativeName())
                            .code(lang.getCode())
                            .isActive(lang.getIsActive())
                            .talentCount(talentCount)
                            .createdAt(lang.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MasterLanguageResponse createLanguage(MasterLanguageRequest request) {
        String cleanName = request.getName().trim();
        if (cleanName.isEmpty()) {
            throw new IllegalArgumentException("Language name cannot be empty");
        }

        Optional<MasterLanguage> existingOpt = masterLanguageRepository.findByNameIgnoreCase(cleanName);
        if (existingOpt.isPresent()) {
            MasterLanguage existing = existingOpt.get();
            if (existing.getIsActive() != null && existing.getIsActive()) {
                throw new IllegalArgumentException("Language '" + cleanName + "' already exists in catalog");
            }
            existing.setIsActive(true);
            if (request.getNativeName() != null && !request.getNativeName().trim().isEmpty()) {
                existing.setNativeName(request.getNativeName().trim());
            }
            if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
                existing.setCode(request.getCode().trim().toLowerCase());
            }
            MasterLanguage reactivated = masterLanguageRepository.save(existing);
            log.info("Admin reactivated master language: ID={}, Name='{}'", reactivated.getId(), reactivated.getName());

            return MasterLanguageResponse.builder()
                    .id(reactivated.getId())
                    .name(reactivated.getName())
                    .nativeName(reactivated.getNativeName())
                    .code(reactivated.getCode())
                    .isActive(reactivated.getIsActive())
                    .talentCount(0)
                    .createdAt(reactivated.getCreatedAt())
                    .build();
        }

        MasterLanguage lang = MasterLanguage.builder()
                .name(cleanName)
                .nativeName(request.getNativeName() != null ? request.getNativeName().trim() : null)
                .code(request.getCode() != null ? request.getCode().trim().toLowerCase() : null)
                .isActive(true)
                .build();

        MasterLanguage saved = masterLanguageRepository.save(lang);
        log.info("Admin created new master language: ID={}, Name='{}'", saved.getId(), saved.getName());

        return MasterLanguageResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .nativeName(saved.getNativeName())
                .code(saved.getCode())
                .isActive(saved.getIsActive())
                .talentCount(0)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public MasterLanguageResponse toggleLanguageStatus(Long id) {
        MasterLanguage lang = masterLanguageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Language not found with ID: " + id));

        boolean newStatus = lang.getIsActive() == null || !lang.getIsActive();
        lang.setIsActive(newStatus);
        MasterLanguage saved = masterLanguageRepository.save(lang);
        log.info("Admin toggled language '{}' (ID={}) status to isActive={}", saved.getName(), saved.getId(), newStatus);

        long talentCount = 0;
        try {
            talentCount = masterLanguageRepository.countTalentsWithLanguage(saved.getName());
        } catch (Exception ignored) {}

        return MasterLanguageResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .nativeName(saved.getNativeName())
                .code(saved.getCode())
                .isActive(saved.getIsActive())
                .talentCount(talentCount)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteLanguage(Long id) {
        MasterLanguage lang = masterLanguageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Language not found with ID: " + id));

        masterLanguageRepository.delete(lang);
        log.info("Admin deleted master language: ID={}, Name='{}'", lang.getId(), lang.getName());
    }
}
