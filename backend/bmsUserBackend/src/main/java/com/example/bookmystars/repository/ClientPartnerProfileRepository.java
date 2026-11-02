package com.example.bookmystars.repository;

import com.example.bookmystars.model.ClientPartnerProfile;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientPartnerProfileRepository extends JpaRepository<ClientPartnerProfile, Long> {
    Optional<ClientPartnerProfile> findByUser(User user);
    Optional<ClientPartnerProfile> findByUserId(Long userId);
    Optional<ClientPartnerProfile> findByUserAndProfileType(User user, String profileType);
}
