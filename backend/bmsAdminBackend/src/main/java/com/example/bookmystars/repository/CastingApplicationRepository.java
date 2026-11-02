package com.example.bookmystars.repository;

import com.example.bookmystars.model.ApplicationStatus;
import com.example.bookmystars.model.CastingApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CastingApplicationRepository extends JpaRepository<CastingApplication, Long> {

    List<CastingApplication> findByCastingCallIdOrderByAppliedAtDesc(Long castingCallId);

    List<CastingApplication> findByApplicantIdOrderByAppliedAtDesc(Long applicantId);

    boolean existsByCastingCallIdAndApplicantId(Long castingCallId, Long applicantId);

    Optional<CastingApplication> findByCastingCallIdAndApplicantId(Long castingCallId, Long applicantId);

    long countByCastingCallId(Long castingCallId);

    long countByCastingCallPostedById(Long professionalId);

    List<CastingApplication> findByCastingCallPostedByIdOrderByAppliedAtDesc(Long professionalId);

    long countByCastingCallPostedByIdAndStatus(Long professionalId, ApplicationStatus status);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByCastingCallId(Long castingCallId);
}
