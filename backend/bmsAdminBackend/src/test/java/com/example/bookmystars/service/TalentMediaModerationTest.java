package com.example.bookmystars.service;

import com.example.bookmystars.dto.*;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest
@ActiveProfiles("local")
public class TalentMediaModerationTest {

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private VideoService videoService;

    @Autowired
    private AudioService audioService;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private AdminOperationsService adminOperationsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private AudioRepository audioRepository;

    @Test
    @Transactional
    public void testTalentMediaModerationOption2() {
        long ts = System.currentTimeMillis() % 100000000;
        String unverifiedEmail = "new_talent_" + ts + "@stars.com";

        // ─────────────────────────────────────────────────────────────
        // 1. UNVERIFIED TALENT (New Sign-Up: isApproved = false)
        // ─────────────────────────────────────────────────────────────
        User unverifiedUser = User.builder()
                .email(unverifiedEmail)
                .fullName("Aarav Roy")
                .stageName("Aarav R.")
                .password("$2a$10$xyzDummyHashForTestingPostgreSQL123")
                .accountType(AccountType.TALENT)
                .mobileNumber("97" + String.format("%08d", ts))
                .location("Mumbai, India")
                .isApproved(false)
                .verificationStatus("PENDING")
                .termsAccepted(true)
                .build();
        unverifiedUser = userRepository.save(unverifiedUser);
        Assertions.assertNotNull(unverifiedUser.getId());

        // A. Upload / Save Photo -> MUST BE "PENDING"
        Portfolio newPhoto = Portfolio.builder()
                .user(unverifiedUser)
                .imageUrl("/uploads/portfolio/aarav_headshot_" + ts + ".jpg")
                .title("Aarav Commercial Headshot")
                .category("Acting")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
        Portfolio savedPhoto = portfolioRepository.save(newPhoto);
        final Long photoId = savedPhoto.getId();
        Assertions.assertEquals("PENDING", savedPhoto.getStatus(), "Unverified talent photo must be PENDING");

        // B. Upload Video Reel -> MUST BE "PENDING"
        VideoResponse videoResp = videoService.createVideo(unverifiedEmail, VideoRequest.builder()
                .title("Monologue Dramatic Audition Reel")
                .category("Acting")
                .videoUrl("/uploads/videos/aarav_monologue_" + ts + ".mp4")
                .duration("02:30")
                .year(2026)
                .build());
        final Long videoId = videoResp.getId();
        Assertions.assertEquals("PENDING", videoResp.getStatus(), "Unverified talent video must be PENDING");

        // C. Upload Audio Track -> MUST BE "PENDING"
        AudioResponse audioResp = audioService.createAudio(unverifiedEmail, AudioRequest.builder()
                .title("Hindi Voiceover Commercial")
                .category("Voiceover")
                .audioUrl("/uploads/audios/aarav_vo_" + ts + ".mp3")
                .format("MP3")
                .duration("01:10")
                .build());
        final Long audioId = audioResp.getId();
        Assertions.assertEquals("PENDING", audioResp.getStatus(), "Unverified talent audio must be PENDING");

        // ─────────────────────────────────────────────────────────────
        // 2. PUBLIC PROFILE MUST HIDE ALL PENDING MEDIA
        // ─────────────────────────────────────────────────────────────
        PublicProfileResponse publicProfile = profileService.getPublicProfile(unverifiedUser.getId());
        Assertions.assertTrue(
                publicProfile.getPortfolio().stream().noneMatch(p -> p.getId().equals(photoId)),
                "Public profile MUST NOT show pending portfolio photo"
        );
        Assertions.assertTrue(
                publicProfile.getVideos().stream().noneMatch(v -> v.getId().equals(videoId)),
                "Public profile MUST NOT show pending video reel"
        );
        Assertions.assertTrue(
                publicProfile.getAudios().stream().noneMatch(a -> a.getId().equals(audioId)),
                "Public profile MUST NOT show pending audio track"
        );

        // ─────────────────────────────────────────────────────────────
        // 3. TALENT'S PRIVATE EDIT VIEW MUST SHOW ITEMS WITH STATUS
        // ─────────────────────────────────────────────────────────────
        List<PortfolioResponse> myPhotos = portfolioService.getMyPortfolio(unverifiedEmail);
        Assertions.assertTrue(myPhotos.stream().anyMatch(p -> p.getId().equals(photoId) && "PENDING".equals(p.getStatus())));

        List<VideoResponse> myVideos = videoService.getMyVideos(unverifiedEmail);
        Assertions.assertTrue(myVideos.stream().anyMatch(v -> v.getId().equals(videoId) && "PENDING".equals(v.getStatus())));

        List<AudioResponse> myAudios = audioService.getMyAudios(unverifiedEmail);
        Assertions.assertTrue(myAudios.stream().anyMatch(a -> a.getId().equals(audioId) && "PENDING".equals(a.getStatus())));

        // ─────────────────────────────────────────────────────────────
        // 4. ADMIN QUEUE: MUST SEE PENDING TALENT MEDIA
        // ─────────────────────────────────────────────────────────────
        List<AdminTalentMediaItemDto> pendingMedia = adminOperationsService.getPendingTalentMedia();
        Assertions.assertTrue(pendingMedia.stream().anyMatch(m -> m.getId().equals(photoId) && "PHOTO".equals(m.getMediaType())));
        Assertions.assertTrue(pendingMedia.stream().anyMatch(m -> m.getId().equals(videoId) && "VIDEO".equals(m.getMediaType())));
        Assertions.assertTrue(pendingMedia.stream().anyMatch(m -> m.getId().equals(audioId) && "AUDIO".equals(m.getMediaType())));

        // ─────────────────────────────────────────────────────────────
        // 5. ADMIN APPROVAL WORKFLOW
        // ─────────────────────────────────────────────────────────────
        Authentication adminAuth = new UsernamePasswordAuthenticationToken("superadmin@bookmystars.com", "pass");

        // Admin approves photo
        AdminTalentMediaItemDto approvedPhoto = adminOperationsService.reviewTalentMedia(
                adminAuth, "photo", photoId,
                ReviewMediaRequest.builder().status("APPROVED").build()
        );
        Assertions.assertEquals("APPROVED", approvedPhoto.getStatus());
        Assertions.assertEquals("superadmin@bookmystars.com", approvedPhoto.getReviewedBy());
        Assertions.assertNotNull(approvedPhoto.getReviewedAt());

        // Now photo MUST appear in public profile!
        PublicProfileResponse publicProfileAfterPhotoApprove = profileService.getPublicProfile(unverifiedUser.getId());
        Assertions.assertTrue(
                publicProfileAfterPhotoApprove.getPortfolio().stream().anyMatch(p -> p.getId().equals(photoId)),
                "Public profile MUST show approved portfolio photo"
        );

        // ─────────────────────────────────────────────────────────────
        // 6. ADMIN REJECTION WORKFLOW WITH REASON
        // ─────────────────────────────────────────────────────────────
        AdminTalentMediaItemDto rejectedVideo = adminOperationsService.reviewTalentMedia(
                adminAuth, "video", videoResp.getId(),
                ReviewMediaRequest.builder()
                        .status("REJECTED")
                        .rejectionReason("Video audio resolution is too low")
                        .build()
        );
        Assertions.assertEquals("REJECTED", rejectedVideo.getStatus());
        Assertions.assertEquals("Video audio resolution is too low", rejectedVideo.getRejectionReason());

        // Talent sees rejection reason in their dashboard
        List<VideoResponse> myVideosAfterReject = videoService.getMyVideos(unverifiedEmail);
        VideoResponse myRejected = myVideosAfterReject.stream()
                .filter(v -> v.getId().equals(videoResp.getId()))
                .findFirst().orElseThrow();
        Assertions.assertEquals("REJECTED", myRejected.getStatus());
        Assertions.assertEquals("Video audio resolution is too low", myRejected.getRejectionReason());

        // ─────────────────────────────────────────────────────────────
        // 7. OPTION 2: VERIFIED STAR TALENT (isApproved = true) BYPASS
        // ─────────────────────────────────────────────────────────────
        String verifiedStarEmail = "star_talent_" + (ts + 1) + "@stars.com";
        User starUser = User.builder()
                .email(verifiedStarEmail)
                .fullName("Pooja Hegde")
                .stageName("Pooja H.")
                .password("$2a$10$xyzDummyHashForTestingPostgreSQL123")
                .accountType(AccountType.TALENT)
                .mobileNumber("96" + String.format("%08d", ts + 1))
                .location("Bangalore, India")
                .isApproved(true) // KYC VERIFIED STAR!
                .verificationStatus("APPROVED")
                .termsAccepted(true)
                .build();
        starUser = userRepository.save(starUser);

        // Verified star uploads a video reel -> MUST BE AUTO-APPROVED!
        VideoResponse starVideoResp = videoService.createVideo(verifiedStarEmail, VideoRequest.builder()
                .title("Cinema Climax Scene Acting Clip")
                .category("Acting")
                .videoUrl("/uploads/videos/pooja_climax_" + ts + ".mp4")
                .duration("01:45")
                .year(2026)
                .build());

        Assertions.assertEquals("APPROVED", starVideoResp.getStatus(),
                "Verified star talent uploads MUST BE auto-approved (Option 2 Bypass)");

        // Verified star video goes live IMMEDIATELY on public profile!
        PublicProfileResponse starPublicProfile = profileService.getPublicProfile(starUser.getId());
        Assertions.assertTrue(
                starPublicProfile.getVideos().stream().anyMatch(v -> v.getId().equals(starVideoResp.getId())),
                "Verified star media MUST be live immediately on public profile"
        );

        // ─────────────────────────────────────────────────────────────
        // 8. ADMIN SAFETY TAKEDOWN FOR VERIFIED STAR MEDIA
        // ─────────────────────────────────────────────────────────────
        AdminTalentMediaItemDto takenDown = adminOperationsService.reviewTalentMedia(
                adminAuth, "video", starVideoResp.getId(),
                ReviewMediaRequest.builder()
                        .status("REJECTED")
                        .rejectionReason("Copyright takedown request received")
                        .build()
        );
        Assertions.assertEquals("REJECTED", takenDown.getStatus());

        // Immediately hidden from public profile!
        PublicProfileResponse starProfileAfterTakedown = profileService.getPublicProfile(starUser.getId());
        Assertions.assertTrue(
                starProfileAfterTakedown.getVideos().stream().noneMatch(v -> v.getId().equals(starVideoResp.getId())),
                "Taken-down video MUST NOT appear in public profile"
        );

        System.out.println("✅ TalentMediaModerationTest passed: all 8 Option 2 workflows verified against PostgreSQL!");
    }
}
