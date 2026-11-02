package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One profile belongs to one user
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Profile photo URL/path
    @Column(columnDefinition = "TEXT")
    private String profilePhoto;

    // About section
    @Column(columnDefinition = "TEXT")
    private String about;

    // Professional information
    private String languages;

    @Column(name = "acting_languages")
    private String actingLanguages;

    @Column(name = "talent_category", length = 80)
    private String talentCategory;

    private String workType;

    private String dayRate;

    private Integer yearsExperience;

    private Integer projectsCompleted;

    private Integer brandsWorked;

    private Integer magazineFeatures;

    // Availability
    private Boolean available;

    private Boolean openForNewProjects;

    private LocalDate nextAvailableFrom;

    // Profile creation date
    private LocalDate memberSince;

    // Verification
    private Boolean idVerified;

    private Boolean phoneVerified;

    private Boolean emailVerified;

    // Instagram-style Privacy: true = Private (approval required), false = Public (default)
    @Column(name = "is_private")
    @Builder.Default
    private Boolean isPrivate = false;

    // Custom profession when ProfileType is OTHER
    private String customProfession;

    // Primary profession from master catalog
    @Column(name = "primary_profession", length = 120)
    private String primaryProfession;

    // Specialized skills added by the user (stored in database)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "profile_skills", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "skill")
    @Builder.Default
    private java.util.Set<String> skills = new java.util.HashSet<>();
}
