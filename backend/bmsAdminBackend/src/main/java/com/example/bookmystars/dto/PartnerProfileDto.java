package com.example.bookmystars.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerProfileDto {
    private Long id;
    private Long userId;
    private String academyName;
    private String category;
    private String tagline;
    private String directorName;
    private String designation;
    private String email;
    private String phone;
    private String city;
    private String address;
    private String website;
    private String instagram;
    private String youtube;
    private String establishedYear;
    private String activeStudents;
    private List<String> trainingBatches;
    private String studioFacilities;
    private String bio;
    private String logoUrl;
    private Boolean verified;
}
