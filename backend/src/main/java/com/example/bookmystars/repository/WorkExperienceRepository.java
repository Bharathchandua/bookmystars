package com.example.bookmystars.repository;

import com.example.bookmystars.model.WorkExperience;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkExperienceRepository
        extends JpaRepository<WorkExperience, Long> {

    List<WorkExperience> findByUser(User user);
}