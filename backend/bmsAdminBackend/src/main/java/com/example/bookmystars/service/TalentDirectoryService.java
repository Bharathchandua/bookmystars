package com.example.bookmystars.service;

import com.example.bookmystars.dto.AvailabilityResponse;
import com.example.bookmystars.dto.TalentSummaryResponse;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.AvailabilityRepository;
import com.example.bookmystars.repository.MeasurementRepository;
import com.example.bookmystars.repository.PortfolioRepository;
import com.example.bookmystars.repository.ProfileRepository;
import com.example.bookmystars.repository.ProfessionalProfileRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TalentDirectoryService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AvailabilityService availabilityService;
    private final PortfolioRepository portfolioRepository;
    private final MeasurementRepository measurementRepository;

    private String cleanMeasurement(String val) {
        if (val == null || val.isBlank()) return null;
        String trimmed = val.trim();
        if (trimmed.toLowerCase().startsWith("e.g.") || trimmed.toLowerCase().startsWith("e.g")) return null;
        return trimmed;
    }

    public List<TalentSummaryResponse> getTalents(String type, String query) {
        List<User> allUsers = userRepository.findAllByOrderByIdDesc().stream()
                .filter(u -> u.getAccountType() != AccountType.CLIENT && u.getAccountType() != AccountType.PARTNER)
                .toList();

        ProfileType profileTypeEnum = null;
        if (type != null && !type.trim().isEmpty()) {
            try {
                profileTypeEnum = ProfileType.valueOf(type.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Not standard enum, might be custom craft like WRITER, CINEMATOGRAPHER, EDITOR, CASTING
            }
        }

        final ProfileType finalProfileType = profileTypeEnum;
        final String rawTypeFilter = type != null ? type.trim().toLowerCase() : null;

        return allUsers.stream()
            .<TalentSummaryResponse>map(user -> {
                Profile profile = profileRepository.findByUser(user).orElse(null);
                ProfessionalProfile proProfile = professionalProfileRepository.findByUser(user).orElse(null);
                List<AvailabilityResponse> slots = availabilityService.getUserAvailability(user.getId());

                List<String> realPhotos = portfolioRepository.findByUser(user)
                        .stream()
                        .map(Portfolio::getImageUrl)
                        .filter(url -> url != null && !url.isBlank())
                        .toList();

                Measurement m = measurementRepository.findByUser(user).orElse(null);

                Integer userAge = null;
                if (user.getDateOfBirth() != null) {
                    try {
                        userAge = Period.between(user.getDateOfBirth(), LocalDate.now()).getYears();
                    } catch (Exception ignored) {}
                }

                String cleanHeight = m != null ? cleanMeasurement(m.getHeight()) : null;
                String cleanWaist = m != null ? cleanMeasurement(m.getWaist()) : null;
                String cleanBust = m != null ? cleanMeasurement(m.getBust()) : null;
                String cleanHips = m != null ? cleanMeasurement(m.getHips()) : null;
                String cleanBody = m != null ? cleanMeasurement(m.getBodyType()) : null;
                String cleanSkin = m != null ? cleanMeasurement(m.getSkinTone()) : null;
                String cleanEye = m != null ? cleanMeasurement(m.getEyeColor()) : null;
                String cleanHair = m != null ? cleanMeasurement(m.getHairColor()) : null;
                String cleanShoe = m != null ? cleanMeasurement(m.getShoeSize()) : null;

                String photo = (profile != null && profile.getProfilePhoto() != null && !profile.getProfilePhoto().isEmpty())
                        ? profile.getProfilePhoto()
                        : (realPhotos.size() > 0 ? realPhotos.get(0) : (proProfile != null ? proProfile.getLogoUrl() : null));

                String stage = (user.getStageName() != null && !user.getStageName().isEmpty())
                        ? user.getStageName()
                        : (proProfile != null && proProfile.getCompanyName() != null ? proProfile.getCompanyName() : null);

                String customProf = (profile != null && profile.getCustomProfession() != null && !profile.getCustomProfession().isEmpty())
                        ? profile.getCustomProfession()
                        : user.getCustomProfession();

                String workType = (profile != null && profile.getWorkType() != null && !profile.getWorkType().isEmpty())
                        ? profile.getWorkType()
                        : (proProfile != null && proProfile.getCompanyType() != null
                                ? proProfile.getCompanyType()
                                : (user.getAccountType() == AccountType.PROFESSIONAL ? "Production & Studio" : "Cinema Talent"));

                String about = (profile != null && profile.getAbout() != null && !profile.getAbout().isEmpty())
                        ? profile.getAbout()
                        : (proProfile != null && proProfile.getAbout() != null && !proProfile.getAbout().isEmpty()
                                ? proProfile.getAbout()
                                : (proProfile != null && proProfile.getCompanyName() != null
                                        ? proProfile.getCompanyName() + " • Verified cinema production partner."
                                        : (user.getFullName() + " • Registered cinema professional on BookMyStars.")));

                String location = user.getLocation() != null && !user.getLocation().isEmpty()
                        ? user.getLocation()
                        : (proProfile != null && proProfile.getOfficeAddress() != null ? proProfile.getOfficeAddress() : "Mumbai, India");

                String dayRate = (profile != null && profile.getDayRate() != null && !profile.getDayRate().isEmpty())
                        ? profile.getDayRate()
                        : (user.getAccountType() == AccountType.PROFESSIONAL ? "Project Based / Negotiable" : "Flexible / Negotiable");

                Integer exp = (profile != null && profile.getYearsExperience() != null)
                        ? profile.getYearsExperience()
                        : (user.getAccountType() == AccountType.PROFESSIONAL ? 5 : 2);

                String primProf = (user.getPrimaryProfession() != null && !user.getPrimaryProfession().isBlank())
                        ? user.getPrimaryProfession()
                        : (profile != null && profile.getPrimaryProfession() != null && !profile.getPrimaryProfession().isBlank()
                                ? profile.getPrimaryProfession()
                                : customProf);

                return TalentSummaryResponse.builder()
                        .userId(user.getId())
                        .fullName(user.getFullName())
                        .stageName(stage)
                        .email(user.getEmail())
                        .profilePhoto(photo)
                        .profileTypes(user.getProfileTypes())
                        .customProfession(customProf)
                        .primaryProfession(primProf)
                        .location(location)
                        .dayRate(dayRate)
                        .yearsExperience(exp)
                        .workType(workType)
                        .about(about)
                        .isPrivate(profile != null ? Boolean.TRUE.equals(profile.getIsPrivate()) : false)
                        .upcomingSlots(slots)
                        .portfolioPhotos(realPhotos)
                        .height(cleanHeight)
                        .waist(cleanWaist)
                        .bust(cleanBust)
                        .hips(cleanHips)
                        .bodyType(cleanBody)
                        .skinTone(cleanSkin)
                        .eyeColor(cleanEye)
                        .hairColor(cleanHair)
                        .shoeSize(cleanShoe)
                        .gender(user.getGender() != null ? user.getGender().name() : null)
                        .age(userAge)
                        .projectsCompleted(profile != null ? profile.getProjectsCompleted() : null)
                        .brandsWorked(profile != null ? profile.getBrandsWorked() : null)
                        .languages(profile != null && profile.getLanguages() != null ? profile.getLanguages() : "English, Hindi")
                        .build();
            })
            .filter((TalentSummaryResponse t) -> {
                // Craft filter
                if (rawTypeFilter != null && !rawTypeFilter.isEmpty()) {
                    boolean matchEnum = finalProfileType != null 
                            && t.getProfileTypes() != null 
                            && t.getProfileTypes().contains(finalProfileType);

                    boolean matchPrimary = t.getPrimaryProfession() != null
                            && t.getPrimaryProfession().toLowerCase().contains(rawTypeFilter);

                    boolean matchCustom = t.getCustomProfession() != null 
                            && t.getCustomProfession().toLowerCase().contains(rawTypeFilter);

                    boolean matchTypeString = t.getProfileTypes() != null 
                            && t.getProfileTypes().stream().anyMatch(pt -> pt.name().toLowerCase().contains(rawTypeFilter));

                    boolean matchAbout = t.getAbout() != null 
                            && t.getAbout().toLowerCase().contains(rawTypeFilter);

                    boolean matchWorkType = t.getWorkType() != null 
                            && t.getWorkType().toLowerCase().contains(rawTypeFilter);

                    boolean matchStage = t.getStageName() != null 
                            && t.getStageName().toLowerCase().contains(rawTypeFilter);

                    // Special alias matching
                    boolean matchAlias = false;
                    if (rawTypeFilter.contains("dop") || rawTypeFilter.contains("camera") || rawTypeFilter.contains("cinema")) {
                        matchAlias = (t.getCustomProfession() != null && (t.getCustomProfession().toLowerCase().contains("cinema") || t.getCustomProfession().toLowerCase().contains("dop") || t.getCustomProfession().toLowerCase().contains("camera")))
                                || (t.getAbout() != null && (t.getAbout().toLowerCase().contains("camera") || t.getAbout().toLowerCase().contains("dop") || t.getAbout().toLowerCase().contains("cinema")));
                    } else if (rawTypeFilter.contains("script") || rawTypeFilter.contains("write")) {
                        matchAlias = (t.getCustomProfession() != null && (t.getCustomProfession().toLowerCase().contains("write") || t.getCustomProfession().toLowerCase().contains("script") || t.getCustomProfession().toLowerCase().contains("screen")))
                                || (t.getAbout() != null && (t.getAbout().toLowerCase().contains("script") || t.getAbout().toLowerCase().contains("screenplay") || t.getAbout().toLowerCase().contains("writer")));
                    } else if (rawTypeFilter.contains("cast")) {
                        matchAlias = (t.getStageName() != null && t.getStageName().toLowerCase().contains("cast"))
                                || (t.getFullName() != null && t.getFullName().toLowerCase().contains("cast"))
                                || (t.getAbout() != null && t.getAbout().toLowerCase().contains("cast"));
                    } else if (rawTypeFilter.contains("produc") || rawTypeFilter.contains("studio")) {
                        matchAlias = (t.getCustomProfession() != null && (t.getCustomProfession().toLowerCase().contains("produc") || t.getCustomProfession().toLowerCase().contains("studio")))
                                || (t.getAbout() != null && (t.getAbout().toLowerCase().contains("producer") || t.getAbout().toLowerCase().contains("studio")));
                    } else if (rawTypeFilter.contains("direct")) {
                        matchAlias = (t.getCustomProfession() != null && t.getCustomProfession().toLowerCase().contains("direct"))
                                || (t.getAbout() != null && t.getAbout().toLowerCase().contains("director"));
                    }

                    if (!matchEnum && !matchCustom && !matchTypeString && !matchAbout && !matchWorkType && !matchStage && !matchAlias) {
                        return false;
                    }
                }

                // General search query
                if (query != null && !query.trim().isEmpty()) {
                    String q = query.trim().toLowerCase();
                    boolean matchName = t.getFullName() != null && t.getFullName().toLowerCase().contains(q);
                    boolean matchLoc = t.getLocation() != null && t.getLocation().toLowerCase().contains(q);
                    boolean matchStage = t.getStageName() != null && t.getStageName().toLowerCase().contains(q);
                    boolean matchCustom = t.getCustomProfession() != null && t.getCustomProfession().toLowerCase().contains(q);
                    boolean matchCraft = t.getProfileTypes() != null && t.getProfileTypes().stream().anyMatch(pt -> pt.name().toLowerCase().contains(q));
                    boolean matchAbout = t.getAbout() != null && t.getAbout().toLowerCase().contains(q);
                    return matchName || matchLoc || matchStage || matchCustom || matchCraft || matchAbout;
                }
                return true;
            })
            .toList();
    }
}
