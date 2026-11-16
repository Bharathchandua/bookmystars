package com.example.bookmystars.repository;

import com.example.bookmystars.model.MasterCraft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterCraftRepository extends JpaRepository<MasterCraft, Long> {

    List<MasterCraft> findByIsActiveTrueOrderByNameAsc();

    List<MasterCraft> findAllByOrderByNameAsc();

    Optional<MasterCraft> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    @Query(value = "SELECT COUNT(*) FROM master_skills WHERE LOWER(category) = LOWER(:craftName)", nativeQuery = true)
    long countSkillsInCraft(@Param("craftName") String craftName);
}
