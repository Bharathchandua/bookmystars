package com.example.bookmystars.service;

import com.example.bookmystars.dto.MeasurementRequest;
import com.example.bookmystars.dto.MeasurementResponse;
import com.example.bookmystars.model.Measurement;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.MeasurementRepository;
import com.example.bookmystars.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MeasurementService {

    private final MeasurementRepository measurementRepository;
    private final UserRepository userRepository;

    // =========================
    // CREATE / SAVE MEASUREMENTS
    // =========================

    public MeasurementResponse createMeasurement(
            String email,
            MeasurementRequest request) {

        return updateMeasurements(email, request);
    }


    // =========================
    // GET MY MEASUREMENTS
    // =========================

    public MeasurementResponse getMyMeasurements(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return measurementRepository.findByUser(user)
                .map(this::mapToResponse)
                .orElse(null);
    }


    // =========================
    // UPDATE MY MEASUREMENTS
    // =========================

    public MeasurementResponse updateMeasurements(
            String email,
            MeasurementRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Measurement measurement =
                measurementRepository.findByUser(user)
                        .orElseGet(() ->
                                Measurement.builder()
                                        .user(user)
                                        .build());

        measurement.setHeight(request.getHeight());
        measurement.setBust(request.getBust());
        measurement.setWaist(request.getWaist());
        measurement.setHips(request.getHips());
        measurement.setDressSize(request.getDressSize());
        measurement.setShoeSize(request.getShoeSize());
        measurement.setHairColor(request.getHairColor());
        measurement.setEyeColor(request.getEyeColor());
        measurement.setSkinTone(request.getSkinTone());
        measurement.setBodyType(request.getBodyType());
        measurement.setUpdatedAt(LocalDateTime.now());

        Measurement updatedMeasurement =
                measurementRepository.save(measurement);

        return mapToResponse(updatedMeasurement);
    }


    // =========================
    // ENTITY -> RESPONSE DTO
    // =========================

    private MeasurementResponse mapToResponse(
            Measurement measurement) {

        return MeasurementResponse.builder()
                .id(measurement.getId())
                .height(measurement.getHeight())
                .bust(measurement.getBust())
                .waist(measurement.getWaist())
                .hips(measurement.getHips())
                .dressSize(measurement.getDressSize())
                .shoeSize(measurement.getShoeSize())
                .hairColor(measurement.getHairColor())
                .eyeColor(measurement.getEyeColor())
                .skinTone(measurement.getSkinTone())
                .bodyType(measurement.getBodyType())
                .updatedAt(measurement.getUpdatedAt())
                .build();
    }
}