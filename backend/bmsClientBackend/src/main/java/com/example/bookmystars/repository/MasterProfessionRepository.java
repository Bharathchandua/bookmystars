package com.example.bookmystars.repository;

import com.example.bookmystars.model.MasterProfession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterProfessionRepository extends JpaRepository<MasterProfession, Long> {

    List<MasterProfession> findByIsActiveTrueOrderByNameAsc();

    List<MasterProfession> findAllByOrderByNameAsc();

    Optional<MasterProfession> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    @Query(value = "SELECT COUNT(DISTINCT u.id) FROM users u " +
                   "LEFT JOIN user_profile_types upt ON upt.user_id = u.id " +
                   "WHERE LOWER(COALESCE(u.primary_profession, '')) = LOWER(:profName) " +
                   "   OR LOWER(COALESCE(u.custom_profession, '')) = LOWER(:profName) " +
                   "   OR LOWER(COALESCE(upt.profile_type, '')) = LOWER(:profName)", nativeQuery = true)
    long countUsersWithProfession(@Param("profName") String profName);
}
