package com.example.bookmystars.service;

import com.example.bookmystars.dto.CompanyShowcaseProfileDto;
import com.example.bookmystars.dto.CreateShowcaseRequest;
import com.example.bookmystars.dto.ShowcaseItemDto;
import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.ClientPartnerShowcaseRepository;
import com.example.bookmystars.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@ActiveProfiles("local")
public class ShowcaseCrudTest {

    @Autowired
    private ShowcaseService showcaseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClientPartnerShowcaseRepository showcaseRepository;

    @Test
    @Transactional
    public void testShowcaseCrudAndApprovalWorkflow() {
        long ts = System.currentTimeMillis() % 100000000;
        String email = "showcase_corp_" + ts + "@luxurybrand.com";

        // 1. Setup User in PostgreSQL
        User user = User.builder()
                .email(email)
                .fullName("Apex Luxury Shoots Corp")
                .password("$2a$10$xyzDummyHashForTestingPostgreSQL123")
                .accountType(AccountType.CLIENT)
                .mobileNumber("98" + String.format("%08d", ts))
                .location("Mumbai, Maharashtra")
                .termsAccepted(true)
                .build();
        user = userRepository.save(user);
        Assertions.assertNotNull(user.getId(), "User ID must be persisted in PostgreSQL");

        // 2. CREATE: Submit Photo Showcase Work (Must default to PENDING)
        CreateShowcaseRequest photoReq = CreateShowcaseRequest.builder()
                .title("Autumn High-Fashion Lookbook 2026")
                .description("Editorial photography campaign shot in Milan with international models.")
                .mediaType("PHOTO")
                .mediaUrl("/uploads/showcase/autumn_lookbook.jpg")
                .thumbnailUrl("/uploads/showcase/autumn_lookbook_thumb.jpg")
                .build();

        ShowcaseItemDto photoItem = showcaseService.createShowcaseItem(user, photoReq);
        Assertions.assertNotNull(photoItem.getId());
        Assertions.assertEquals("PENDING", photoItem.getStatus(), "Showcase item must start in PENDING status");
        Assertions.assertEquals("CLIENT", photoItem.getEntityType());
        System.out.println("PHOTO SHOWCASE CREATED (PENDING): ID " + photoItem.getId());

        // 3. CREATE: Submit Video Reel Showcase Work (Must default to PENDING)
        CreateShowcaseRequest videoReq = CreateShowcaseRequest.builder()
                .title("Commercial TV Advert & Brand Reel")
                .description("4K Commercial Ad reel featuring cinema artists.")
                .mediaType("VIDEO")
                .mediaUrl("/uploads/showcase/commercial_reel.mp4")
                .thumbnailUrl("/uploads/showcase/commercial_thumb.jpg")
                .build();

        ShowcaseItemDto videoItem = showcaseService.createShowcaseItem(user, videoReq);
        Assertions.assertNotNull(videoItem.getId());
        Assertions.assertEquals("PENDING", videoItem.getStatus());
        System.out.println("VIDEO SHOWCASE CREATED (PENDING): ID " + videoItem.getId());

        // 4. READ: Owner can see both items in their portfolio
        List<ShowcaseItemDto> myItems = showcaseService.getMyShowcaseItems(user);
        Assertions.assertEquals(2, myItems.size(), "Owner should see both pending showcase works");

        // 5. READ: Public user view MUST be empty before admin approval
        List<ShowcaseItemDto> publicApprovedBefore = showcaseService.getPublicApprovedShowcase(user.getId());
        Assertions.assertEquals(0, publicApprovedBefore.size(), "Public must NOT see works before Admin approval");

        CompanyShowcaseProfileDto publicDossierBefore = showcaseService.getPublicCompanyProfile(user.getId());
        Assertions.assertEquals(0, publicDossierBefore.getShowcaseItems().size(), "Public dossier must have 0 works before approval");

        // 6. ADMIN APPROVE: Admin approves the photo lookbook
        ShowcaseItemDto approvedPhoto = showcaseService.approveShowcaseItem(photoItem.getId(), "admin@bookmystars.com");
        Assertions.assertEquals("APPROVED", approvedPhoto.getStatus());
        Assertions.assertEquals("admin@bookmystars.com", approvedPhoto.getReviewedBy());
        Assertions.assertNotNull(approvedPhoto.getReviewedAt());
        System.out.println("SHOWCASE ITEM APPROVED: ID " + approvedPhoto.getId());

        // 7. ADMIN REJECT: Admin rejects the video reel with feedback
        ShowcaseItemDto rejectedVideo = showcaseService.rejectShowcaseItem(videoItem.getId(), "Audio clarity needs improvement", "admin@bookmystars.com");
        Assertions.assertEquals("REJECTED", rejectedVideo.getStatus());
        Assertions.assertEquals("Audio clarity needs improvement", rejectedVideo.getRejectionReason());
        System.out.println("SHOWCASE ITEM REJECTED WITH REASON: ID " + rejectedVideo.getId() + " - " + rejectedVideo.getRejectionReason());

        // 8. READ: Public user view now MUST contain ONLY the APPROVED photo work!
        List<ShowcaseItemDto> publicApprovedAfter = showcaseService.getPublicApprovedShowcase(user.getId());
        Assertions.assertEquals(1, publicApprovedAfter.size(), "Public must now see exactly the 1 approved showcase work");
        Assertions.assertEquals("Autumn High-Fashion Lookbook 2026", publicApprovedAfter.get(0).getTitle());

        CompanyShowcaseProfileDto publicDossierAfter = showcaseService.getPublicCompanyProfile(user.getId());
        Assertions.assertEquals(1, publicDossierAfter.getShowcaseItems().size());
        Assertions.assertEquals("Apex Luxury Shoots Corp", publicDossierAfter.getCompanyName());

        // 9. DELETE: Delete the rejected showcase work
        showcaseService.deleteMyShowcaseItem(user, videoItem.getId());
        List<ShowcaseItemDto> remainingItems = showcaseService.getMyShowcaseItems(user);
        Assertions.assertEquals(1, remainingItems.size());
        Assertions.assertEquals(photoItem.getId(), remainingItems.get(0).getId());
        System.out.println("SHOWCASE CRUD AND APPROVAL WORKFLOW VERIFIED SUCCESSFULLY AGAINST POSTGRESQL!");
    }
}
