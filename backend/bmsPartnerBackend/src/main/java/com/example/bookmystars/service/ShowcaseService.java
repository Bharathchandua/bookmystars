package com.example.bookmystars.service;

import com.example.bookmystars.dto.CastingCallResponse;
import com.example.bookmystars.dto.CompanyShowcaseProfileDto;
import com.example.bookmystars.dto.CreateShowcaseRequest;
import com.example.bookmystars.dto.ShowcaseItemDto;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.*;
import com.example.bookmystars.util.FileValidationUtil;
import com.example.bookmystars.util.UploadStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShowcaseService {

    private final ClientPartnerShowcaseRepository showcaseRepository;
    private final UserRepository userRepository;
    private final ClientPartnerProfileRepository clientPartnerProfileRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final CastingCallRepository castingCallRepository;
    private final CastingApplicationRepository castingApplicationRepository;

    /**
     * Upload physical photo or video for showcase works
     */
    public Map<String, String> uploadShowcaseMedia(MultipartFile file, String mediaType) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }

        String extension;
        String detectedType = (mediaType != null) ? mediaType.toUpperCase(Locale.ROOT) : "PHOTO";
        if ("VIDEO".equalsIgnoreCase(detectedType)) {
            extension = FileValidationUtil.validateVideo(file);
        } else {
            extension = FileValidationUtil.validateImage(file);
        }

        try {
            Path showcaseDir = UploadStorageUtil.getCategoryUploadDir("showcase");
            String fileName = "showcase_" + UUID.randomUUID() + extension;
            Path targetFile = showcaseDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            String webUrl = "/uploads/showcase/" + fileName;
            log.info("Saved showcase file to: {} (Web URL: {})", targetFile, webUrl);

            return Map.of(
                    "url", webUrl,
                    "mediaType", detectedType,
                    "fileName", fileName
            );
        } catch (IOException e) {
            log.error("Failed to store showcase media file", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file: " + e.getMessage());
        }
    }

    /**
     * Create a new showcase item. It always enters PENDING status awaiting Admin approval.
     */
    @Transactional
    public ShowcaseItemDto createShowcaseItem(User user, CreateShowcaseRequest request) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
        }

        String entityType = "CLIENT";
        if (user.getAccountType() != null && "PARTNER".equalsIgnoreCase(user.getAccountType().name())) {
            entityType = "PARTNER";
        } else {
            Optional<ClientPartnerProfile> optProfile = clientPartnerProfileRepository.findByUser(user);
            if (optProfile.isPresent() && "PARTNER".equalsIgnoreCase(optProfile.get().getProfileType())) {
                entityType = "PARTNER";
            }
        }

        String mediaUrl = request.getMediaUrl();
        if (mediaUrl != null && mediaUrl.startsWith("data:")) {
            mediaUrl = storeBase64ShowcaseFile(mediaUrl, user.getId());
        }

        ClientPartnerShowcase showcase = ClientPartnerShowcase.builder()
                .user(user)
                .entityType(entityType)
                .title(request.getTitle())
                .description(request.getDescription())
                .mediaType(request.getMediaType() != null ? request.getMediaType().toUpperCase(Locale.ROOT) : "PHOTO")
                .mediaUrl(mediaUrl)
                .thumbnailUrl(request.getThumbnailUrl())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        ClientPartnerShowcase saved = showcaseRepository.save(showcase);
        log.info("Created new showcase item ID {} by user {} (Status: PENDING)", saved.getId(), user.getEmail());
        return mapToDto(saved);
    }

    /**
     * Retrieve all showcase items for current logged-in client or partner
     */
    @Transactional(readOnly = true)
    public List<ShowcaseItemDto> getMyShowcaseItems(User user) {
        return showcaseRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Delete own showcase item
     */
    @Transactional
    public void deleteMyShowcaseItem(User user, Long showcaseId) {
        ClientPartnerShowcase item = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Showcase item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this showcase item");
        }

        showcaseRepository.delete(item);
        log.info("Showcase item ID {} deleted by owner {}", showcaseId, user.getEmail());
    }

    /**
     * Public Read-Only: Get all APPROVED showcase items for a specific company or academy user
     */
    @Transactional(readOnly = true)
    public List<ShowcaseItemDto> getPublicApprovedShowcase(Long userId) {
        return showcaseRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "APPROVED")
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Public Dossier: Get full company or partner profile including APPROVED showcase works and active opportunities
     */
    @Transactional(readOnly = true)
    public CompanyShowcaseProfileDto getPublicCompanyProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Company or academy account not found"));

        Optional<ClientPartnerProfile> cpOpt = clientPartnerProfileRepository.findByUser(user);
        Optional<ProfessionalProfile> profOpt = professionalProfileRepository.findByUserId(userId);

        String companyName = null;
        String industry = null;
        String tagline = null;
        String contactPerson = user.getFullName();
        String designation = null;
        String email = user.getEmail();
        String phone = user.getMobileNumber();
        String city = null;
        String address = null;
        String website = null;
        String instagram = null;
        String linkedin = null;
        String youtube = null;
        String facebook = null;
        String twitter = null;
        String whatsapp = null;
        String socialVisibility = null;
        String mapCoordinates = null;
        String logoUrl = null;
        String bio = null;
        Boolean verified = true;
        String entityType = (user.getAccountType() != null) ? user.getAccountType().name() : "CLIENT";

        if (cpOpt.isPresent()) {
            ClientPartnerProfile cp = cpOpt.get();
            entityType = cp.getProfileType() != null ? cp.getProfileType() : entityType;
            companyName = cp.getCompanyName();
            industry = cp.getIndustry();
            tagline = cp.getTagline();
            if (cp.getContactPerson() != null) contactPerson = cp.getContactPerson();
            designation = cp.getDesignation();
            if (cp.getEmail() != null) email = cp.getEmail();
            if (cp.getPhone() != null) phone = cp.getPhone();
            city = cp.getCity();
            address = cp.getAddress();
            website = cp.getWebsite();
            instagram = cp.getInstagram();
            linkedin = cp.getLinkedin();
            youtube = cp.getYoutube();
            facebook = cp.getFacebook();
            twitter = cp.getTwitter();
            whatsapp = cp.getWhatsapp();
            socialVisibility = cp.getSocialVisibility();
            mapCoordinates = cp.getMapCoordinates();
            logoUrl = cp.getLogoUrl();
            bio = cp.getBio();
            if (cp.getVerified() != null) verified = cp.getVerified();
        } else if (profOpt.isPresent()) {
            ProfessionalProfile pp = profOpt.get();
            companyName = pp.getCompanyName();
            website = pp.getWebsite();
            bio = pp.getAbout();
            address = pp.getOfficeAddress();
            if (pp.getLogoUrl() != null) logoUrl = pp.getLogoUrl();
            if (pp.getIsVerified() != null) verified = pp.getIsVerified();
        }

        if (companyName == null || companyName.isBlank()) {
            companyName = user.getFullName();
        }

        // Fetch strictly APPROVED showcase works
        List<ShowcaseItemDto> showcaseItems = showcaseRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, "APPROVED")
                .stream()
                .map(this::mapToDto)
                .toList();

        // Fetch active open casting opportunities posted by this company
        List<CastingCallResponse> activeOpportunities = castingCallRepository
                .findByPostedByIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(c -> c.getStatus() == CastingStatus.OPEN)
                .map(this::mapCastingCallToResponse)
                .toList();

        return CompanyShowcaseProfileDto.builder()
                .userId(userId)
                .entityType(entityType)
                .companyName(companyName)
                .industry(industry)
                .tagline(tagline)
                .contactPerson(contactPerson)
                .designation(designation)
                .email(email)
                .phone(phone)
                .city(city)
                .address(address)
                .website(website)
                .instagram(instagram)
                .linkedin(linkedin)
                .youtube(youtube)
                .facebook(facebook)
                .twitter(twitter)
                .whatsapp(whatsapp)
                .socialVisibility(socialVisibility)
                .mapCoordinates(mapCoordinates)
                .logoUrl(logoUrl)
                .bio(bio)
                .verified(verified)
                .showcaseItems(showcaseItems)
                .activeOpportunities(activeOpportunities)
                .build();
    }

    /**
     * Admin: Get showcase items for review with optional entityType and status filters
     */
    @Transactional(readOnly = true)
    public List<ShowcaseItemDto> getAdminShowcaseItems(String entityType, String status) {
        List<ClientPartnerShowcase> list;
        boolean filterStatus = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status));
        boolean filterType = (entityType != null && !entityType.isBlank() && !"ALL".equalsIgnoreCase(entityType));

        if (filterType && filterStatus) {
            list = showcaseRepository.findByEntityTypeAndStatusOrderByCreatedAtDesc(entityType.toUpperCase(Locale.ROOT), status.toUpperCase(Locale.ROOT));
        } else if (filterType) {
            list = showcaseRepository.findByEntityTypeOrderByCreatedAtDesc(entityType.toUpperCase(Locale.ROOT));
        } else if (filterStatus) {
            list = showcaseRepository.findAll().stream()
                    .filter(i -> status.equalsIgnoreCase(i.getStatus()))
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        } else {
            list = showcaseRepository.findAll().stream()
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .toList();
        }

        return list.stream().map(this::mapToDto).toList();
    }

    /**
     * Admin: Approve showcase work
     */
    @Transactional
    public ShowcaseItemDto approveShowcaseItem(Long showcaseId, String adminEmail) {
        ClientPartnerShowcase item = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Showcase item not found"));

        item.setStatus("APPROVED");
        item.setReviewedBy(adminEmail);
        item.setReviewedAt(LocalDateTime.now());
        item.setRejectionReason(null);
        ClientPartnerShowcase saved = showcaseRepository.save(item);
        log.info("Showcase item ID {} APPROVED by admin {}", showcaseId, adminEmail);
        return mapToDto(saved);
    }

    /**
     * Admin: Reject showcase work with reason
     */
    @Transactional
    public ShowcaseItemDto rejectShowcaseItem(Long showcaseId, String reason, String adminEmail) {
        ClientPartnerShowcase item = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Showcase item not found"));

        item.setStatus("REJECTED");
        item.setRejectionReason(reason != null && !reason.isBlank() ? reason : "Submission does not meet quality standards");
        item.setReviewedBy(adminEmail);
        item.setReviewedAt(LocalDateTime.now());
        ClientPartnerShowcase saved = showcaseRepository.save(item);
        log.info("Showcase item ID {} REJECTED by admin {}: {}", showcaseId, adminEmail, item.getRejectionReason());
        return mapToDto(saved);
    }

    /**
     * Admin: Delete showcase item permanently
     */
    @Transactional
    public void deleteShowcaseItemByAdmin(Long showcaseId) {
        ClientPartnerShowcase item = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Showcase item not found"));
        showcaseRepository.delete(item);
        log.info("Showcase item ID {} permanently deleted by Admin", showcaseId);
    }

    private ShowcaseItemDto mapToDto(ClientPartnerShowcase item) {
        User u = item.getUser();
        String companyName = null;
        String logoUrl = null;
        if (u != null) {
            Optional<ClientPartnerProfile> cpOpt = clientPartnerProfileRepository.findByUser(u);
            if (cpOpt.isPresent()) {
                companyName = cpOpt.get().getCompanyName();
                logoUrl = cpOpt.get().getLogoUrl();
            } else {
                companyName = u.getFullName();
            }
        }

        return ShowcaseItemDto.builder()
                .id(item.getId())
                .userId(u != null ? u.getId() : null)
                .userFullName(u != null ? u.getFullName() : null)
                .userEmail(u != null ? u.getEmail() : null)
                .companyName(companyName)
                .logoUrl(logoUrl)
                .entityType(item.getEntityType())
                .title(item.getTitle())
                .description(item.getDescription())
                .mediaType(item.getMediaType())
                .mediaUrl(item.getMediaUrl())
                .thumbnailUrl(item.getThumbnailUrl())
                .status(item.getStatus())
                .rejectionReason(item.getRejectionReason())
                .reviewedBy(item.getReviewedBy())
                .reviewedAt(item.getReviewedAt())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private CastingCallResponse mapCastingCallToResponse(CastingCall call) {
        long applicantCount = castingApplicationRepository.countByCastingCallId(call.getId());
        String comp = null;
        if (call.getPostedBy() != null) {
            Optional<ClientPartnerProfile> cpp = clientPartnerProfileRepository.findByUser(call.getPostedBy());
            if (cpp.isPresent() && cpp.get().getCompanyName() != null) {
                comp = cpp.get().getCompanyName();
            } else {
                comp = professionalProfileRepository.findByUserId(call.getPostedBy().getId())
                        .map(ProfessionalProfile::getCompanyName)
                        .orElse(call.getPostedBy().getFullName());
            }
        }

        return CastingCallResponse.builder()
                .id(call.getId())
                .postedByUserId(call.getPostedBy() != null ? call.getPostedBy().getId() : null)
                .postedByUserName(call.getPostedBy() != null ? call.getPostedBy().getFullName() : null)
                .companyName(comp)
                .title(call.getTitle())
                .projectType(call.getProjectType())
                .postType(call.getPostType() != null ? call.getPostType() : (call.getRoleType() != null ? call.getRoleType().name() : "ACTING"))
                .requiredLanguages(call.getRequiredLanguages())
                .roleType(call.getRoleType())
                .description(call.getDescription())
                .requirements(call.getRequirements())
                .location(call.getLocation())
                .budget(call.getBudget())
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
                .status(call.getStatus())
                .applicantCount(applicantCount)
                .createdAt(call.getCreatedAt())
                .updatedAt(call.getUpdatedAt())
                .build();
    }

    private String storeBase64ShowcaseFile(String base64Data, Long userId) {
        try {
            String[] parts = base64Data.split(",");
            String header = parts[0];
            String data = parts.length > 1 ? parts[1] : parts[0];

            String extension = ".jpg";
            if (header.contains("image/png")) extension = ".png";
            else if (header.contains("image/webp")) extension = ".webp";
            else if (header.contains("video/mp4")) extension = ".mp4";
            else if (header.contains("video/webm")) extension = ".webm";

            byte[] decodedBytes = Base64.getDecoder().decode(data);
            Path showcaseDir = UploadStorageUtil.getCategoryUploadDir("showcase");
            String fileName = "showcase_user_" + userId + "_" + UUID.randomUUID() + extension;
            Path filePath = showcaseDir.resolve(fileName);
            Files.write(filePath, decodedBytes);
            return "/uploads/showcase/" + fileName;
        } catch (Exception e) {
            log.error("Failed to decode base64 showcase media for user: {}", userId, e);
            return base64Data;
        }
    }
}
