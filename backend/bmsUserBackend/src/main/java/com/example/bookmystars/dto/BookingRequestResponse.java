package com.example.bookmystars.dto;

import com.example.bookmystars.model.BookingRequestStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestResponse {

    private Long id;

    // Professional info
    private Long professionalId;
    private String professionalName;
    private String professionalEmail;
    private String professionalMobile;
    private String professionalCompany;
    private String professionalPhotoUrl;

    // Talent info
    private Long talentId;
    private String talentName;
    private String talentEmail;
    private String talentPhotoUrl;

    // Booking details
    private LocalDate bookingDate;
    private String projectTitle;
    private String projectType;
    private String location;
    private String offeredRate;
    private String message;
    private BookingRequestStatus status;
    private LocalDateTime createdAt;
}
