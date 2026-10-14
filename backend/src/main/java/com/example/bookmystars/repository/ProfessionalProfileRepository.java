package com.example.bookmystars.repository;

import com.example.bookmystars.model.ProfessionalProfile;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfessionalProfileRepository extends JpaRepository<ProfessionalProfile, Long> {

    Optional<ProfessionalProfile> findByUserId(Long userId);

    Optional<ProfessionalProfile> findByUser(User user);
}
