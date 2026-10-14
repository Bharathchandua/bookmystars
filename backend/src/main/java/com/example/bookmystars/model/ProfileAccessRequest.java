package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_access_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileAccessRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The talent who owns the private profile
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "talent_id", nullable = false)
    private User talent;

    // Optional: Logged-in requester user (null if requester was anonymous/visitor)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private User requester;

    @Column(name = "requester_name", nullable = false)
    private String requesterName;

    @Column(name = "requester_email", nullable = false)
    private String requesterEmail;

    @Column(name = "requester_role")
    private String requesterRole;

    @Column(name = "requester_message", columnDefinition = "TEXT")
    private String requesterMessage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccessRequestStatus status = AccessRequestStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = AccessRequestStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
