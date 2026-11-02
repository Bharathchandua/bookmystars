package com.example.bookmystars.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientProfileDto {
    private Long id;
    private Long userId;
    private String companyName;
    private String industry;
    private String tagline;
    private String contactPerson;
    private String designation;
    private String email;
    private String phone;
    private String city;
    private String address;
    private String website;
    private String instagram;
    private String linkedin;
    private String youtube;
    private String establishedYear;
    private String annualShoots;
    private String budgetRange;
    private String bio;
    private List<String> preferredProfiles;
    private String logoUrl;
    private Boolean verified;
}
