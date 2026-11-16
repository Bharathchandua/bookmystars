package com.example.bookmystars.repository;

import com.example.bookmystars.model.MasterLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterLanguageRepository extends JpaRepository<MasterLanguage, Long> {

    Optional<MasterLanguage> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<MasterLanguage> findByIsActiveTrueOrderByNameAsc();

    List<MasterLanguage> findAllByOrderByNameAsc();

    @Query(value = "SELECT COUNT(*) FROM profiles p WHERE LOWER(p.languages) LIKE LOWER(CONCAT('%', :lang, '%')) OR LOWER(p.acting_languages) LIKE LOWER(CONCAT('%', :lang, '%'))", nativeQuery = true)
    long countTalentsWithLanguage(@Param("lang") String lang);
}
