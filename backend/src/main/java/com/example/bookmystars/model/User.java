package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Talent, Professional, or Partner
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;

    // Full name or Academy/Business name
    @Column(nullable = false)
    private String fullName;

    // Optional (e.g. Stage name or Contact Person Name for Partner)
    private String stageName;

    // Login email
    @Column(nullable = false, unique = true)
    private String email;

    // Mobile number
    @Column(nullable = false, unique = true)
    private String mobileNumber;

    // Encrypted password will be stored here
    @Column(nullable = false)
    private String password;

    // Date of Birth (optional for business / partner accounts)
    @Column(nullable = true)
    private LocalDate dateOfBirth;

    // Gender (optional for business / partner accounts)
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Gender gender;

    // City / Location
    @Column(nullable = false)
    private String location;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "user_profile_types",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "profile_type")
    @Builder.Default
    private Set<ProfileType> profileTypes = new HashSet<>();

    // How the user heard about BookMyStars
    private String referralSource;

    // User must accept terms
    @Column(nullable = false)
    @Builder.Default
    private Boolean termsAccepted = true;

    // Custom profession when ProfileType is OTHER
    private String customProfession;

    // Primary profession from master catalog
    @Column(name = "primary_profession", length = 120)
    private String primaryProfession;

    // --- PARTNER & APPROVAL GATEKEEPING ATTRIBUTES ---

    // Whether this account has been verified and approved by the Super Admin
    @Column(name = "is_approved")
    @Builder.Default
    private Boolean isApproved = true;

    // Verification status: PENDING, APPROVED, REJECTED
    @Column(name = "verification_status", length = 40)
    @Builder.Default
    private String verificationStatus = "APPROVED";

    // Academy / Business Category (e.g. DANCE_ACADEMY, ACTING_ACADEMY, MUSIC_STUDIO, etc.)
    @Column(name = "partner_category", length = 100)
    private String partnerCategory;

    // Partnership requirements / Goals (e.g. Hiring talent, promoting batches, ad campaigns)
    @Column(name = "partner_requirements", columnDefinition = "TEXT")
    private String partnerRequirements;

    // Official website or portfolio link
    @Column(name = "partner_website", length = 255)
    private String partnerWebsite;

    // Physical academy / business address
    @Column(name = "partner_address", length = 500)
    private String partnerAddress;

    // Rejection reason note from Super Admin if rejected
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    // Timestamp when approved by Super Admin
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // Registration timestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onPrePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (accountType == AccountType.PARTNER || accountType == AccountType.CLIENT) {
            if (isApproved == null) isApproved = false;
            if (verificationStatus == null) verificationStatus = "PENDING";
        } else {
            if (isApproved == null) isApproved = true;
            if (verificationStatus == null) verificationStatus = "APPROVED";
        }
    }
}
