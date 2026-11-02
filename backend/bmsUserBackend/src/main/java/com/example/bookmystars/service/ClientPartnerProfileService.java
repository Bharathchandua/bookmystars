package com.example.bookmystars.service;

import com.example.bookmystars.dto.ClientProfileDto;
import com.example.bookmystars.dto.PartnerProfileDto;
import com.example.bookmystars.model.ClientPartnerProfile;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.ClientPartnerProfileRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientPartnerProfileService {

    private final ClientPartnerProfileRepository profileRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ClientProfileDto getOrCreateClientProfile(User user) {
        ClientPartnerProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> createDefaultClientProfile(user));
        return toClientDto(profile);
    }

    @Transactional
    public ClientProfileDto updateClientProfile(User user, ClientProfileDto dto) {
        ClientPartnerProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> createDefaultClientProfile(user));

        if (dto.getCompanyName() != null) profile.setCompanyName(dto.getCompanyName());
        if (dto.getIndustry() != null) profile.setIndustry(dto.getIndustry());
        if (dto.getTagline() != null) profile.setTagline(dto.getTagline());
        if (dto.getContactPerson() != null) profile.setContactPerson(dto.getContactPerson());
        if (dto.getDesignation() != null) profile.setDesignation(dto.getDesignation());
        if (dto.getEmail() != null) profile.setEmail(dto.getEmail());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getCity() != null) profile.setCity(dto.getCity());
        if (dto.getAddress() != null) profile.setAddress(dto.getAddress());
        if (dto.getWebsite() != null) profile.setWebsite(dto.getWebsite());
        if (dto.getInstagram() != null) profile.setInstagram(dto.getInstagram());
        if (dto.getLinkedin() != null) profile.setLinkedin(dto.getLinkedin());
        if (dto.getYoutube() != null) profile.setYoutube(dto.getYoutube());
        if (dto.getEstablishedYear() != null) profile.setEstablishedYear(dto.getEstablishedYear());
        if (dto.getAnnualShoots() != null) profile.setAnnualShoots(dto.getAnnualShoots());
        if (dto.getBudgetRange() != null) profile.setBudgetRange(dto.getBudgetRange());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getLogoUrl() != null) profile.setLogoUrl(dto.getLogoUrl());

        if (dto.getPreferredProfiles() != null) {
            try {
                profile.setPreferredProfiles(objectMapper.writeValueAsString(dto.getPreferredProfiles()));
            } catch (Exception e) {
                profile.setPreferredProfiles(String.join(",", dto.getPreferredProfiles()));
            }
        }

        ClientPartnerProfile saved = profileRepository.save(profile);
        log.info("[PROFILE] Updated client brand profile for user ID: {} ({})", user.getId(), profile.getCompanyName());
        return toClientDto(saved);
    }

    @Transactional
    public PartnerProfileDto getOrCreatePartnerProfile(User user) {
        ClientPartnerProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> createDefaultPartnerProfile(user));
        return toPartnerDto(profile);
    }

    @Transactional
    public PartnerProfileDto updatePartnerProfile(User user, PartnerProfileDto dto) {
        ClientPartnerProfile profile = profileRepository.findByUser(user)
                .orElseGet(() -> createDefaultPartnerProfile(user));

        if (dto.getAcademyName() != null) profile.setCompanyName(dto.getAcademyName());
        if (dto.getCategory() != null) profile.setIndustry(dto.getCategory());
        if (dto.getTagline() != null) profile.setTagline(dto.getTagline());
        if (dto.getDirectorName() != null) profile.setContactPerson(dto.getDirectorName());
        if (dto.getDesignation() != null) profile.setDesignation(dto.getDesignation());
        if (dto.getEmail() != null) profile.setEmail(dto.getEmail());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getCity() != null) profile.setCity(dto.getCity());
        if (dto.getAddress() != null) profile.setAddress(dto.getAddress());
        if (dto.getWebsite() != null) profile.setWebsite(dto.getWebsite());
        if (dto.getInstagram() != null) profile.setInstagram(dto.getInstagram());
        if (dto.getYoutube() != null) profile.setYoutube(dto.getYoutube());
        if (dto.getEstablishedYear() != null) profile.setEstablishedYear(dto.getEstablishedYear());
        if (dto.getActiveStudents() != null) profile.setActiveStudents(dto.getActiveStudents());
        if (dto.getStudioFacilities() != null) profile.setStudioFacilities(dto.getStudioFacilities());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getLogoUrl() != null) profile.setLogoUrl(dto.getLogoUrl());

        if (dto.getTrainingBatches() != null) {
            try {
                profile.setTrainingBatches(objectMapper.writeValueAsString(dto.getTrainingBatches()));
            } catch (Exception e) {
                profile.setTrainingBatches(String.join(",", dto.getTrainingBatches()));
            }
        }

        ClientPartnerProfile saved = profileRepository.save(profile);
        log.info("[PROFILE] Updated partner academy profile for user ID: {} ({})", user.getId(), profile.getCompanyName());
        return toPartnerDto(saved);
    }

    private ClientPartnerProfile createDefaultClientProfile(User user) {
        String company = (user.getFullName() != null && !user.getFullName().isBlank())
                ? user.getFullName() : "Tanishq Fine Jewelry & Diamonds";
        String ind = (user.getCustomProfession() != null && !user.getCustomProfession().isBlank())
                ? user.getCustomProfession() : "Jewelry & Luxury Retail";

        List<String> defaultPreferred = List.of(
                "High-Fashion Models", "Bridal Jewelry Models", "Commercial Actors", "Voiceover Artists"
        );
        String prefJson;
        try {
            prefJson = objectMapper.writeValueAsString(defaultPreferred);
        } catch (Exception e) {
            prefJson = "[\"High-Fashion Models\",\"Bridal Jewelry Models\",\"Commercial Actors\",\"Voiceover Artists\"]";
        }

        ClientPartnerProfile newProfile = ClientPartnerProfile.builder()
                .user(user)
                .profileType("CLIENT")
                .companyName(company)
                .industry(ind)
                .tagline("India's premier fine jewelry, bridal temple gold & diamond house")
                .contactPerson("Aarav Mehra")
                .designation("Head of Brand Marketing & Visual Productions")
                .email(user.getEmail() != null ? user.getEmail() : "brand@tanishq-jewels.com")
                .phone(user.getMobileNumber() != null ? user.getMobileNumber() : "+91 98765 43210")
                .city(user.getLocation() != null ? user.getLocation() : "Mumbai, Maharashtra")
                .address("Prestige Tower, 14th Floor, Bandra-Kurla Complex (BKC), Mumbai - 400051")
                .website("https://www.tanishq.co.in")
                .instagram("tanishqjewellery")
                .linkedin("https://linkedin.com/company/tanishq")
                .youtube("https://youtube.com/@TanishqJewellery")
                .establishedYear("1994")
                .annualShoots("25+ Commercial Campaigns / Year")
                .budgetRange("₹50,000 - ₹3,00,000 per Shoot")
                .bio("Tanishq is a flagship brand of the Tata Group, crafting exquisite festive gold, polki, and diamond jewelry. We frequently commission high-gloss television commercials, digital video ad campaigns, and print billboards featuring top Indian models, actors, and classical dancers.")
                .preferredProfiles(prefJson)
                .logoUrl("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80")
                .verified(true)
                .build();

        return profileRepository.save(newProfile);
    }

    private ClientPartnerProfile createDefaultPartnerProfile(User user) {
        String academy = (user.getFullName() != null && !user.getFullName().isBlank())
                ? user.getFullName() : "Rajajinagar Dance & Performing Arts Academy";
        String cat = (user.getPartnerCategory() != null && !user.getPartnerCategory().isBlank())
                ? user.getPartnerCategory() : ((user.getCustomProfession() != null && !user.getCustomProfession().isBlank())
                ? user.getCustomProfession() : "Dance Academy & Casting Partner");

        List<String> defaultBatches = List.of(
                "Weekend Classical Bharatanatyam", "Advanced Contemporary", "Bollywood Commercial", "Kids Stage Prep"
        );
        String batchesJson;
        try {
            batchesJson = objectMapper.writeValueAsString(defaultBatches);
        } catch (Exception e) {
            batchesJson = "[\"Weekend Classical Bharatanatyam\",\"Advanced Contemporary\",\"Bollywood Commercial\",\"Kids Stage Prep\"]";
        }

        ClientPartnerProfile newProfile = ClientPartnerProfile.builder()
                .user(user)
                .profileType("PARTNER")
                .companyName(academy)
                .industry(cat)
                .tagline("Premier center for Bharatanatyam, Kathak, Contemporary & Commercial Dance")
                .contactPerson("Guru Radhika Swaminathan")
                .designation("Founding Director & Chief Choreographer")
                .email(user.getEmail() != null ? user.getEmail() : "admissions@rajajinagardance.com")
                .phone(user.getMobileNumber() != null ? user.getMobileNumber() : "+91 98450 12345")
                .city(user.getLocation() != null ? user.getLocation() : "Bengaluru, Karnataka")
                .address(user.getPartnerAddress() != null ? user.getPartnerAddress() : "#42, 2nd Main, 3rd Block, Rajajinagar, Bengaluru - 560010")
                .website(user.getPartnerWebsite() != null ? user.getPartnerWebsite() : "https://www.rajajinagardance.com")
                .instagram("rajajinagar_dance_academy")
                .youtube("https://youtube.com/@RajajinagarDanceStudio")
                .establishedYear("2012")
                .activeStudents("450+ Enrolled Students")
                .trainingBatches(batchesJson)
                .studioFacilities("3,000 sq.ft Sprung Wooden Floor Studio, Professional Mirrors, Sound Acoustics & Dressing Rooms")
                .bio("Founded in 2012, Rajajinagar Dance Academy is one of Bengaluru's premier training institutes for classical and contemporary arts. Our students regularly perform on prestigious state stages, festive television broadcasts, and commercial ad shoots. We collaborate with BookMyStars to provide casting calls, stage opportunities, and targeted ad promotions for our batches.")
                .logoUrl("https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80")
                .verified(true)
                .build();

        return profileRepository.save(newProfile);
    }

    private ClientProfileDto toClientDto(ClientPartnerProfile profile) {
        List<String> preferred = parseList(profile.getPreferredProfiles());
        return ClientProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .companyName(profile.getCompanyName())
                .industry(profile.getIndustry())
                .tagline(profile.getTagline())
                .contactPerson(profile.getContactPerson())
                .designation(profile.getDesignation())
                .email(profile.getEmail())
                .phone(profile.getPhone())
                .city(profile.getCity())
                .address(profile.getAddress())
                .website(profile.getWebsite())
                .instagram(profile.getInstagram())
                .linkedin(profile.getLinkedin())
                .youtube(profile.getYoutube())
                .establishedYear(profile.getEstablishedYear())
                .annualShoots(profile.getAnnualShoots())
                .budgetRange(profile.getBudgetRange())
                .bio(profile.getBio())
                .preferredProfiles(preferred)
                .logoUrl(profile.getLogoUrl())
                .verified(profile.getVerified())
                .build();
    }

    private PartnerProfileDto toPartnerDto(ClientPartnerProfile profile) {
        List<String> batches = parseList(profile.getTrainingBatches());
        return PartnerProfileDto.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .academyName(profile.getCompanyName())
                .category(profile.getIndustry())
                .tagline(profile.getTagline())
                .directorName(profile.getContactPerson())
                .designation(profile.getDesignation())
                .email(profile.getEmail())
                .phone(profile.getPhone())
                .city(profile.getCity())
                .address(profile.getAddress())
                .website(profile.getWebsite())
                .instagram(profile.getInstagram())
                .youtube(profile.getYoutube())
                .establishedYear(profile.getEstablishedYear())
                .activeStudents(profile.getActiveStudents())
                .trainingBatches(batches)
                .studioFacilities(profile.getStudioFacilities())
                .bio(profile.getBio())
                .logoUrl(profile.getLogoUrl())
                .verified(profile.getVerified())
                .build();
    }

    private List<String> parseList(String raw) {
        if (raw == null || raw.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(raw, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Arrays.stream(raw.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }
}
