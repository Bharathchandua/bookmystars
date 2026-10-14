package com.example.bookmystars.service;

import com.example.bookmystars.dto.*;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PortfolioRepository portfolioRepository;
    private final VideoRepository videoRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final MeasurementRepository measurementRepository;
    private final AudioRepository audioRepository;
    private final UserDocumentRepository userDocumentRepository;
    private final ProfileAccessRequestRepository profileAccessRequestRepository;

    public ShareResponse getShareProfileInfo(String email, String origin) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String baseUrl = (origin != null && !origin.isBlank()) ? origin : "http://localhost:5173";
        String shareUrl = baseUrl + "/public-profile/" + user.getId();
        String shareCode = "BMS-" + user.getId();

        String professionalWhatsAppMessage = 
                "Official Talent & Casting Profile: " + user.getFullName() + "\n\n" +
                "Dear Casting Director / Production Team,\n\n" +
                "Please review my verified talent portfolio, showreels, and physical attributes on Book My Stars:\n" +
                shareUrl + "\n\n" +
                "Talent ID: " + shareCode + "\n" +
                "Available for casting calls, commercial shoots, runway, and feature productions.";

        String emailSubject = "Official Talent Portfolio - " + user.getFullName() + " (" + shareCode + ")";
        String emailBody = 
                "Dear Casting Director / Production Team,\r\n\r\n" +
                "I am pleased to share my official talent profile and portfolio on Book My Stars:\r\n\r\n" +
                "Profile & Showreels: " + shareUrl + "\r\n" +
                "Talent ID: " + shareCode + "\r\n\r\n" +
                "Available for casting calls, commercial campaigns, fashion shoots, and feature productions.\r\n\r\n" +
                "Warm regards,\r\n" +
                user.getFullName();

        String encodedSubject = java.net.URLEncoder.encode(emailSubject, java.nio.charset.StandardCharsets.UTF_8).replace("+", "%20");
        String encodedBody = java.net.URLEncoder.encode(emailBody, java.nio.charset.StandardCharsets.UTF_8).replace("+", "%20");
        String mailtoUrl = "mailto:?subject=" + encodedSubject + "&body=" + encodedBody;
        String gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=" + encodedSubject + "&body=" + encodedBody;
        String outlookUrl = "https://outlook.live.com/mail/0/deeplink/compose?subject=" + encodedSubject + "&body=" + encodedBody;

        return ShareResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .shareUrl(shareUrl)
                .shareCode(shareCode)
                .shareTitle(user.getFullName() + " | Book My Stars Talent Profile")
                .shareDescription("Official talent portfolio, showreels, measurements and credits for " + user.getFullName() + ".")
                .whatsappUrl("https://api.whatsapp.com/send?text=" + java.net.URLEncoder.encode(professionalWhatsAppMessage, java.nio.charset.StandardCharsets.UTF_8))
                .emailSubject(emailSubject)
                .emailBody(emailBody)
                .emailUrl(mailtoUrl)
                .gmailUrl(gmailUrl)
                .outlookUrl(outlookUrl)
                .totalViews(120L)
                .build();
    }

    public PublicProfileResponse getPublicProfile(Long userId) {
        return getPublicProfile(userId, null, null);
    }

    public PublicProfileResponse getPublicProfile(Long userId, org.springframework.security.core.Authentication authentication, String viewerEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> Profile.builder()
                        .user(user)
                        .about("Welcome to my profile!")
                        .available(true)
                        .openForNewProjects(true)
                        .yearsExperience(0)
                        .projectsCompleted(0)
                        .brandsWorked(0)
                        .magazineFeatures(0)
                        .memberSince(LocalDate.now())
                        .isPrivate(false)
                        .build());

        boolean isPrivate = Boolean.TRUE.equals(profile.getIsPrivate());
        String accessStatus = "PUBLIC";

        if (isPrivate) {
            // Check if viewer is the profile owner or a casting professional
            boolean isOwner = authentication != null && authentication.isAuthenticated() &&
                    authentication.getName() != null &&
                    authentication.getName().equalsIgnoreCase(user.getEmail());

            boolean isProfessional = false;
            User requester = null;
            if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
                requester = userRepository.findByEmail(authentication.getName()).orElse(null);
                if (requester != null && requester.getAccountType() == AccountType.PROFESSIONAL) {
                    isProfessional = true;
                }
            }

            if (isOwner || isProfessional) {
                accessStatus = "APPROVED";
            } else {
                ProfileAccessRequest req = null;
                if (requester != null) {
                    req = profileAccessRequestRepository.findByTalentAndRequester(user, requester).orElse(null);
                }
                if (req == null && viewerEmail != null && !viewerEmail.isBlank()) {
                    req = profileAccessRequestRepository.findByTalentAndRequesterEmailIgnoreCase(user, viewerEmail.trim()).orElse(null);
                }

                if (req != null) {
                    if (req.getStatus() == AccessRequestStatus.APPROVED) {
                        accessStatus = "APPROVED";
                    } else if (req.getStatus() == AccessRequestStatus.PENDING) {
                        accessStatus = "PENDING";
                    } else if (req.getStatus() == AccessRequestStatus.REJECTED) {
                        accessStatus = "REJECTED";
                    }
                } else {
                    accessStatus = "LOCKED";
                }
            }
        }

        ProfileResponse profileResponse = buildProfileResponse(user, profile);

        // If locked/pending/rejected, mask all private content (portfolio, videos, measurements, etc.)
        if ("LOCKED".equals(accessStatus) || "PENDING".equals(accessStatus) || "REJECTED".equals(accessStatus)) {
            return PublicProfileResponse.builder()
                    .profile(ProfileResponse.builder()
                            .id(user.getId())
                            .accountType(user.getAccountType())
                            .fullName(user.getFullName())
                            .stageName(user.getStageName())
                            .location(user.getLocation())
                            .profileTypes(user.getProfileTypes())
                            .customProfession(profile.getCustomProfession() != null ? profile.getCustomProfession() : user.getCustomProfession())
                            .profilePhoto(profile.getProfilePhoto())
                            .isPrivate(true)
                            .build())
                    .portfolio(java.util.Collections.emptyList())
                    .videos(java.util.Collections.emptyList())
                    .workExperiences(java.util.Collections.emptyList())
                    .measurements(null)
                    .audios(java.util.Collections.emptyList())
                    .documents(java.util.Collections.emptyList())
                    .isPrivate(true)
                    .accessStatus(accessStatus)
                    .build();
        }

        // Full public or approved view
        List<PortfolioResponse> portfolio = portfolioRepository.findByUser(user).stream()
                .map(p -> PortfolioResponse.builder()
                        .id(p.getId())
                        .imageUrl(p.getImageUrl())
                        .title(p.getTitle())
                        .category(p.getCategory())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        List<VideoResponse> videos = videoRepository.findByUser(user).stream()
                .map(v -> VideoResponse.builder()
                        .id(v.getId())
                        .title(v.getTitle())
                        .category(v.getCategory())
                        .videoUrl(v.getVideoUrl())
                        .thumbnailUrl(v.getThumbnailUrl())
                        .duration(v.getDuration())
                        .year(v.getYear())
                        .views(v.getViews())
                        .build())
                .collect(Collectors.toList());

        List<WorkExperienceResponse> workExperiences = workExperienceRepository.findByUser(user).stream()
                .map(w -> WorkExperienceResponse.builder()
                        .id(w.getId())
                        .company(w.getCompany())
                        .title(w.getTitle())
                        .description(w.getDescription())
                        .category(w.getCategory())
                        .startDate(w.getStartDate())
                        .endDate(w.getEndDate())
                        .build())
                .collect(Collectors.toList());

        MeasurementResponse measurementResponse = measurementRepository.findByUser(user)
                .map(m -> MeasurementResponse.builder()
                        .id(m.getId())
                        .height(m.getHeight())
                        .bust(m.getBust())
                        .waist(m.getWaist())
                        .hips(m.getHips())
                        .dressSize(m.getDressSize())
                        .shoeSize(m.getShoeSize())
                        .hairColor(m.getHairColor())
                        .eyeColor(m.getEyeColor())
                        .skinTone(m.getSkinTone())
                        .bodyType(m.getBodyType())
                        .updatedAt(m.getUpdatedAt())
                        .build())
                .orElse(null);

        List<AudioResponse> audios = audioRepository.findByUser(user).stream()
                .map(a -> AudioResponse.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        .category(a.getCategory())
                        .audioUrl(a.getAudioUrl())
                        .format(a.getFormat())
                        .duration(a.getDuration())
                        .sizeStr(a.getSizeStr())
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        List<DocumentResponse> documents = userDocumentRepository.findByUser(user).stream()
                .map(d -> DocumentResponse.builder()
                        .id(d.getId())
                        .title(d.getTitle())
                        .category(d.getCategory())
                        .fileUrl(d.getFileUrl())
                        .format(d.getFormat())
                        .sizeStr(d.getSizeStr())
                        .createdAt(d.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return PublicProfileResponse.builder()
                .profile(profileResponse)
                .portfolio(portfolio)
                .videos(videos)
                .workExperiences(workExperiences)
                .measurements(measurementResponse)
                .audios(audios)
                .documents(documents)
                .isPrivate(isPrivate)
                .accessStatus(accessStatus)
                .build();
    }

    public ProfileResponse getProfile(String email) {

        // Find logged-in user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find or auto-create profile for this user
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile newProfile = Profile.builder()
                            .user(user)
                            .about("Welcome to my profile!")
                            .available(true)
                            .openForNewProjects(true)
                            .yearsExperience(0)
                            .projectsCompleted(0)
                            .brandsWorked(0)
                            .magazineFeatures(0)
                            .memberSince(LocalDate.now())
                            .build();
                    return profileRepository.save(newProfile);
                });

        return buildProfileResponse(user, profile);
    }

    @org.springframework.transaction.annotation.Transactional
    public ProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile newProfile = Profile.builder()
                            .user(user)
                            .about("Welcome to my profile!")
                            .available(true)
                            .openForNewProjects(true)
                            .yearsExperience(0)
                            .projectsCompleted(0)
                            .brandsWorked(0)
                            .magazineFeatures(0)
                            .memberSince(LocalDate.now())
                            .build();
                    return profileRepository.save(newProfile);
                });

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getStageName() != null) {
            user.setStageName(request.getStageName().trim());
        }
        if (request.getLocation() != null && !request.getLocation().isBlank()) {
            user.setLocation(request.getLocation().trim());
        }
        if (request.getProfileTypes() != null && !request.getProfileTypes().isEmpty()) {
            if (user.getProfileTypes() == null) {
                user.setProfileTypes(new java.util.HashSet<>(request.getProfileTypes()));
            } else {
                user.getProfileTypes().clear();
                user.getProfileTypes().addAll(request.getProfileTypes());
            }
            if (!request.getProfileTypes().contains(ProfileType.OTHER)) {
                user.setCustomProfession(null);
                profile.setCustomProfession(null);
            }
        }
        if (request.getCustomProfession() != null) {
            String cp = request.getCustomProfession().trim();
            user.setCustomProfession(cp.isBlank() ? null : cp);
            profile.setCustomProfession(cp.isBlank() ? null : cp);
        }
        userRepository.save(user);

        if (request.getAbout() != null) {
            profile.setAbout(request.getAbout().trim());
        }
        if (request.getLanguages() != null) {
            profile.setLanguages(request.getLanguages().trim());
        }
        if (request.getWorkType() != null) {
            profile.setWorkType(request.getWorkType().trim());
        }
        if (request.getDayRate() != null) {
            profile.setDayRate(request.getDayRate().trim());
        }
        if (request.getProfilePhoto() != null) {
            profile.setProfilePhoto(request.getProfilePhoto());
        }
        if (request.getYearsExperience() != null) {
            profile.setYearsExperience(request.getYearsExperience());
        }
        if (request.getProjectsCompleted() != null) {
            profile.setProjectsCompleted(request.getProjectsCompleted());
        }
        if (request.getBrandsWorked() != null) {
            profile.setBrandsWorked(request.getBrandsWorked());
        }
        if (request.getMagazineFeatures() != null) {
            profile.setMagazineFeatures(request.getMagazineFeatures());
        }
        if (request.getIsPrivate() != null) {
            profile.setIsPrivate(request.getIsPrivate());
        }
        if (request.getSkills() != null) {
            if (profile.getSkills() == null) {
                profile.setSkills(new java.util.HashSet<>(request.getSkills()));
            } else {
                profile.getSkills().clear();
                profile.getSkills().addAll(request.getSkills());
            }
        }
        profileRepository.save(profile);

        return buildProfileResponse(user, profile);
    }

    private final Path profileUploadDirectory = Paths.get("uploads/profile");

    public ProfileResponse uploadProfilePhoto(String email, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select an image file to upload");
        }

        Files.createDirectories(profileUploadDirectory);

        String originalFileName = file.getOriginalFilename();
        String fileExtension = ".jpg";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = "avatar_" + user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
        Path filePath = profileUploadDirectory.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile newProfile = Profile.builder()
                            .user(user)
                            .about("Welcome to my profile!")
                            .available(true)
                            .openForNewProjects(true)
                            .yearsExperience(0)
                            .projectsCompleted(0)
                            .brandsWorked(0)
                            .magazineFeatures(0)
                            .memberSince(LocalDate.now())
                            .build();
                    return profileRepository.save(newProfile);
                });

        String photoUrl = "/uploads/profile/" + fileName;
        profile.setProfilePhoto(photoUrl);
        profileRepository.save(profile);

        // Also save to portfolio table so profile photo appears in the photos section
        Portfolio headshot = Portfolio.builder()
                .user(user)
                .imageUrl(photoUrl)
                .title("Profile Headshot")
                .category("Headshot")
                .createdAt(java.time.LocalDateTime.now())
                .build();
        portfolioRepository.save(headshot);

        return buildProfileResponse(user, profile);
    }

    private ProfileResponse buildProfileResponse(User user, Profile profile) {
        return ProfileResponse.builder()
                .id(user.getId())
                .accountType(user.getAccountType())
                .fullName(user.getFullName())
                .stageName(user.getStageName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .location(user.getLocation())
                .profileTypes(user.getProfileTypes())
                .referralSource(user.getReferralSource())
                .termsAccepted(user.getTermsAccepted())
                .profilePhoto(profile.getProfilePhoto())
                .about(profile.getAbout())
                .languages(profile.getLanguages())
                .workType(profile.getWorkType())
                .dayRate(profile.getDayRate())
                .yearsExperience(profile.getYearsExperience())
                .projectsCompleted(profile.getProjectsCompleted())
                .brandsWorked(profile.getBrandsWorked())
                .magazineFeatures(profile.getMagazineFeatures())
                .available(profile.getAvailable())
                .openForNewProjects(profile.getOpenForNewProjects())
                .nextAvailableFrom(profile.getNextAvailableFrom())
                .memberSince(profile.getMemberSince())
                .idVerified(profile.getIdVerified())
                .phoneVerified(profile.getPhoneVerified())
                .emailVerified(profile.getEmailVerified())
                .isPrivate(Boolean.TRUE.equals(profile.getIsPrivate()))
                .customProfession(profile.getCustomProfession() != null ? profile.getCustomProfession() : user.getCustomProfession())
                .skills(profile.getSkills() != null ? new java.util.HashSet<>(profile.getSkills()) : java.util.Collections.emptySet())
                .build();
    }

    public ProfileResponse updatePrivacy(String email, Boolean isPrivate) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> Profile.builder()
                        .user(user)
                        .about("Welcome to my profile!")
                        .available(true)
                        .openForNewProjects(true)
                        .yearsExperience(0)
                        .projectsCompleted(0)
                        .brandsWorked(0)
                        .magazineFeatures(0)
                        .memberSince(LocalDate.now())
                        .build());

        profile.setIsPrivate(Boolean.TRUE.equals(isPrivate));
        Profile saved = profileRepository.save(profile);
        return buildProfileResponse(user, saved);
    }

    public ProfileAccessRequestDto requestAccess(Long talentUserId, ProfileAccessRequestDto requestDto, org.springframework.security.core.Authentication authentication) {
        User talent = userRepository.findById(talentUserId)
                .orElseThrow(() -> new RuntimeException("Talent not found"));

        User requester = null;
        String requesterName = requestDto != null ? requestDto.getRequesterName() : null;
        String requesterEmail = requestDto != null ? requestDto.getRequesterEmail() : null;
        String requesterRole = requestDto != null ? requestDto.getRequesterRole() : "Viewer";
        String requesterMessage = requestDto != null ? requestDto.getRequesterMessage() : null;

        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            requester = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (requester != null) {
                if (requesterName == null || requesterName.isBlank()) {
                    requesterName = requester.getFullName();
                }
                if (requesterEmail == null || requesterEmail.isBlank()) {
                    requesterEmail = requester.getEmail();
                }
                if (requesterRole == null || requesterRole.isBlank()) {
                    requesterRole = requester.getAccountType() != null ? requester.getAccountType().name() : "User";
                }
            }
        }

        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new RuntimeException("Email is required to request profile access");
        }
        if (requesterName == null || requesterName.isBlank()) {
            requesterName = requesterEmail.split("@")[0];
        }

        // Check if existing request exists
        ProfileAccessRequest existing = null;
        if (requester != null) {
            existing = profileAccessRequestRepository.findByTalentAndRequester(talent, requester).orElse(null);
        }
        if (existing == null) {
            existing = profileAccessRequestRepository.findByTalentAndRequesterEmailIgnoreCase(talent, requesterEmail.trim()).orElse(null);
        }

        ProfileAccessRequest toSave;
        if (existing != null) {
            existing.setStatus(AccessRequestStatus.PENDING);
            existing.setRequesterName(requesterName);
            existing.setRequesterRole(requesterRole);
            if (requesterMessage != null) existing.setRequesterMessage(requesterMessage);
            if (requester != null) existing.setRequester(requester);
            toSave = existing;
        } else {
            toSave = ProfileAccessRequest.builder()
                    .talent(talent)
                    .requester(requester)
                    .requesterName(requesterName)
                    .requesterEmail(requesterEmail.trim())
                    .requesterRole(requesterRole)
                    .requesterMessage(requesterMessage)
                    .status(AccessRequestStatus.PENDING)
                    .build();
        }

        ProfileAccessRequest saved = profileAccessRequestRepository.save(toSave);

        return ProfileAccessRequestDto.builder()
                .id(saved.getId())
                .talentId(talent.getId())
                .talentName(talent.getFullName())
                .requesterId(saved.getRequester() != null ? saved.getRequester().getId() : null)
                .requesterName(saved.getRequesterName())
                .requesterEmail(saved.getRequesterEmail())
                .requesterRole(saved.getRequesterRole())
                .requesterMessage(saved.getRequesterMessage())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<ProfileAccessRequestDto> getAccessRequests(String email) {
        User talent = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return profileAccessRequestRepository.findByTalentOrderByCreatedAtDesc(talent).stream()
                .map(r -> ProfileAccessRequestDto.builder()
                        .id(r.getId())
                        .talentId(talent.getId())
                        .talentName(talent.getFullName())
                        .requesterId(r.getRequester() != null ? r.getRequester().getId() : null)
                        .requesterName(r.getRequesterName())
                        .requesterEmail(r.getRequesterEmail())
                        .requesterRole(r.getRequesterRole())
                        .requesterMessage(r.getRequesterMessage())
                        .status(r.getStatus())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public ProfileAccessRequestDto respondToAccessRequest(String email, Long requestId, boolean approved) {
        User talent = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProfileAccessRequest request = profileAccessRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Access request not found"));

        if (!request.getTalent().getId().equals(talent.getId())) {
            throw new RuntimeException("Unauthorized: This access request does not belong to you");
        }

        request.setStatus(approved ? AccessRequestStatus.APPROVED : AccessRequestStatus.REJECTED);
        ProfileAccessRequest updated = profileAccessRequestRepository.save(request);

        return ProfileAccessRequestDto.builder()
                .id(updated.getId())
                .talentId(talent.getId())
                .talentName(talent.getFullName())
                .requesterId(updated.getRequester() != null ? updated.getRequester().getId() : null)
                .requesterName(updated.getRequesterName())
                .requesterEmail(updated.getRequesterEmail())
                .requesterRole(updated.getRequesterRole())
                .requesterMessage(updated.getRequesterMessage())
                .status(updated.getStatus())
                .createdAt(updated.getCreatedAt())
                .build();
    }
}