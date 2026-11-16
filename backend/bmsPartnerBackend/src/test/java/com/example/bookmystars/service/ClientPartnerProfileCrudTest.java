package com.example.bookmystars.service;

import com.example.bookmystars.dto.ClientProfileDto;
import com.example.bookmystars.dto.PartnerProfileDto;
import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.ClientPartnerProfile;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.ClientPartnerProfileRepository;
import com.example.bookmystars.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@SpringBootTest
@ActiveProfiles("local")
public class ClientPartnerProfileCrudTest {

    @Autowired
    private ClientPartnerProfileService clientPartnerProfileService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientPartnerProfileRepository profileRepository;

    @Test
    @Transactional
    public void testPartnerProfileCrudAndLogoPersistence() throws IOException {
        // 1. Create or get test Partner user
        String email = "partner_test_" + System.currentTimeMillis() + "@bookmystars.com";
        User partner = User.builder()
                .email(email)
                .password("hashpass")
                .fullName("Test Partner Academy")
                .accountType(AccountType.PARTNER)
                .location("Bengaluru, Karnataka")
                .mobileNumber("+91 98450 12345")
                .partnerCategory("Dance & Performing Arts")
                .isApproved(true)
                .build();
        partner = userRepository.save(partner);

        // 2. Fetch default / initial profile
        PartnerProfileDto initialDto = clientPartnerProfileService.getOrCreatePartnerProfile(partner);
        Assertions.assertNotNull(initialDto);
        Assertions.assertEquals("Test Partner Academy", initialDto.getAcademyName());

        // 3. Update partner profile details
        PartnerProfileDto updateRequest = PartnerProfileDto.builder()
                .academyName("Bangalore Dance Ensemble")
                .category("Contemporary Dance")
                .tagline("Premier Arts Center")
                .directorName("Director Meera")
                .designation("Artistic Director")
                .email(email)
                .phone("+91 99999 11111")
                .city("Bengaluru")
                .address("123 Indiranagar, Bengaluru")
                .website("https://bangaloredance.org")
                .instagram("blr_dance")
                .trainingBatches(List.of("Batch Alpha", "Batch Beta"))
                .bio("Established dance institute testing PostgreSQL CRUD.")
                .build();

        PartnerProfileDto updatedDto = clientPartnerProfileService.updatePartnerProfile(partner, updateRequest);
        Assertions.assertNotNull(updatedDto);
        Assertions.assertEquals("Bangalore Dance Ensemble", updatedDto.getAcademyName());
        Assertions.assertEquals("Contemporary Dance", updatedDto.getCategory());
        Assertions.assertEquals("Director Meera", updatedDto.getDirectorName());

        // 4. Verify in PostgreSQL table
        ClientPartnerProfile inDb = profileRepository.findByUser(partner).orElse(null);
        Assertions.assertNotNull(inDb);
        Assertions.assertEquals("Bangalore Dance Ensemble", inDb.getCompanyName());
        Assertions.assertEquals("Contemporary Dance", inDb.getIndustry());
        Assertions.assertEquals("Director Meera", inDb.getContactPerson());

        // 5. Upload new partner logo via mock file
        byte[] fakeImageContent = "FAKE_JPEG_IMAGE_CONTENT_FOR_TESTING".getBytes();
        MockMultipartFile logoFile = new MockMultipartFile(
                "file",
                "test_partner_logo.jpg",
                "image/jpeg",
                fakeImageContent
        );

        PartnerProfileDto logoDto = clientPartnerProfileService.uploadPartnerLogo(partner, logoFile);
        Assertions.assertNotNull(logoDto);
        Assertions.assertNotNull(logoDto.getLogoUrl());
        Assertions.assertTrue(logoDto.getLogoUrl().startsWith("/uploads/profile/logo_partner_"));

        // 6. Verify logo URL in PostgreSQL is saved and persistent on re-fetch
        ClientPartnerProfile inDbAfterLogo = profileRepository.findByUser(partner).orElse(null);
        Assertions.assertNotNull(inDbAfterLogo);
        Assertions.assertEquals(logoDto.getLogoUrl(), inDbAfterLogo.getLogoUrl());

        PartnerProfileDto reFetched = clientPartnerProfileService.getOrCreatePartnerProfile(partner);
        Assertions.assertEquals(logoDto.getLogoUrl(), reFetched.getLogoUrl());
        Assertions.assertFalse(reFetched.getLogoUrl().contains("unsplash"));

        System.out.println("✅ Partner Profile CRUD and Logo persistence verified in PostgreSQL: " + reFetched.getLogoUrl());
    }

