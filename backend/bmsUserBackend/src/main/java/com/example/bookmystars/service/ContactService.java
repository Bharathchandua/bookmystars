package com.example.bookmystars.service;

import com.example.bookmystars.dto.ContactResponse;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final UserContactRepository userContactRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final ClientPartnerProfileRepository clientPartnerProfileRepository;
    private final WorkExperienceRepository workExperienceRepository;

    @Transactional(readOnly = true)
    public List<ContactResponse> getMyContacts(User owner) {
        List<UserContact> list = userContactRepository.findByUserOrderByCreatedAtDesc(owner);
        List<ContactResponse> results = new ArrayList<>();
        for (UserContact uc : list) {
            results.add(mapToResponse(uc));
        }
        return results;
    }

    @Transactional
    public ContactResponse saveContact(User owner, Long contactUserId) {
        if (owner.getId().equals(contactUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot save yourself as a contact");
        }

        User targetUser = userRepository.findById(contactUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found with ID: " + contactUserId));

        Optional<UserContact> existing = userContactRepository.findByUserAndContactUser(owner, targetUser);
        if (existing.isPresent()) {
            return mapToResponse(existing.get());
        }

        UserContact contact = UserContact.builder()
                .user(owner)
                .contactUser(targetUser)
                .isStarred(false)
                .build();

        UserContact saved = userContactRepository.save(contact);
        log.info("[CONTACTS] User {} saved contact user {}", owner.getEmail(), contactUserId);
        return mapToResponse(saved);
    }

    @Transactional
    public void removeContact(User owner, Long contactUserId) {
        User targetUser = userRepository.findById(contactUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found with ID: " + contactUserId));

        userContactRepository.findByUserAndContactUser(owner, targetUser)
                .ifPresent(uc -> {
                    userContactRepository.delete(uc);
                    log.info("[CONTACTS] User {} removed contact user {}", owner.getEmail(), contactUserId);
                });
    }

    @Transactional
    public ContactResponse toggleStarContact(User owner, Long contactUserId) {
        User targetUser = userRepository.findById(contactUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found with ID: " + contactUserId));

        UserContact uc = userContactRepository.findByUserAndContactUser(owner, targetUser)
                .orElseGet(() -> UserContact.builder()
                        .user(owner)
                        .contactUser(targetUser)
                        .isStarred(false)
                        .build());

        uc.setIsStarred(uc.getIsStarred() == null || !uc.getIsStarred());
        UserContact saved = userContactRepository.save(uc);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Map<String, Boolean> isContactSaved(User owner, Long contactUserId) {
        User targetUser = userRepository.findById(contactUserId).orElse(null);
        if (targetUser == null) {
            return Map.of("saved", false, "starred", false);
        }
        Optional<UserContact> existing = userContactRepository.findByUserAndContactUser(owner, targetUser);
        return Map.of(
                "saved", existing.isPresent(),
                "starred", existing.map(uc -> Boolean.TRUE.equals(uc.getIsStarred())).orElse(false)
        );
    }

    private ContactResponse mapToResponse(UserContact uc) {
        User target = uc.getContactUser();
        Profile profile = profileRepository.findByUser(target).orElse(null);
        ProfessionalProfile profProfile = professionalProfileRepository.findByUser(target).orElse(null);
        ClientPartnerProfile clientProfile = clientPartnerProfileRepository.findByUser(target).orElse(null);

        String role = determineRole(target, profile, profProfile);
        String company = determineCompany(target, profProfile, clientProfile);
        String location = determineLocation(target, profProfile);
        String avatar = determineAvatar(target, profile, profProfile, clientProfile);
        String about = determineAbout(profile, profProfile, clientProfile);
        String category = determineCategory(target, role);

        List<String> tags = new ArrayList<>();
        if (role != null && !role.isBlank()) tags.add(role);
        if (company != null && !company.isBlank() && !company.equals("Direct Connection")) tags.add(company);
        if (target.getAccountType() != null) tags.add(target.getAccountType().name());

        String email = target.getEmail() != null ? target.getEmail() : "";
        String phone = target.getMobileNumber() != null ? target.getMobileNumber() : (profProfile != null && profProfile.getContactPhone() != null ? profProfile.getContactPhone() : "");
        String website = profProfile != null && profProfile.getWebsite() != null ? profProfile.getWebsite() : (target.getPartnerWebsite() != null ? target.getPartnerWebsite() : "");

        Map<String, String> socials = new HashMap<>();
        String username = target.getFullName() != null ? target.getFullName().toLowerCase().replaceAll("\\s+", "") : "user";
        socials.put("instagram", "@" + username);
        socials.put("linkedin", "linkedin.com/in/" + username);
        socials.put("twitter", "@" + username);

        Map<String, Object> contactInfo = new HashMap<>();
        contactInfo.put("email", email);
        contactInfo.put("phone", phone);
        contactInfo.put("address", location);
        contactInfo.put("website", website);
        contactInfo.put("socials", socials);

        String logoText = (company != null && company.length() >= 3) ? company.substring(0, 3).toUpperCase() : "BMS";
        Map<String, Object> companyInfo = new HashMap<>();
        companyInfo.put("name", company);
        companyInfo.put("industry", role);
        companyInfo.put("founded", "2024");
        companyInfo.put("headOffice", location);
        companyInfo.put("website", website);
        companyInfo.put("logoText", logoText);

        List<Map<String, Object>> projectList = new ArrayList<>();
        try {
            List<WorkExperience> exps = workExperienceRepository.findByUser(target);
            for (WorkExperience we : exps) {
                Map<String, Object> p = new HashMap<>();
                p.put("id", we.getId() != null ? "p-" + we.getId() : UUID.randomUUID().toString());
                p.put("title", we.getTitle() != null ? we.getTitle() : "Project");
                p.put("type", we.getCategory() != null ? we.getCategory() : "Film / Shoot");
                p.put("role", we.getCategory() != null ? we.getCategory() : role);
                p.put("year", we.getStartDate() != null ? String.valueOf(we.getStartDate().getYear()) : "2024");
                p.put("cover", we.getFileUrl() != null ? we.getFileUrl() : "");
                projectList.add(p);
            }
        } catch (Exception ignored) {
        }

        return ContactResponse.builder()
                .id(uc.getId())
                .userId(target.getId())
                .name(target.getFullName() != null ? target.getFullName() : "User " + target.getId())
                .role(role)
                .company(company)
                .location(location)
                .avatar(avatar)
                .online(true)
                .starred(Boolean.TRUE.equals(uc.getIsStarred()))
                .category(category)
                .tags(tags)
                .contactInfo(contactInfo)
                .about(about != null && !about.isBlank() ? about : "Welcome to my network profile on BookMyStars.")
                .companyInfo(companyInfo)
                .projects(projectList)
                .notes(uc.getNotes() != null ? uc.getNotes() : "")
                .addedAt(uc.getCreatedAt())
                .build();
    }

    private String determineRole(User target, Profile profile, ProfessionalProfile profProfile) {
        if (target.getPrimaryProfession() != null && !target.getPrimaryProfession().isBlank()) {
            return target.getPrimaryProfession();
        }
        if (target.getCustomProfession() != null && !target.getCustomProfession().isBlank()) {
            return target.getCustomProfession();
        }
        if (profile != null && profile.getTalentCategory() != null && !profile.getTalentCategory().isBlank()) {
            return profile.getTalentCategory();
        }
        if (profProfile != null && profProfile.getCompanyType() != null && !profProfile.getCompanyType().isBlank()) {
            return profProfile.getCompanyType();
        }
        if (target.getAccountType() != null) {
            return target.getAccountType().name();
        }
        return "Industry Professional";
    }

    private String determineCompany(User target, ProfessionalProfile profProfile, ClientPartnerProfile clientProfile) {
        if (profProfile != null && profProfile.getCompanyName() != null && !profProfile.getCompanyName().isBlank()) {
            return profProfile.getCompanyName();
        }
        if (clientProfile != null && clientProfile.getCompanyName() != null && !clientProfile.getCompanyName().isBlank()) {
            return clientProfile.getCompanyName();
        }
        if (target.getStageName() != null && !target.getStageName().isBlank()) {
            return target.getStageName();
        }
        return "Direct Connection";
    }

    private String determineLocation(User target, ProfessionalProfile profProfile) {
        if (target.getLocation() != null && !target.getLocation().isBlank()) {
            return target.getLocation();
        }
        if (profProfile != null && profProfile.getOfficeAddress() != null && !profProfile.getOfficeAddress().isBlank()) {
            return profProfile.getOfficeAddress();
        }
        return "India";
    }

    private String determineAvatar(User target, Profile profile, ProfessionalProfile profProfile, ClientPartnerProfile clientProfile) {
        if (profile != null && profile.getProfilePhoto() != null && !profile.getProfilePhoto().isBlank()) {
            return profile.getProfilePhoto();
        }
        if (profProfile != null && profProfile.getLogoUrl() != null && !profProfile.getLogoUrl().isBlank()) {
            return profProfile.getLogoUrl();
        }
        if (clientProfile != null && clientProfile.getLogoUrl() != null && !clientProfile.getLogoUrl().isBlank()) {
            return clientProfile.getLogoUrl();
        }
        return null;
    }

    private String determineAbout(Profile profile, ProfessionalProfile profProfile, ClientPartnerProfile clientProfile) {
        if (profile != null && profile.getAbout() != null && !profile.getAbout().isBlank()) {
            return profile.getAbout();
        }
        if (profProfile != null && profProfile.getAbout() != null && !profProfile.getAbout().isBlank()) {
            return profProfile.getAbout();
        }
        if (clientProfile != null && clientProfile.getBio() != null && !clientProfile.getBio().isBlank()) {
            return clientProfile.getBio();
        }
        return "Cinema industry talent and professional profile.";
    }

    private String determineCategory(User target, String role) {
        String lowerRole = role != null ? role.toLowerCase() : "";
        if (lowerRole.contains("casting")) {
            return "Casting Directors";
        }
        if (lowerRole.contains("agency") || lowerRole.contains("studio") || lowerRole.contains("production")) {
            return "Agencies";
        }
        if (target.getAccountType() == AccountType.TALENT) {
            return "Co-stars";
        }
        return "Industry Professionals";
    }
}
