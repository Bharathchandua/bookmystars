package com.example.bookmystars.repository;

import com.example.bookmystars.model.Measurement;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeasurementRepository extends JpaRepository<Measurement, Long> {

    Optional<Measurement> findByUser(User user);
}