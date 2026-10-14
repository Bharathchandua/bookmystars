package com.example.bookmystars.repository;

import com.example.bookmystars.model.RatePackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatePackageRepository
        extends JpaRepository<RatePackage, Long> {

    // Get all packages belonging to a profile
    List<RatePackage> findByUserIdOrderByIdAsc(Long userId);

    // Find one package belonging to a particular profile
    Optional<RatePackage> findByIdAndUserId(
            Long id,
            Long userId
    );

    // Prevent duplicate package names for the same profile
    boolean existsByUserIdAndPackageName(
            Long userId,
            String packageName
    );
}