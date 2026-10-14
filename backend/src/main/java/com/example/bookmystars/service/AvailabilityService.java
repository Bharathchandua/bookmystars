package com.example.bookmystars.service;

import com.example.bookmystars.dto.AvailabilityRequest;
import com.example.bookmystars.dto.AvailabilityResponse;
import com.example.bookmystars.model.Availability;
import com.example.bookmystars.model.AvailabilityStatus;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.AvailabilityRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;


    // =========================================================
    // CREATE AVAILABILITY
    // =========================================================

    public AvailabilityResponse createAvailability(
            Authentication authentication,
            AvailabilityRequest request) {

        User user = getAuthenticatedUser(authentication);
        validateTime(request);

        // Upsert: If an availability record already exists for this date, update it; otherwise create a new one
        java.util.Optional<Availability> existingOpt =
                availabilityRepository.findByUserIdAndAvailabilityDate(
                        user.getId(),
                        request.getAvailabilityDate()
                );

        Availability availability;
        if (existingOpt.isPresent()) {
            availability = existingOpt.get();
            availability.setStatus(request.getStatus());
            availability.setDescription(request.getDescription());
            availability.setStartTime(request.getStartTime());
            availability.setEndTime(request.getEndTime());
        } else {
            availability = Availability.builder()
                    .user(user)
                    .availabilityDate(request.getAvailabilityDate())
                    .status(request.getStatus())
                    .description(request.getDescription())
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .build();
        }

        Availability saved = availabilityRepository.save(availability);
        return convertToResponse(saved);
    }

    public List<AvailabilityResponse> getMyAvailability(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return getUserAvailability(user.getId());
    }

    public void deleteAvailabilityByDate(
            Authentication authentication,
            LocalDate date) {

        User user = getAuthenticatedUser(authentication);
        availabilityRepository.findByUserIdAndAvailabilityDate(user.getId(), date)
                .ifPresent(availabilityRepository::delete);
    }


    // =========================================================
    // GET COMPLETE CALENDAR
    // =========================================================

    public List<AvailabilityResponse> getUserAvailability(
            Long userId) {

        // Make sure user exists
        userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        return availabilityRepository
                .findByUserIdOrderByAvailabilityDateAsc(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET AVAILABILITY FOR ONE DATE
    // =========================================================

    public AvailabilityResponse getAvailabilityByDate(
            Long userId,
            LocalDate date) {

        return availabilityRepository
                .findByUserIdAndAvailabilityDate(
                        userId,
                        date
                )
                .map(this::convertToResponse)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "No availability record found for this date"
                        )
                );
    }


    // =========================================================
    // GET AVAILABLE DATES
    // =========================================================

    public List<AvailabilityResponse> getAvailableDates(
            Long userId) {

        return availabilityRepository
                .findByUserIdAndStatusOrderByAvailabilityDateAsc(
                        userId,
                        AvailabilityStatus.AVAILABLE
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET NEXT AVAILABLE DATE
    // =========================================================

    public AvailabilityResponse getNextAvailableDate(
            Long userId) {

        Availability availability =
                availabilityRepository
                        .findFirstByUserIdAndAvailabilityDateGreaterThanEqualAndStatusOrderByAvailabilityDateAsc(
                                userId,
                                LocalDate.now(),
                                AvailabilityStatus.AVAILABLE
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "No upcoming available date found"
                                )
                        );

        return convertToResponse(availability);
    }


    // =========================================================
    // UPDATE AVAILABILITY
    // =========================================================

    public AvailabilityResponse updateAvailability(
            Authentication authentication,
            Long availabilityId,
            AvailabilityRequest request) {

        User user = getAuthenticatedUser(authentication);
            System.out.println("######## UPDATE AVAILABILITY METHOD REACHED ########");
            System.out.println("Availability ID received: " + availabilityId);
        Availability availability =
                availabilityRepository.findById(availabilityId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Availability record not found"
                                )
                        );
            System.out.println("######## AVAILABILITY FOUND ########");
            System.out.println("Availability object: " + availability);            
        // Only owner can update
        if (!availability.getUser().getId().equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only update your own availability"
            );
        }

        // If date is changed, make sure another record doesn't
        // already exist for that date
        if (!availability.getAvailabilityDate()
                .equals(request.getAvailabilityDate())
                &&
                availabilityRepository
                        .existsByUserIdAndAvailabilityDate(
                                user.getId(),
                                request.getAvailabilityDate()
                        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Availability already exists for this date"
            );
        }

        validateTime(request);

        availability.setAvailabilityDate(
                request.getAvailabilityDate()
        );

        availability.setStatus(
                request.getStatus()
        );

        availability.setDescription(
                request.getDescription()
        );

        availability.setStartTime(
                request.getStartTime()
        );

        availability.setEndTime(
                request.getEndTime()
        );

        Availability updated =
                availabilityRepository.save(availability);

        return convertToResponse(updated);
    }


    // =========================================================
    // DELETE AVAILABILITY
    // =========================================================

    public void deleteAvailability(
            Authentication authentication,
            Long availabilityId) {

        User user = getAuthenticatedUser(authentication);

        Availability availability =
                availabilityRepository.findById(availabilityId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Availability record not found"
                                )
                        );

        // Only owner can delete
        if (!availability.getUser().getId().equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only delete your own availability"
            );
        }

        availabilityRepository.delete(availability);
    }


    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authenticated user not found"
                        )
                );
    }


    // =========================================================
    // VALIDATE TIME
    // =========================================================

    private void validateTime(
            AvailabilityRequest request) {

        if (request.getStartTime() != null &&
                request.getEndTime() != null &&
                !request.getStartTime()
                        .isBefore(request.getEndTime())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start time must be before end time"
            );
        }
    }


    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private AvailabilityResponse convertToResponse(
            Availability availability) {

        return AvailabilityResponse.builder()
                .id(availability.getId())
                .userId(availability.getUser().getId())
                .availabilityDate(
                        availability.getAvailabilityDate()
                )
                .status(
                        availability.getStatus()
                )
                .description(
                        availability.getDescription()
                )
                .startTime(
                        availability.getStartTime()
                )
                .endTime(
                        availability.getEndTime()
                )
                .build();
    }
}