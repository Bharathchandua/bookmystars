package com.example.bookmystars.repository;

import com.example.bookmystars.model.CastingCall;
import com.example.bookmystars.model.CastingStatus;
import com.example.bookmystars.model.ProfileType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CastingCallRepository extends JpaRepository<CastingCall, Long> {

    List<CastingCall> findByPostedByIdOrderByCreatedAtDesc(Long userId);

    List<CastingCall> findByStatusOrderByCreatedAtDesc(CastingStatus status);

    List<CastingCall> findByRoleTypeAndStatusOrderByCreatedAtDesc(ProfileType roleType, CastingStatus status);

    long countByPostedById(Long userId);

    long countByPostedByIdAndStatus(Long userId, CastingStatus status);
}
