package com.example.bookmystars.service;

import com.example.bookmystars.dto.PartnerProfileDto;
import com.example.bookmystars.dto.PartnerRegistrationRequest;
import com.example.bookmystars.dto.PartnerResponseDto;
import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("local")
public class PartnerCrudTest {

    @Autowired
    private PartnerService partnerService;

    @Autowired
    private ClientPartnerProfileService clientPartnerProfileService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Transactional
    public void testPartnerRegistrationAndProfileCrud() {
        long ts = System.currentTimeMillis() % 100000000;
        String testEmail = "partner_" + ts + "@academy.org";
        String mobile = "97" + String.format("%08d", ts);

        // 1. CREATE: Register Academy / Business Partner
        PartnerRegistrationRequest req = new PartnerRegistrationRequest();
        req.setBusinessName("National Acting & Dance Academy");
        req.setCategory("Acting School");
        req.setContactPersonName("National Academy Director");
        req.setEmail(testEmail);
        req.setPassword("SecurePass@123");
        req.setMobileNumber(mobile);
        req.setLocation("Bangalore, Karnataka");
        req.setAddress("MG Road, Bangalore");
        req.setWebsiteUrl("https://nationalactingacademy.org");
        req.setRequirements("Seeking trained theater and film actors for campus placement.");

        PartnerResponseDto registered = partnerService.registerPartner(req);
        Assertions.assertNotNull(registered);
        Assertions.assertNotNull(registered.getId());
        Assertions.assertEquals("PENDING", registered.getVerificationStatus());
        System.out.println("PARTNER CREATE SUCCESS: ID " + registered.getId() + ", VerificationStatus: " + registered.getVerificationStatus());

        // 2. READ: Lookup User and Partner Profile
        User partnerUser = userRepository.findByEmail(testEmail).orElse(null);
        Assertions.assertNotNull(partnerUser);
        Assertions.assertEquals(AccountType.PARTNER, partnerUser.getAccountType());

        PartnerProfileDto profile = clientPartnerProfileService.getOrCreatePartnerProfile(partnerUser);
        Assertions.assertNotNull(profile);
        Assertions.assertEquals("National Acting & Dance Academy", profile.getAcademyName());
        System.out.println("PARTNER READ SUCCESS: Institute: " + profile.getAcademyName());

        // 3. UPDATE: Update Partner Academy Profile Details
        profile.setBio("Top premier institute training cinema professionals and certified artists.");
        profile.setWebsite("https://nationalactingacademy.org");
        profile.setActiveStudents("500+");

        PartnerProfileDto updatedProfile = clientPartnerProfileService.updatePartnerProfile(partnerUser, profile);
        Assertions.assertNotNull(updatedProfile);
        Assertions.assertEquals("https://nationalactingacademy.org", updatedProfile.getWebsite());
        System.out.println("PARTNER UPDATE SUCCESS: Website updated to " + updatedProfile.getWebsite());

        // 4. VERIFY / APPROVE: Super Admin approves partner account
        PartnerResponseDto approved = partnerService.verifyPartner(registered.getId(), true, null);
        Assertions.assertNotNull(approved);
        Assertions.assertEquals("APPROVED", approved.getVerificationStatus());
        Assertions.assertTrue(Boolean.TRUE.equals(approved.getIsApproved()));
        System.out.println("PARTNER APPROVAL SUCCESS: Status is now " + approved.getVerificationStatus());

        // 5. UPDATE LOGO: Test logo update & persistence (survives reload/refresh)
        profile.setLogoUrl("https://example.com/my-updated-logo.png");
        PartnerProfileDto logoUpdated = clientPartnerProfileService.updatePartnerProfile(partnerUser, profile);
        Assertions.assertEquals("https://example.com/my-updated-logo.png", logoUpdated.getLogoUrl());

        // Reload from database (simulates page refresh)
        PartnerProfileDto refreshed = clientPartnerProfileService.getOrCreatePartnerProfile(partnerUser);
        Assertions.assertEquals("https://example.com/my-updated-logo.png", refreshed.getLogoUrl());
        System.out.println("PARTNER LOGO REFRESH PERSISTENCE SUCCESS: " + refreshed.getLogoUrl());
    }
}
