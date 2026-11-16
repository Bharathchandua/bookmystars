package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "measurements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Measurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Physical Measurements
    @Column(nullable = false)
    private String height;

    private String bust;

    private String waist;

    private String hips;

    @Column(name = "dress_size")
    private String dressSize;

    @Column(name = "shoe_size")
    private String shoeSize;

    // Features & Appearance
    @Column(name = "hair_color")
    private String hairColor;

    @Column(name = "eye_color")
    private String eyeColor;

    @Column(name = "skin_tone")
    private String skinTone;

    @Column(name = "body_type")
    private String bodyType;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}