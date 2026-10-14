package com.example.bookmystars.restcontroller;

import com.example.bookmystars.dto.BookingRequestResponse;
import com.example.bookmystars.dto.CreateBookingRequest;
import com.example.bookmystars.model.BookingRequestStatus;
import com.example.bookmystars.model.User;
import com.example.bookmystars.repository.UserRepository;
import com.example.bookmystars.service.BookingRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings/requests")
@RequiredArgsConstructor
@Tag(name = "Booking Requests", description = "Endpoints for booking talent, scheduling shoot dates, and responding to booking offers")
public class BookingRequestController {

    private final BookingRequestService bookingRequestService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Send a shoot/booking request to a talent on an available date")
    public ResponseEntity<BookingRequestResponse> createBooking(
            Authentication authentication,
            @Valid @RequestBody CreateBookingRequest request) {

        User currentUser = getCurrentUser(authentication);
        BookingRequestResponse response = bookingRequestService.createBookingRequest(currentUser, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/incoming")
    @Operation(summary = "Get incoming booking requests received by the logged-in talent")
    public ResponseEntity<List<BookingRequestResponse>> getIncomingRequests(
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        List<BookingRequestResponse> responses = bookingRequestService.getIncomingRequestsForTalent(currentUser);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/sent")
    @Operation(summary = "Get booking requests sent by the logged-in professional")
    public ResponseEntity<List<BookingRequestResponse>> getSentRequests(
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        List<BookingRequestResponse> responses = bookingRequestService.getSentRequestsByProfessional(currentUser);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Accept, decline, or cancel a booking request")
    public ResponseEntity<BookingRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingRequestStatus status,
            Authentication authentication) {

        User currentUser = getCurrentUser(authentication);
        BookingRequestResponse response = bookingRequestService.updateStatus(id, currentUser, status);
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User is not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }
}
