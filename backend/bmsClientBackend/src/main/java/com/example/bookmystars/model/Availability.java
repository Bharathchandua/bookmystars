package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
        name = "availabilities",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"user_id", "availability_date"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Profile owner
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Date of availability
    @Column(name = "availability_date", nullable = false)
    private LocalDate availabilityDate;

    // AVAILABLE / BOOKED / TENTATIVE
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AvailabilityStatus status;

    // Example:
    // "Open for shoots, campaigns, and runways"
    private String description;

    // Example: 09:00
    private LocalTime startTime;

    // Example: 18:00
    private LocalTime endTime;
}