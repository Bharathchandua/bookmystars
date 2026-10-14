package com.example.bookmystars.service;

import com.example.bookmystars.dto.AvailabilityResponse;
import com.example.bookmystars.dto.TalentSummaryResponse;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.AvailabilityRepository;
import com.example.bookmystars.repository.ProfileRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TalentDirectoryService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AvailabilityService availabilityService;

    public List<TalentSummaryResponse> getTalents(ProfileType type, String query) {
        List<User> talentUsers;

        if (type != null) {
            talentUsers = userRepository.findByAccountTypeAndProfileType(AccountType.TALENT, type);
        } else {
            talentUsers = userRepository.findByAccountTypeOrderByIdDesc(AccountType.TALENT);
        }

        if (query != null && !query.trim().isEmpty()) {
            String q = query.trim().toLowerCase();
            talentUsers = talentUsers.stream()
                    .filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)) ||
                                 (u.getLocation() != null && u.getLocation().toLowerCase().contains(q)) ||
                                 (u.getStageName() != null && u.getStageName().toLowerCase().contains(q)))
                    .toList();
        }

        return talentUsers.stream().map(user -> {
            Profile profile = profileRepository.findByUser(user).orElse(null);
            List<AvailabilityResponse> slots = availabilityService.getUserAvailability(user.getId());

            return TalentSummaryResponse.builder()
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .stageName(user.getStageName())
                    .email(user.getEmail())
                    .profilePhoto(profile != null ? profile.getProfilePhoto() : null)
                    .profileTypes(user.getProfileTypes())
                    .location(user.getLocation())
                    .dayRate(profile != null ? profile.getDayRate() : null)
                    .yearsExperience(profile != null ? profile.getYearsExperience() : null)
                    .workType(profile != null ? profile.getWorkType() : null)
                    .about(profile != null ? profile.getAbout() : null)
                    .isPrivate(profile != null ? Boolean.TRUE.equals(profile.getIsPrivate()) : false)
                    .upcomingSlots(slots)
                    .build();
        }).toList();
    }
}
