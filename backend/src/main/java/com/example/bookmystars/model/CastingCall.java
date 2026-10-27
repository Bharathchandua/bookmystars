package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "casting_calls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CastingCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by_user_id", nullable = false)
    private User postedBy;

    @Column(nullable = false)
    private String title;

    private String projectType;

    @Column(name = "post_type", length = 80)
    private String postType;

    @Column(name = "required_languages", length = 255)
    private String requiredLanguages;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProfileType roleType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    private String location;

    private BigDecimal budget;

    private LocalDate shootStartDate;

    private LocalDate shootEndDate;

    private LocalDate applicationDeadline;

    @Column(length = 1000)
    private String videoUrl;

    @Column(length = 1000)
    private String posterUrl;

    private String customCraft;

    @Column(length = 100)
    private String age;

    @Column(length = 50)
    private String gender;

    @Column(length = 50)
    private String height;

    @Column(length = 50)
    private String weight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CastingStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = CastingStatus.OPEN;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