    @Test
    @Transactional
    public void testClientProfileCrudAndLogoPersistence() throws IOException {
        // 1. Create or get test Client user
        String email = "client_test_" + System.currentTimeMillis() + "@bookmystars.com";
        User client = User.builder()
                .email(email)
                .password("hashpass")
                .fullName("Test Luxury Client")
                .accountType(AccountType.CLIENT)
                .location("Mumbai, Maharashtra")
                .mobileNumber("+91 98765 43210")
                .customProfession("Jewelry & Diamonds")
                .isApproved(true)
                .build();
        client = userRepository.save(client);

        // 2. Fetch default / initial profile
        ClientProfileDto initialDto = clientPartnerProfileService.getOrCreateClientProfile(client);
        Assertions.assertNotNull(initialDto);

        // 3. Update client profile details
        ClientProfileDto updateRequest = ClientProfileDto.builder()
                .companyName("Kalyan Jewelers Production")
                .industry("Fine Gold & Diamonds")
                .tagline("Purity in Every Karat")
                .contactPerson("Rajesh Kalyan")
                .designation("Creative VP")
                .email(email)
                .phone("+91 88888 22222")
                .city("Thrissur, Kerala")
                .address("Kalyan Towers, MG Road")
                .website("https://kalyanjewellers.net")
                .budgetRange("₹1,00,000 - ₹5,00,000")
                .preferredProfiles(List.of("Bridal Models", "Commercial Dancers"))
                .bio("Leading national jewelry brand casting for Diwali TV commercials.")
                .build();

        ClientProfileDto updatedDto = clientPartnerProfileService.updateClientProfile(client, updateRequest);
        Assertions.assertNotNull(updatedDto);
        Assertions.assertEquals("Kalyan Jewelers Production", updatedDto.getCompanyName());
        Assertions.assertEquals("Rajesh Kalyan", updatedDto.getContactPerson());

        // 4. Verify in PostgreSQL table
        ClientPartnerProfile inDb = profileRepository.findByUser(client).orElse(null);
        Assertions.assertNotNull(inDb);
        Assertions.assertEquals("Kalyan Jewelers Production", inDb.getCompanyName());
        Assertions.assertEquals("Rajesh Kalyan", inDb.getContactPerson());

        // 5. Upload new client logo via mock file
        byte[] fakeImageContent = "FAKE_JPEG_IMAGE_FOR_CLIENT_TESTING".getBytes();
        MockMultipartFile logoFile = new MockMultipartFile(
                "file",
                "test_client_logo.jpg",
                "image/jpeg",
                fakeImageContent
        );

        ClientProfileDto logoDto = clientPartnerProfileService.uploadClientLogo(client, logoFile);
        Assertions.assertNotNull(logoDto);
        Assertions.assertNotNull(logoDto.getLogoUrl());
        Assertions.assertTrue(logoDto.getLogoUrl().startsWith("/uploads/profile/logo_client_"));

        // 6. Verify logo URL in PostgreSQL is saved and persistent on re-fetch
        ClientPartnerProfile inDbAfterLogo = profileRepository.findByUser(client).orElse(null);
        Assertions.assertNotNull(inDbAfterLogo);
        Assertions.assertEquals(logoDto.getLogoUrl(), inDbAfterLogo.getLogoUrl());

        ClientProfileDto reFetched = clientPartnerProfileService.getOrCreateClientProfile(client);
        Assertions.assertEquals(logoDto.getLogoUrl(), reFetched.getLogoUrl());

        System.out.println("✅ Client Profile CRUD and Logo persistence verified in PostgreSQL: " + reFetched.getLogoUrl());
    }
}
