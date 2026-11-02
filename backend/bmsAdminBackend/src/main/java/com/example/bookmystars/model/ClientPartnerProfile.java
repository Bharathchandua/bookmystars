package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "client_partner_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientPartnerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 20)
    private String profileType; // "CLIENT" or "PARTNER"

    private String companyName;

    private String industry;

    private String tagline;

    private String contactPerson;

    private String designation;

    private String email;

    private String phone;

    private String city;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String website;

    private String instagram;

    private String linkedin;

    private String youtube;

    private String establishedYear;

    private String annualShoots;

    private String budgetRange;

    private String activeStudents;

    @Column(columnDefinition = "TEXT")
    private String studioFacilities;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String preferredProfiles;

    @Column(columnDefinition = "TEXT")
    private String trainingBatches;

    private String logoUrl;

    @Builder.Default
    private Boolean verified = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
