package com.example.bookmystars.service;

import com.example.bookmystars.dto.BookingRequestResponse;
import com.example.bookmystars.dto.CreateBookingRequest;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingRequestService {

    private final BookingRequestRepository bookingRequestRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ProfessionalProfileRepository professionalProfileRepository;
    private final AvailabilityRepository availabilityRepository;

    @Transactional
    public BookingRequestResponse createBookingRequest(User professional, CreateBookingRequest req) {
        if (professional.getId().equals(req.getTalentId())) {
            throw new IllegalArgumentException("You cannot send a booking request to yourself.");
        }

        User talent = userRepository.findById(req.getTalentId())
                .orElseThrow(() -> new RuntimeException("Talent not found with ID: " + req.getTalentId()));

        BookingRequest booking = BookingRequest.builder()
                .professional(professional)
                .talent(talent)
                .bookingDate(req.getBookingDate())
                .projectTitle(req.getProjectTitle().trim())
                .projectType(req.getProjectType() != null ? req.getProjectType().trim() : "Project Shoot")
                .location(req.getLocation() != null ? req.getLocation().trim() : talent.getLocation())
                .offeredRate(req.getOfferedRate() != null ? req.getOfferedRate().trim() : null)
                .message(req.getMessage() != null ? req.getMessage().trim() : null)
                .status(BookingRequestStatus.PENDING)
                .build();

        BookingRequest saved = bookingRequestRepository.save(booking);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingRequestResponse> getIncomingRequestsForTalent(User talent) {
        return bookingRequestRepository.findByTalentOrderByCreatedAtDesc(talent)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingRequestResponse> getSentRequestsByProfessional(User professional) {
        return bookingRequestRepository.findByProfessionalOrderByCreatedAtDesc(professional)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingRequestResponse updateStatus(Long requestId, User currentUser, BookingRequestStatus newStatus) {
        BookingRequest booking = bookingRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Booking request not found with ID: " + requestId));

        boolean isTalent = booking.getTalent().getId().equals(currentUser.getId());
        boolean isProfessional = booking.getProfessional().getId().equals(currentUser.getId());

        if (!isTalent && !isProfessional) {
            throw new RuntimeException("You are not authorized to update this booking request.");
        }

        booking.setStatus(newStatus);
        BookingRequest updated = bookingRequestRepository.save(booking);

        // When talent accepts, automatically sync availability to BOOKED
        if (isTalent && newStatus == BookingRequestStatus.ACCEPTED) {
            availabilityRepository.findByUserIdAndAvailabilityDate(booking.getTalent().getId(), booking.getBookingDate())
                    .ifPresentOrElse(
                            avail -> {
                                avail.setStatus(AvailabilityStatus.BOOKED);
                                avail.setDescription(booking.getProjectTitle());
                                availabilityRepository.save(avail);
                            },
                            () -> {
                                Availability newAvail = Availability.builder()
                                        .user(booking.getTalent())
                                        .availabilityDate(booking.getBookingDate())
                                        .status(AvailabilityStatus.BOOKED)
                                        .description(booking.getProjectTitle())
                                        .build();
                                availabilityRepository.save(newAvail);
                            }
                    );
        }

        return mapToResponse(updated);
    }

    private BookingRequestResponse mapToResponse(BookingRequest booking) {
        User pro = booking.getProfessional();
        User tal = booking.getTalent();

        String proCompany = professionalProfileRepository.findByUser(pro)
                .map(ProfessionalProfile::getCompanyName)
                .orElse(pro.getFullName());

        String proPhoto = profileRepository.findByUser(pro)
                .map(Profile::getProfilePhoto)
                .filter(p -> p != null && !p.isBlank())
                .orElseGet(() -> professionalProfileRepository.findByUser(pro)
                        .map(ProfessionalProfile::getLogoUrl)
                        .orElse(null));

        String talPhoto = profileRepository.findByUser(tal)
                .map(Profile::getProfilePhoto)
                .orElse(null);

        return BookingRequestResponse.builder()
                .id(booking.getId())
                .professionalId(pro.getId())
                .professionalName(pro.getFullName())
                .professionalEmail(pro.getEmail())
                .professionalMobile(pro.getMobileNumber())
                .professionalCompany(proCompany)
                .professionalPhotoUrl(proPhoto)
                .talentId(tal.getId())
                .talentName(tal.getFullName())
                .talentEmail(tal.getEmail())
                .talentPhotoUrl(talPhoto)
                .bookingDate(booking.getBookingDate())
                .projectTitle(booking.getProjectTitle())
                .projectType(booking.getProjectType())
                .location(booking.getLocation())
                .offeredRate(booking.getOfferedRate())
                .message(booking.getMessage())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
