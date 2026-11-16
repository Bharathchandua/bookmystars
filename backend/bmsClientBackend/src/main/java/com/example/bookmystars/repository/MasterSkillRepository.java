package com.example.bookmystars.repository;

import com.example.bookmystars.model.MasterSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterSkillRepository extends JpaRepository<MasterSkill, Long> {

    List<MasterSkill> findByIsActiveTrueOrderByNameAsc();

    List<MasterSkill> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);

    Optional<MasterSkill> findByNameIgnoreCase(String name);

    @Query(value = "SELECT COUNT(*) FROM profile_skills WHERE LOWER(skill) = LOWER(:skillName)", nativeQuery = true)
    long countProfileUsage(@Param("skillName") String skillName);
}
