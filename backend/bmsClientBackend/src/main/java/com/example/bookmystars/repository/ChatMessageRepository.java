package com.example.bookmystars.repository;

import com.example.bookmystars.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByBookingIdOrderByCreatedAtAsc(Long bookingId);

    List<ChatMessage> findByConversationKeyOrderByCreatedAtAsc(String conversationKey);

    Optional<ChatMessage> findFirstByBookingIdOrderByCreatedAtDesc(Long bookingId);

    Optional<ChatMessage> findFirstByConversationKeyOrderByCreatedAtDesc(String conversationKey);

    @Query("SELECT m FROM ChatMessage m WHERE m.conversationKey = :key OR (m.bookingId IS NOT NULL AND :bookingId IS NOT NULL AND m.bookingId = :bookingId) ORDER BY m.createdAt ASC")
    List<ChatMessage> findMessagesForThread(@Param("key") String key, @Param("bookingId") Long bookingId);

    @Query("SELECT m FROM ChatMessage m WHERE m.senderId = :userId OR m.recipientId = :userId ORDER BY m.createdAt DESC")
    List<ChatMessage> findAllByUserId(@Param("userId") Long userId);
}
