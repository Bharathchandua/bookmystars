package com.example.bookmystars.repository;

import com.example.bookmystars.model.BookingRequest;
import com.example.bookmystars.model.BookingRequestStatus;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRequestRepository extends JpaRepository<BookingRequest, Long> {

    List<BookingRequest> findByTalentOrderByCreatedAtDesc(User talent);

    List<BookingRequest> findByProfessionalOrderByCreatedAtDesc(User professional);

    List<BookingRequest> findByTalentAndStatusOrderByCreatedAtDesc(User talent, BookingRequestStatus status);

    long countByTalentAndStatus(User talent, BookingRequestStatus status);

    boolean existsByTalentAndBookingDateAndStatus(User talent, LocalDate bookingDate, BookingRequestStatus status);
}
