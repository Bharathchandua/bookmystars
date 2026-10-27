package com.example.bookmystars.service;

import com.example.bookmystars.dto.ClientRegistrationRequest;
import com.example.bookmystars.dto.ClientResponseDto;
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
public class ClientService {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ClientResponseDto registerClient(ClientRegistrationRequest request) {
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

        User client = User.builder()
                .accountType(AccountType.CLIENT)
                .fullName(request.getCompanyName().trim())
                .stageName(request.getContactPersonName().trim())
                .email(email)
                .mobileNumber(mobile)
                .password(passwordEncoder.encode(request.getPassword()))
                .location(request.getLocation().trim())
                .termsAccepted(true)
                .isApproved(false)
                .verificationStatus("PENDING")
                .partnerCategory(request.getIndustry() != null ? request.getIndustry().trim() : "OTHER")
                .partnerRequirements(request.getRequirements() != null ? request.getRequirements().trim() : "")
                .partnerWebsite(request.getWebsiteUrl() != null ? request.getWebsiteUrl().trim() : "")
                .partnerAddress(request.getAddress() != null ? request.getAddress().trim() : "")
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(client);
        log.info("New Client Brand registered: {} (ID: {}) - Pending Super Admin verification", saved.getFullName(), saved.getId());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ClientResponseDto> getClients(String statusFilter) {
        List<User> clients = userRepository.findByAccountTypeOrderByIdDesc(AccountType.CLIENT);

        // Seed realistic sample clients if empty so Super Admin switch desk is immediately interactive
        if (clients.isEmpty()) {
            seedSampleClients();
            clients = userRepository.findByAccountTypeOrderByIdDesc(AccountType.CLIENT);
        }

        if (statusFilter != null && !statusFilter.equalsIgnoreCase("ALL")) {
            final String filter = statusFilter.toUpperCase();
            clients = clients.stream()
                    .filter(c -> filter.equalsIgnoreCase(c.getVerificationStatus()))
                    .collect(Collectors.toList());
        }

        return clients.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getPendingClientsCount() {
        List<User> clients = userRepository.findByAccountTypeOrderByIdDesc(AccountType.CLIENT);
        return clients.stream()
                .filter(c -> "PENDING".equalsIgnoreCase(c.getVerificationStatus()) || Boolean.FALSE.equals(c.getIsApproved()))
                .count();
    }

    @Transactional
    public ClientResponseDto verifyClient(Long clientId, boolean approve, String reason) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client brand account with ID " + clientId + " not found."));

        if (client.getAccountType() != AccountType.CLIENT) {
            throw new IllegalArgumentException("User with ID " + clientId + " is not a Client brand account.");
        }

        if (approve) {
            client.setIsApproved(true);
            client.setVerificationStatus("APPROVED");
            client.setApprovedAt(LocalDateTime.now());
            client.setRejectionReason(null);
            log.info("Client brand approved by Super Admin: {} (ID: {})", client.getFullName(), client.getId());
        } else {
            client.setIsApproved(false);
            client.setVerificationStatus("REJECTED");
            client.setRejectionReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Application does not meet platform verification standards.");
            log.warn("Client brand rejected by Super Admin: {} (ID: {}). Reason: {}", client.getFullName(), client.getId(), client.getRejectionReason());
        }

        User updated = userRepository.save(client);
        return mapToDto(updated);
    }

    private void seedSampleClients() {
        try {
            User c1 = User.builder()
                    .accountType(AccountType.CLIENT)
                    .fullName("Tanishq Fine Jewelry & Diamonds")
                    .stageName("Rajeshwar Mehta")
                    .email("brand@tanishq-jewels.com")
                    .mobileNumber("+91 98200 44551")
                    .password(passwordEncoder.encode("Client@123"))
                    .location("Mumbai, Maharashtra")
                    .termsAccepted(true)
                    .isApproved(false)
                    .verificationStatus("PENDING")
                    .partnerCategory("JEWELRY_LUXURY")
                    .partnerRequirements("Seeking 4 top female models and 2 male actors for upcoming festive gold & diamond bridal video commercial campaign and national billboard shoot.")
                    .partnerWebsite("https://tanishq.co.in")
                    .partnerAddress("Tower B, World Trade Centre, Cuffe Parade, Mumbai")
                    .createdAt(LocalDateTime.now().minusHours(3))
                    .build();

            User c2 = User.builder()
                    .accountType(AccountType.CLIENT)
                    .fullName("Apex Power Tools & Hardware Corp")
                    .stageName("Vikram Singhania")
                    .email("marketing@apexhardware.in")
                    .mobileNumber("+91 98450 77882")
                    .password(passwordEncoder.encode("Client@123"))
                    .location("Bengaluru, Karnataka")
                    .termsAccepted(true)
                    .isApproved(false)
                    .verificationStatus("PENDING")
                    .partnerCategory("HARDWARE_MANUFACTURING")
                    .partnerRequirements("Seeking charismatic product presenters and energetic voiceover talent to shoot social media demonstration ads for our smart power tools line.")
                    .partnerWebsite("https://apexhardware.in")
                    .partnerAddress("Plot 42, Peenya Industrial Area, Phase II, Bengaluru")
                    .createdAt(LocalDateTime.now().minusHours(8))
                    .build();

            User c3 = User.builder()
                    .accountType(AccountType.CLIENT)
                    .fullName("Zara Elegance Apparel & Fashion")
                    .stageName("Ananya Kapoor")
                    .email("press@zara-elegance.com")
                    .mobileNumber("+91 98110 33445")
                    .password(passwordEncoder.encode("Client@123"))
                    .location("New Delhi, Delhi")
                    .termsAccepted(true)
                    .isApproved(true)
                    .verificationStatus("APPROVED")
                    .approvedAt(LocalDateTime.now().minusDays(1))
                    .partnerCategory("FASHION_APPAREL")
                    .partnerRequirements("Winter collection lookbook video shoot needing 6 high-fashion runway models in New Delhi.")
                    .partnerWebsite("https://zara-elegance.com")
                    .partnerAddress("DLF Promenade, Vasant Kunj, New Delhi")
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .build();

            userRepository.saveAll(List.of(c1, c2, c3));
            log.info("Sample client brands seeded successfully (Tanishq, Apex Hardware, Zara Elegance).");
        } catch (Exception e) {
            log.warn("Could not seed sample client brands: {}", e.getMessage());
        }
    }

    private ClientResponseDto mapToDto(User u) {
        return ClientResponseDto.builder()
                .id(u.getId())
                .companyName(u.getFullName())
                .industry(u.getPartnerCategory())
                .contactPersonName(u.getStageName())
                .email(u.getEmail())
                .mobileNumber(u.getMobileNumber())
                .location(u.getLocation())
                .address(u.getPartnerAddress())
                .websiteUrl(u.getPartnerWebsite())
                .requirements(u.getPartnerRequirements())
                .isApproved(u.getIsApproved())
                .verificationStatus(u.getVerificationStatus())
                .rejectionReason(u.getRejectionReason())
                .approvedAt(u.getApprovedAt())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
