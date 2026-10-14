package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "work_experience")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String company;

    private String title;

    @Column(length = 2000)
    private String description;

    private String category;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(length = 1000)
    private String fileUrl;

    private String fileName;
}