package com.example.bookmystars.service;

import com.example.bookmystars.dto.PartnerRegistrationRequest;
import com.example.bookmystars.dto.PartnerResponseDto;
import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.AdminUserRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartnerService {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public PartnerResponseDto registerPartner(PartnerRegistrationRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Strict cross-table unique email check (users & admin_users tables)
        if (userRepository.existsByEmailIgnoreCase(email) || adminUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("The email address '" + email + "' is already registered in the system. Each account must have a strictly unique email address.");
        }

        // 2. Strict unique mobile number check
        String mobile = request.getMobileNumber().trim();
        if (userRepository.existsByMobileNumber(mobile)) {
            throw new IllegalArgumentException("The mobile number '" + mobile + "' is already registered. Please use a unique contact number.");
        }

        User partner = User.builder()
                .accountType(AccountType.PARTNER)
                .fullName(request.getBusinessName().trim())
                .stageName(request.getContactPersonName().trim())
                .email(email)
                .mobileNumber(mobile)
                .password(passwordEncoder.encode(request.getPassword()))
                .location(request.getLocation().trim())
                .termsAccepted(true)
                .isApproved(false)
                .verificationStatus("PENDING")
                .partnerCategory(request.getCategory() != null ? request.getCategory().trim() : "OTHER")
                .partnerRequirements(request.getRequirements() != null ? request.getRequirements().trim() : "")
                .partnerWebsite(request.getWebsiteUrl() != null ? request.getWebsiteUrl().trim() : "")
                .partnerAddress(request.getAddress() != null ? request.getAddress().trim() : "")
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(partner);
        log.info("New Partner Academy registered: {} (ID: {}) - Pending Super Admin verification", saved.getFullName(), saved.getId());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PartnerResponseDto> getPartners(String statusFilter) {
        List<User> partners = userRepository.findByAccountTypeOrderByIdDesc(AccountType.PARTNER);

        // Seed 2 sample partner academies if empty so Super Admin desk is immediately interactive
        if (partners.isEmpty()) {
            seedSamplePartners();
            partners = userRepository.findByAccountTypeOrderByIdDesc(AccountType.PARTNER);
        }

        if (statusFilter != null && !statusFilter.equalsIgnoreCase("ALL")) {
            final String filter = statusFilter.toUpperCase();
            partners = partners.stream()
                    .filter(p -> filter.equalsIgnoreCase(p.getVerificationStatus()))
                    .collect(Collectors.toList());
        }

        return partners.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getPendingPartnersCount() {
        List<User> partners = userRepository.findByAccountTypeOrderByIdDesc(AccountType.PARTNER);
        return partners.stream()
                .filter(p -> "PENDING".equalsIgnoreCase(p.getVerificationStatus()) || Boolean.FALSE.equals(p.getIsApproved()))
                .count();
    }

    @Transactional
    public PartnerResponseDto verifyPartner(Long partnerId, boolean approve, String reason) {
        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new IllegalArgumentException("Partner account with ID " + partnerId + " not found."));

        if (partner.getAccountType() != AccountType.PARTNER) {
            throw new IllegalArgumentException("User with ID " + partnerId + " is not a Partner account.");
        }

        if (approve) {
            partner.setIsApproved(true);
            partner.setVerificationStatus("APPROVED");
            partner.setApprovedAt(LocalDateTime.now());
            partner.setRejectionReason(null);
            log.info("Super Admin verified and approved Partner: {} (ID: {})", partner.getFullName(), partnerId);
        } else {
            partner.setIsApproved(false);
            partner.setVerificationStatus("REJECTED");
            partner.setRejectionReason(reason != null && !reason.isBlank() ? reason : "Application does not meet platform criteria");
            log.info("Super Admin rejected Partner: {} (ID: {}). Reason: {}", partner.getFullName(), partnerId, partner.getRejectionReason());
        }

        User updated = userRepository.save(partner);
        return mapToDto(updated);
    }

    private void seedSamplePartners() {
        try {
            if (!userRepository.existsByEmail("contact@shiamak.com")) {
                User p1 = User.builder()
                        .accountType(AccountType.PARTNER)
                        .fullName("Shiamak Davar Dance Academy")
                        .stageName("Kunal Verma (Head of Admissions)")
                        .email("contact@shiamak.com")
                        .mobileNumber("+91 9820011223")
                        .password(passwordEncoder.encode("Partner@1234"))
                        .location("Mumbai")
                        .partnerAddress("Bandra West, Mumbai, Maharashtra 400050")
                        .partnerWebsite("https://shiamakindia.com")
                        .partnerCategory("DANCE_ACADEMY")
                        .partnerRequirements("Promote One-Year Dance Certification (OYP) batches and source trained contemporary instructors.")
                        .termsAccepted(true)
                        .isApproved(false)
                        .verificationStatus("PENDING")
                        .createdAt(LocalDateTime.now().minusHours(2))
                        .build();
                userRepository.save(p1);
            }

            if (!userRepository.existsByEmail("info@actorprepares.net")) {
                User p2 = User.builder()
                        .accountType(AccountType.PARTNER)
                        .fullName("Actor Prepares - The School for Actors")
                        .stageName("Meenakshi Rao (Registrar)")
                        .email("info@actorprepares.net")
                        .mobileNumber("+91 9819922334")
                        .password(passwordEncoder.encode("Partner@1234"))
                        .location("Mumbai")
                        .partnerAddress("Film City Road, Goregaon East, Mumbai 400065")
                        .partnerWebsite("https://actorprepares.net")
                        .partnerCategory("ACTING_ACADEMY")
                        .partnerRequirements("Promote 3-Month Full Time Acting Diploma and showcase graduating students for auditions.")
                        .termsAccepted(true)
                        .isApproved(false)
                        .verificationStatus("PENDING")
                        .createdAt(LocalDateTime.now().minusHours(5))
                        .build();
                userRepository.save(p2);
            }
        } catch (Exception e) {
            log.warn("Could not seed initial sample partners: {}", e.getMessage());
        }
    }

    private PartnerResponseDto mapToDto(User u) {
        return PartnerResponseDto.builder()
                .id(u.getId())
                .businessName(u.getFullName())
                .contactPersonName(u.getStageName())
                .email(u.getEmail())
                .mobileNumber(u.getMobileNumber())
                .location(u.getLocation())
                .address(u.getPartnerAddress())
                .websiteUrl(u.getPartnerWebsite())
                .category(u.getPartnerCategory() != null ? u.getPartnerCategory() : "OTHER")
                .requirements(u.getPartnerRequirements())
                .isApproved(u.getIsApproved())
                .verificationStatus(u.getVerificationStatus() != null ? u.getVerificationStatus() : "PENDING")
                .rejectionReason(u.getRejectionReason())
                .approvedAt(u.getApprovedAt())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
