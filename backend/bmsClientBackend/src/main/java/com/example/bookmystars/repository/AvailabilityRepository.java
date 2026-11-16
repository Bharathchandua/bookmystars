package com.example.bookmystars.repository;

import com.example.bookmystars.model.Availability;
import com.example.bookmystars.model.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AvailabilityRepository
        extends JpaRepository<Availability, Long> {

    List<Availability> findByUserIdOrderByAvailabilityDateAsc(
            Long userId
    );

    Optional<Availability> findByUserIdAndAvailabilityDate(
            Long userId,
            LocalDate availabilityDate
    );

    boolean existsByUserIdAndAvailabilityDate(
            Long userId,
            LocalDate availabilityDate
    );

    List<Availability> findByUserIdAndStatusOrderByAvailabilityDateAsc(
            Long userId,
            AvailabilityStatus status
    );

    Optional<Availability>
    findFirstByUserIdAndAvailabilityDateGreaterThanEqualAndStatusOrderByAvailabilityDateAsc(
            Long userId,
            LocalDate date,
            AvailabilityStatus status
    );
}