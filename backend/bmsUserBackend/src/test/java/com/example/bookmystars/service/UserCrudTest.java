package com.example.bookmystars.service;

import com.example.bookmystars.dto.WorkExperienceRequest;
import com.example.bookmystars.dto.WorkExperienceResponse;
import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.repository.WorkExperienceRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@ActiveProfiles("local")
public class UserCrudTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkExperienceService workExperienceService;

    @Autowired
    private WorkExperienceRepository workExperienceRepository;

    @Test
    @Transactional
    public void testUserAndWorkExperienceFullCrud() {
        long ts = System.currentTimeMillis() % 100000000;
        String testEmail = "artist_" + ts + "@cinema.com";
        String mobile = "95" + String.format("%08d", ts);

        // 1. CREATE USER: Register artist as TALENT
        User user = User.builder()
                .email(testEmail)
                .password("SecuredPassword123!")
                .fullName("Ayush Talent")
                .location("Mumbai, Maharashtra")
                .mobileNumber(mobile)
                .accountType(AccountType.TALENT)
                .termsAccepted(true)
                .build();
        user = userRepository.save(user);
        Assertions.assertNotNull(user.getId());
        System.out.println("USER CREATE SUCCESS: ID " + user.getId() + ", Email: " + user.getEmail());

        // 2. CREATE WORK EXPERIENCE (Auto-provisioning verified)
        WorkExperienceRequest expReq = new WorkExperienceRequest();
        expReq.setCompany("Netflix Global");
        expReq.setTitle("Lead Role in Action Series");
        expReq.setCategory("Web Series");
        expReq.setDescription("Played the protagonist in an international thriller series.");
        expReq.setStartDate("2024");
        expReq.setEndDate("2025");

        WorkExperienceResponse expRes = workExperienceService.addWorkExperience(user.getEmail(), expReq);
        Assertions.assertNotNull(expRes);
        Assertions.assertNotNull(expRes.getId());
        Assertions.assertEquals("Netflix Global", expRes.getCompany());
        Assertions.assertEquals("Lead Role in Action Series", expRes.getTitle());

        // Verify professional_profile_id is guaranteed non-null in database
        var dbExp = workExperienceRepository.findById(expRes.getId()).orElse(null);
        Assertions.assertNotNull(dbExp);
        Assertions.assertNotNull(dbExp.getProfessionalsProfileId(), "professionalsProfileId MUST NOT be null!");
        System.out.println("WORK EXPERIENCE CREATE SUCCESS: ID " + dbExp.getId() + ", ProProfileId: " + dbExp.getProfessionalsProfileId());

        // 3. READ: Query all work experiences for this user
        List<WorkExperienceResponse> list = workExperienceService.getMyWorkExperiences(user.getEmail());
        Assertions.assertNotNull(list);
        Assertions.assertTrue(list.size() >= 1);
        System.out.println("WORK EXPERIENCE READ SUCCESS: Total experiences: " + list.size());

        // 4. UPDATE: Update user profile details
        user.setStageName("Ayush Star");
        user.setLocation("Bengaluru, Karnataka");
        user.setCustomProfession("Lead Actor & Martial Artist");
        User updatedUser = userRepository.save(user);
        Assertions.assertEquals("Ayush Star", updatedUser.getStageName());
        Assertions.assertEquals("Bengaluru, Karnataka", updatedUser.getLocation());
        System.out.println("USER UPDATE SUCCESS: Stage Name is now " + updatedUser.getStageName());

        // 5. DELETE: Delete work experience
        workExperienceService.deleteWorkExperience(user.getEmail(), expRes.getId());
        var deletedExp = workExperienceRepository.findById(expRes.getId()).orElse(null);
        Assertions.assertNull(deletedExp);
        System.out.println("WORK EXPERIENCE DELETE SUCCESS: ID " + expRes.getId() + " successfully deleted");
    }
}
