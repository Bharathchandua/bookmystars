package com.example.bookmystars.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.bookmystars.dto.RatePackageRequest;
import com.example.bookmystars.dto.RatePackageResponse;
import com.example.bookmystars.model.RatePackage;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.RatePackageRepository;
import com.example.bookmystars.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RatePackageService {

    private final RatePackageRepository ratePackageRepository;
    private final UserRepository userRepository;


    // =========================================================
    // CREATE PACKAGE
    // =========================================================

    public RatePackageResponse createPackage(
            Authentication authentication,
            RatePackageRequest request) {

        User user = getAuthenticatedUser(authentication);

        // Prevent duplicate package names
        if (ratePackageRepository.existsByUserIdAndPackageName(
                user.getId(),
                request.getPackageName())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A package with this name already exists"
            );
        }

        RatePackage ratePackage = RatePackage.builder()
                .user(user)
                .packageName(request.getPackageName())
                .price(request.getPrice())
                .duration(request.getDuration())
                .features(
                        request.getFeatures() != null
                                ? new ArrayList<>(request.getFeatures())
                                : new ArrayList<>()
                )
                .mostPopular(
                        request.getMostPopular() != null
                                ? request.getMostPopular()
                                : false
                )
                .customPrice(
                        request.getCustomPrice() != null
                                ? request.getCustomPrice()
                                : false
                )
                .build();

        RatePackage saved =
                ratePackageRepository.save(ratePackage);

        return convertToResponse(saved);
    }


    // =========================================================
    // GET PROFILE PACKAGES
    // =========================================================

    public List<RatePackageResponse> getProfilePackages(
            Long userId) {

        // Make sure user exists
        userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        return ratePackageRepository
                .findByUserIdOrderByIdAsc(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET MY PACKAGES (AUTHENTICATED TALENT)
    // =========================================================

    public List<RatePackageResponse> getMyPackages(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return ratePackageRepository
                .findByUserIdOrderByIdAsc(user.getId())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET ONE PACKAGE
    // =========================================================

    public RatePackageResponse getPackageById(
            Long packageId) {

        RatePackage ratePackage =
                ratePackageRepository.findById(packageId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Rate package not found"
                                )
                        );

        return convertToResponse(ratePackage);
    }


    // =========================================================
    // UPDATE PACKAGE
    // =========================================================

    public RatePackageResponse updatePackage(
            Authentication authentication,
            Long packageId,
            RatePackageRequest request) {

        User user = getAuthenticatedUser(authentication);

        RatePackage ratePackage =
                ratePackageRepository.findById(packageId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Rate package not found"
                                )
                        );

        // Only owner can update
        if (!ratePackage.getUser().getId().equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only update your own rate packages"
            );
        }

        // Check duplicate name if package name is changed
        if (!ratePackage.getPackageName()
                .equals(request.getPackageName())
                &&
                ratePackageRepository
                        .existsByUserIdAndPackageName(
                                user.getId(),
                                request.getPackageName()
                        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A package with this name already exists"
            );
        }

        ratePackage.setPackageName(
                request.getPackageName()
        );

        ratePackage.setPrice(
                request.getPrice()
        );

        ratePackage.setDuration(
                request.getDuration()
        );

        ratePackage.setFeatures(
                request.getFeatures() != null
                        ? new ArrayList<>(request.getFeatures())
                        : new ArrayList<>()
        );

        ratePackage.setMostPopular(
                request.getMostPopular() != null
                        ? request.getMostPopular()
                        : false
        );

        ratePackage.setCustomPrice(
                request.getCustomPrice() != null
                        ? request.getCustomPrice()
                        : false
        );

        RatePackage updated =
                ratePackageRepository.save(ratePackage);

        return convertToResponse(updated);
    }


    // =========================================================
    // DELETE PACKAGE
    // =========================================================

    public void deletePackage(
            Authentication authentication,
            Long packageId) {

        User user = getAuthenticatedUser(authentication);

        RatePackage ratePackage =
                ratePackageRepository.findById(packageId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Rate package not found"
                                )
                        );

        // Only owner can delete
        if (!ratePackage.getUser().getId().equals(user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only delete your own rate packages"
            );
        }

        ratePackageRepository.delete(ratePackage);
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
    // ENTITY → RESPONSE DTO
    // =========================================================

    private RatePackageResponse convertToResponse(
            RatePackage ratePackage) {

        return RatePackageResponse.builder()
                .id(ratePackage.getId())
                .userId(ratePackage.getUser().getId())
                .packageName(ratePackage.getPackageName())
                .price(ratePackage.getPrice())
                .duration(ratePackage.getDuration())
                .features(
                        ratePackage.getFeatures()
                )
                .mostPopular(
                        ratePackage.getMostPopular()
                )
                .customPrice(
                        ratePackage.getCustomPrice()
                )
                .build();
    }
}