package com.example.bookmystars.repository;

import com.example.bookmystars.model.AccessRequestStatus;
import com.example.bookmystars.model.ProfileAccessRequest;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileAccessRequestRepository extends JpaRepository<ProfileAccessRequest, Long> {

    List<ProfileAccessRequest> findByTalentOrderByCreatedAtDesc(User talent);

    List<ProfileAccessRequest> findByTalentAndStatus(User talent, AccessRequestStatus status);

    Optional<ProfileAccessRequest> findByTalentAndRequester(User talent, User requester);

    Optional<ProfileAccessRequest> findByTalentAndRequesterEmailIgnoreCase(User talent, String requesterEmail);

    boolean existsByTalentAndRequesterAndStatus(User talent, User requester, AccessRequestStatus status);

    boolean existsByTalentAndRequesterEmailIgnoreCaseAndStatus(User talent, String requesterEmail, AccessRequestStatus status);
}
