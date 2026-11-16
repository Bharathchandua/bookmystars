package com.example.bookmystars.repository;

import com.example.bookmystars.model.ClientPartnerShowcase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientPartnerShowcaseRepository extends JpaRepository<ClientPartnerShowcase, Long> {

    List<ClientPartnerShowcase> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ClientPartnerShowcase> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    List<ClientPartnerShowcase> findByEntityTypeAndStatusOrderByCreatedAtDesc(String entityType, String status);

    List<ClientPartnerShowcase> findByEntityTypeOrderByCreatedAtDesc(String entityType);

    long countByEntityTypeAndStatus(String entityType, String status);

    long countByUserIdAndStatus(Long userId, String status);
}
