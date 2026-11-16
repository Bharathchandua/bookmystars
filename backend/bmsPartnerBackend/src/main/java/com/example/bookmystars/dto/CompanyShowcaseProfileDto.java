package com.example.bookmystars.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyShowcaseProfileDto {

    private Long userId;
    private String entityType; // "CLIENT" or "PARTNER"
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
    private String facebook;
    private String twitter;
    private String whatsapp;
    private String socialVisibility;
    private String mapCoordinates;
    private String logoUrl;
    private String bio;
    private Boolean verified;
    private List<ShowcaseItemDto> showcaseItems;
    private List<CastingCallResponse> activeOpportunities;
}
