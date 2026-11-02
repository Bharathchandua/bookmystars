package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.ReviewRequest;
import com.example.bookmystars.dto.ReviewResponse;
import com.example.bookmystars.dto.ReviewSummaryResponse;
import com.example.bookmystars.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/reviews")
@RequiredArgsConstructor
@Tag(name = "Client Reviews", description = "Professional client reviews, 1-5 star ratings, and testimonials for talent")
public class ReviewController {

    private final ReviewService reviewService;


    // =========================================================
    // CREATE REVIEW
    // =========================================================

    @PostMapping
    @Operation(summary = "Submit a star rating and written review for a talent (Professionals only)")
    public ResponseEntity<ReviewResponse> createReview(
            Authentication authentication,
            @jakarta.validation.Valid @RequestBody ReviewRequest request) {

        ReviewResponse response =
                reviewService.createReview(
                        authentication,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET PROFILE REVIEWS
    // =========================================================

    @GetMapping("/{profileUserId}")
    @Operation(summary = "Get aggregated reviews and star ratings summary for a talent by User ID")
    public ResponseEntity<ReviewSummaryResponse> getProfileReviews(
            @PathVariable Long profileUserId) {

        ReviewSummaryResponse response =
                reviewService.getProfileReviews(
                        profileUserId
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // UPDATE MY REVIEW
    // =========================================================

    @PutMapping("/{reviewId}")
    @Operation(summary = "Update an existing review by review ID")
    public ResponseEntity<ReviewResponse> updateReview(
            Authentication authentication,
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest request) {

        ReviewResponse response =
                reviewService.updateReview(
                        authentication,
                        reviewId,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DELETE MY REVIEW
    // =========================================================

    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete an existing review by review ID")
    public ResponseEntity<String> deleteReview(
            Authentication authentication,
            @PathVariable Long reviewId) {

        reviewService.deleteReview(
                authentication,
                reviewId
        );

        return ResponseEntity.ok(
                "Review deleted successfully"
        );
    }
}
