package com.example.bookmystars.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_role")
    private String senderRole; // "DIRECTOR" or "TALENT"

    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    private String messageText;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
