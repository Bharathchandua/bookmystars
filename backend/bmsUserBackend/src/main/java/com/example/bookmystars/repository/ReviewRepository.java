package com.example.bookmystars.repository;

import com.example.bookmystars.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProfileUserIdOrderByCreatedAtDesc(Long profileUserId);

    Optional<Review> findByIdAndReviewerId(Long id, Long reviewerId);

    boolean existsByReviewerIdAndProfileUserId(
            Long reviewerId,
            Long profileUserId
    );
}