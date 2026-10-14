package com.example.bookmystars.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
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

    // Talent or Professional
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType;

    // Full name
    @Column(nullable = false)
    private String fullName;

    // Optional
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

    // Date of Birth
    @Column(nullable = false)
    private LocalDate dateOfBirth;

    // Gender
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    // City
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
    private Boolean termsAccepted;

    // Custom profession when ProfileType is OTHER
    private String customProfession;
}