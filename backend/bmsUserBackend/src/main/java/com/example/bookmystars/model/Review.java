package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    private String projectName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Professional who gives the review
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    // Talent whose profile receives the review
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_user_id", nullable = false)
    private User profileUser;
}