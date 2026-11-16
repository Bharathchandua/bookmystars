package com.example.bookmystars.service;

import com.example.bookmystars.dto.ReviewRequest;
import com.example.bookmystars.dto.ReviewResponse;
import com.example.bookmystars.dto.ReviewSummaryResponse;
import com.example.bookmystars.model.AccountType;
import com.example.bookmystars.model.Review;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.ReviewRepository;
import com.example.bookmystars.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;


    // =========================================================
    // CREATE REVIEW
    // =========================================================

    public ReviewResponse createReview(
            Authentication authentication,
            ReviewRequest request) {

        User reviewer = getAuthenticatedUser(authentication);

        // Only PROFESSIONAL can give reviews
        if (reviewer.getAccountType() != AccountType.PROFESSIONAL) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only professionals can give reviews"
            );
        }

        // Validate rating
        if (request.getRating() == null ||
                request.getRating() < 1 ||
                request.getRating() > 5) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5"
            );
        }

        // Find profile being reviewed
        User profileUser = userRepository.findById(
                request.getProfileUserId()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profile user not found"
                )
        );

        // Currently reviews are for TALENT profiles
        if (profileUser.getAccountType() != AccountType.TALENT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reviews can only be given to talent profiles"
            );
        }

        // Prevent reviewing yourself
        if (reviewer.getId().equals(profileUser.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You cannot review your own profile"
            );
        }

        // Prevent duplicate review
        if (reviewRepository.existsByReviewerIdAndProfileUserId(
                reviewer.getId(),
                profileUser.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already reviewed this profile"
            );
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .projectName(request.getProjectName())
                .createdAt(LocalDateTime.now())
                .reviewer(reviewer)
                .profileUser(profileUser)
                .build();

        Review savedReview = reviewRepository.save(review);

        return convertToResponse(savedReview);
    }


    // =========================================================
    // GET ALL REVIEWS FOR A PROFILE
    // =========================================================

    public ReviewSummaryResponse getProfileReviews(Long profileUserId) {

        // Make sure profile exists
        userRepository.findById(profileUserId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Profile user not found"
                        )
                );

        List<Review> reviews =
                reviewRepository
                        .findByProfileUserIdOrderByCreatedAtDesc(
                                profileUserId
                        );

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        long fiveStarCount = reviews.stream()
                .filter(r -> r.getRating() == 5)
                .count();

        long fourStarCount = reviews.stream()
                .filter(r -> r.getRating() == 4)
                .count();

        long threeStarCount = reviews.stream()
                .filter(r -> r.getRating() == 3)
                .count();

        long twoStarCount = reviews.stream()
                .filter(r -> r.getRating() == 2)
                .count();

        long oneStarCount = reviews.stream()
                .filter(r -> r.getRating() == 1)
                .count();

        List<ReviewResponse> reviewResponses = reviews.stream()
                .map(this::convertToResponse)
                .toList();

        return ReviewSummaryResponse.builder()
                .averageRating(
                        Math.round(averageRating * 10.0) / 10.0
                )
                .totalReviews((long) reviews.size())
                .fiveStarCount(fiveStarCount)
                .fourStarCount(fourStarCount)
                .threeStarCount(threeStarCount)
                .twoStarCount(twoStarCount)
                .oneStarCount(oneStarCount)
                .reviews(reviewResponses)
                .build();
    }


    // =========================================================
    // UPDATE MY REVIEW
    // =========================================================

    public ReviewResponse updateReview(
            Authentication authentication,
            Long reviewId,
            ReviewRequest request) {

        User reviewer = getAuthenticatedUser(authentication);

        Review review = reviewRepository
                .findByIdAndReviewerId(
                        reviewId,
                        reviewer.getId()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Review not found or you are not the owner"
                        )
                );

        if (request.getRating() == null ||
                request.getRating() < 1 ||
                request.getRating() > 5) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rating must be between 1 and 5"
            );
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setProjectName(request.getProjectName());

        Review updatedReview = reviewRepository.save(review);

        return convertToResponse(updatedReview);
    }


    // =========================================================
    // DELETE MY REVIEW
    // =========================================================

    public void deleteReview(
            Authentication authentication,
            Long reviewId) {

        User reviewer = getAuthenticatedUser(authentication);

        Review review = reviewRepository
                .findByIdAndReviewerId(
                        reviewId,
                        reviewer.getId()
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Review not found or you are not the owner"
                        )
                );

        reviewRepository.delete(review);
    }


    // =========================================================
    // GET AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

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

    private ReviewResponse convertToResponse(Review review) {

        User reviewer = review.getReviewer();

        String reviewerRole =
                reviewer.getAccountType() == AccountType.PROFESSIONAL
                        ? "Professional"
                        : "Talent";

        return ReviewResponse.builder()
                .id(review.getId())
                .reviewerName(reviewer.getFullName())
                .reviewerRole(reviewerRole)
                .rating(review.getRating())
                .comment(review.getComment())
                .projectName(review.getProjectName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}