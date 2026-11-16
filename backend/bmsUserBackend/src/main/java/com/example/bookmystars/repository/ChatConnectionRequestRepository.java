package com.example.bookmystars.repository;

import com.example.bookmystars.model.ChatConnectionRequest;
import com.example.bookmystars.model.ChatRequestStatus;
import com.example.bookmystars.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConnectionRequestRepository extends JpaRepository<ChatConnectionRequest, Long> {

    Optional<ChatConnectionRequest> findBySenderAndRecipient(User sender, User recipient);

    List<ChatConnectionRequest> findByRecipientOrderByCreatedAtDesc(User recipient);

    List<ChatConnectionRequest> findBySenderOrderByCreatedAtDesc(User sender);

    List<ChatConnectionRequest> findByRecipientAndStatusOrderByCreatedAtDesc(User recipient, ChatRequestStatus status);

    @Query("SELECT r FROM ChatConnectionRequest r WHERE (r.sender = :u1 AND r.recipient = :u2) OR (r.sender = :u2 AND r.recipient = :u1) ORDER BY r.createdAt DESC")
    List<ChatConnectionRequest> findBetweenUsers(@Param("u1") User u1, @Param("u2") User u2);

    @Query("SELECT r FROM ChatConnectionRequest r WHERE r.sender = :user OR r.recipient = :user ORDER BY r.createdAt DESC")
    List<ChatConnectionRequest> findAllByUser(@Param("user") User user);

    Optional<ChatConnectionRequest> findByConversationKey(String conversationKey);
}
