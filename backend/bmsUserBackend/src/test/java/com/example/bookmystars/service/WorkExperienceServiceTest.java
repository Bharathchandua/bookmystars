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

@SpringBootTest
@ActiveProfiles("local")
public class WorkExperienceServiceTest {

    @Autowired
    private WorkExperienceService workExperienceService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkExperienceRepository workExperienceRepository;

    @Test
    @Transactional
    public void testAddWorkExperienceForTalent() {
        long ts = System.currentTimeMillis() % 100000000;
        String testEmail = "talent_" + ts + "@example.com";
        String mobile = "98" + String.format("%08d", ts);
        
        User user = User.builder()
                .email(testEmail)
                .password("secretHash")
                .fullName("Ayush Test")
                .location("Mumbai, India")
                .mobileNumber(mobile)
                .accountType(AccountType.TALENT)
                .build();
        user = userRepository.save(user);

        WorkExperienceRequest req = new WorkExperienceRequest();
        req.setCompany("Netflix");
        req.setTitle("Lead Actor");
        req.setCategory("Feature Film");
        req.setDescription("Lead character in sci-fi movie");
        req.setStartDate("2025");

        WorkExperienceResponse res = workExperienceService.addWorkExperience(user.getEmail(), req);

        Assertions.assertNotNull(res);
        Assertions.assertNotNull(res.getId());
        Assertions.assertEquals("Netflix", res.getCompany());
        Assertions.assertEquals("Lead Actor", res.getTitle());

        var savedEntity = workExperienceRepository.findById(res.getId()).orElse(null);
        Assertions.assertNotNull(savedEntity);
        Assertions.assertNotNull(savedEntity.getProfessionalsProfileId(), "professionalsProfileId MUST NOT be null!");
        System.out.println("VERIFIED! Work Experience saved with ID: " + savedEntity.getId() + ", professionalsProfileId: " + savedEntity.getProfessionalsProfileId());
    }
}
