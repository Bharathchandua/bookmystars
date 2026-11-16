package com.example.bookmystars.service;

import com.example.bookmystars.dto.ClientProfileDto;
import com.example.bookmystars.dto.ClientRegistrationRequest;
import com.example.bookmystars.dto.ClientResponseDto;
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
public class ClientCrudTest {

    @Autowired
    private ClientService clientService;

    @Autowired
    private ClientPartnerProfileService clientPartnerProfileService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Transactional
    public void testClientRegistrationAndProfileCrud() {
        long ts = System.currentTimeMillis() % 100000000;
        String testEmail = "brand_" + ts + "@luxuryfashion.com";
        String mobile = "96" + String.format("%08d", ts);

        // 1. CREATE: Register Commercial Brand Client
        ClientRegistrationRequest req = new ClientRegistrationRequest();
        req.setCompanyName("Titan & Fastrack Media");
        req.setIndustry("FASHION_APPAREL");
        req.setContactPersonName("Marketing Head");
        req.setEmail(testEmail);
        req.setPassword("SecurePass@123");
        req.setMobileNumber(mobile);
        req.setLocation("Mumbai, Maharashtra");
        req.setAddress("BKC Financial Center, Mumbai");
        req.setWebsiteUrl("https://titanfastrack.com");
        req.setRequirements("Seeking 5 fashion models and 2 voiceover artists for youth smartwatch ad campaign.");

        ClientResponseDto registered = clientService.registerClient(req);
        Assertions.assertNotNull(registered);
        Assertions.assertNotNull(registered.getId());
        Assertions.assertEquals("PENDING", registered.getVerificationStatus());
        System.out.println("CLIENT CREATE SUCCESS: ID " + registered.getId() + ", VerificationStatus: " + registered.getVerificationStatus());

        // 2. READ: Lookup User and Brand Profile
        User clientUser = userRepository.findByEmail(testEmail).orElse(null);
        Assertions.assertNotNull(clientUser);
        Assertions.assertEquals(AccountType.CLIENT, clientUser.getAccountType());

        ClientProfileDto profile = clientPartnerProfileService.getOrCreateClientProfile(clientUser);
        Assertions.assertNotNull(profile);
        Assertions.assertEquals("Titan & Fastrack Media", profile.getCompanyName());
        System.out.println("CLIENT READ SUCCESS: Brand: " + profile.getCompanyName());

        // 3. UPDATE: Update Brand Corporate Profile
        profile.setBio("Leading lifestyle and youth accessory brand producing high-energy commercials.");
        profile.setWebsite("https://fastrack.in");
        profile.setBudgetRange("50 Lakhs - 1 Crore");

        ClientProfileDto updatedProfile = clientPartnerProfileService.updateClientProfile(clientUser, profile);
        Assertions.assertNotNull(updatedProfile);
        Assertions.assertEquals("https://fastrack.in", updatedProfile.getWebsite());
        System.out.println("CLIENT UPDATE SUCCESS: Website updated to " + updatedProfile.getWebsite());

        // 4. VERIFY / APPROVE: Super Admin approves client brand
        ClientResponseDto approved = clientService.verifyClient(registered.getId(), true, null);
        Assertions.assertNotNull(approved);
        Assertions.assertEquals("APPROVED", approved.getVerificationStatus());
        Assertions.assertTrue(Boolean.TRUE.equals(approved.getIsApproved()));
        System.out.println("CLIENT APPROVAL SUCCESS: Status is now " + approved.getVerificationStatus());

        // 5. UPDATE LOGO: Test logo update & persistence (survives reload/refresh)
        profile.setLogoUrl("https://example.com/client-brand-logo.png");
        ClientProfileDto logoUpdated = clientPartnerProfileService.updateClientProfile(clientUser, profile);
        Assertions.assertEquals("https://example.com/client-brand-logo.png", logoUpdated.getLogoUrl());

        // Reload from database (simulates page refresh)
        ClientProfileDto refreshed = clientPartnerProfileService.getOrCreateClientProfile(clientUser);
        Assertions.assertEquals("https://example.com/client-brand-logo.png", refreshed.getLogoUrl());
        System.out.println("CLIENT LOGO REFRESH PERSISTENCE SUCCESS: " + refreshed.getLogoUrl());
    }
}
