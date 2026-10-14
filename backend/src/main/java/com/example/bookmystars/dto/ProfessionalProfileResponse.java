package com.example.bookmystars.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionalProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String companyName;
    private String companyType;
    private String website;
    private String about;
    private String logoUrl;
    private String officeAddress;
    private String contactPhone;
    private String businessEmail;
    private Boolean isVerified;
}
