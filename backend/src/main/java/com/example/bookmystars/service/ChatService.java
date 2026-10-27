package com.example.bookmystars.service;

import com.example.bookmystars.dto.BookingRequestResponse;
import com.example.bookmystars.dto.ChatMessageDTO;
import com.example.bookmystars.dto.ConversationSummaryDTO;
import com.example.bookmystars.dto.ProfileAccessRequestDto;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final BookingRequestRepository bookingRequestRepository;
    private final ProfileAccessRequestRepository profileAccessRequestRepository;
    private final CastingCallRepository castingCallRepository;

    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessagesForBooking(Long bookingId) {
        return chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessagesForThread(String threadKey) {
        if (threadKey == null || threadKey.trim().isEmpty()) {
            return Collections.emptyList();
        }
        Long bookingId = null;
        if (threadKey.startsWith("book-")) {
            try {
                bookingId = Long.parseLong(threadKey.substring(5));
            } catch (NumberFormatException ignored) {}
        }
        return chatMessageRepository.findMessagesForThread(threadKey, bookingId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDTO sendMessage(Long bookingId, String userEmail, String text) {
        return sendMessageForThread(bookingId != null ? "book-" + bookingId : null, bookingId, null, null, userEmail, text);
    }

    @Transactional
    public ChatMessageDTO sendMessageForThread(String conversationKey, Long bookingId, Long recipientId, Long opportunityId, String userEmail, String text) {
        User sender = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        // Auto-resolve booking if conversationKey is book-XX
        if (bookingId == null && conversationKey != null && conversationKey.startsWith("book-")) {
            try {
                bookingId = Long.parseLong(conversationKey.substring(5));
            } catch (NumberFormatException ignored) {}
        }

        User recipient = null;
        if (bookingId != null) {
            Optional<BookingRequest> bookingOpt = bookingRequestRepository.findById(bookingId);
            if (bookingOpt.isPresent()) {
                BookingRequest b = bookingOpt.get();
                if (b.getProfessional().getId().equals(sender.getId())) {
                    recipient = b.getTalent();
                } else {
                    recipient = b.getProfessional();
                }
                if (conversationKey == null || conversationKey.trim().isEmpty()) {
                    conversationKey = "book-" + bookingId;
                }
            }
        }

        if (recipient == null && recipientId != null) {
            recipient = userRepository.findById(recipientId).orElse(null);
        }

        // Auto construct conversation key if missing
        if ((conversationKey == null || conversationKey.trim().isEmpty()) && recipient != null) {
            long minId = Math.min(sender.getId(), recipient.getId());
            long maxId = Math.max(sender.getId(), recipient.getId());
            if (opportunityId != null) {
                conversationKey = "opp-" + opportunityId + "-" + minId + "-" + maxId;
            } else {
                conversationKey = "user-" + minId + "-" + maxId;
            }
        }

        ChatMessage msg = ChatMessage.builder()
                .bookingId(bookingId)
                .conversationKey(conversationKey)
                .opportunityId(opportunityId)
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .senderRole(sender.getAccountType() != null ? sender.getAccountType().name() : "USER")
                .recipientId(recipient != null ? recipient.getId() : recipientId)
                .recipientName(recipient != null ? recipient.getFullName() : null)
                .messageText(text)
                .createdAt(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(msg);
        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryDTO> getMyConversations(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Map<String, ConversationSummaryDTO> convMap = new LinkedHashMap<>();

        // 1. Booking Requests (both sent and received)
        List<BookingRequest> sentBookings = bookingRequestRepository.findByProfessionalOrderByCreatedAtDesc(currentUser);
        for (BookingRequest b : sentBookings) {
            String key = "book-" + b.getId();
            User talent = b.getTalent();
            Optional<ChatMessage> latestMsg = chatMessageRepository.findFirstByBookingIdOrderByCreatedAtDesc(b.getId());

            String lastText = latestMsg.map(ChatMessage::getMessageText).orElse(
                    b.getStatus() == BookingRequestStatus.PENDING
                            ? "⏳ Request Pending: " + b.getProjectTitle()
                            : b.getStatus() == BookingRequestStatus.ACCEPTED
                            ? "✅ Offer Accepted: " + b.getProjectTitle()
                            : "❌ Offer Declined: " + b.getProjectTitle()
            );
            LocalDateTime lastTime = latestMsg.map(ChatMessage::getCreatedAt).orElse(b.getCreatedAt());

            String avatarUrl = getUserPhotoUrl(talent);

            convMap.put(key, ConversationSummaryDTO.builder()
                    .id(key)
                    .conversationKey(key)
                    .targetUserId(talent != null ? talent.getId() : null)
                    .name(talent != null ? talent.getFullName() : "Talent")
                    .role("Talent")
                    .company(b.getProjectTitle())
                    .avatar(avatarUrl)
                    .email(talent != null ? talent.getEmail() : "")
                    .phone(talent != null ? talent.getMobileNumber() : "")
                    .lastMsg(lastText)
                    .lastMsgTime(lastTime)
                    .bookingId(b.getId())
                    .bookingRequest(toBookingResponse(b))
                    .build());
        }

        List<BookingRequest> incomingBookings = bookingRequestRepository.findByTalentOrderByCreatedAtDesc(currentUser);
        for (BookingRequest b : incomingBookings) {
            String key = "book-" + b.getId();
            User professional = b.getProfessional();
            Optional<ChatMessage> latestMsg = chatMessageRepository.findFirstByBookingIdOrderByCreatedAtDesc(b.getId());

            String lastText = latestMsg.map(ChatMessage::getMessageText).orElse(
                    b.getStatus() == BookingRequestStatus.PENDING
                            ? "🎬 Shoot Request: " + b.getProjectTitle()
                            : b.getStatus() == BookingRequestStatus.ACCEPTED
                            ? "✅ Shoot Confirmed: " + b.getProjectTitle()
                            : "❌ Offer Declined: " + b.getProjectTitle()
            );
            LocalDateTime lastTime = latestMsg.map(ChatMessage::getCreatedAt).orElse(b.getCreatedAt());

            String avatarUrl = getUserPhotoUrl(professional);

            convMap.put(key, ConversationSummaryDTO.builder()
                    .id(key)
                    .conversationKey(key)
                    .targetUserId(professional != null ? professional.getId() : null)
                    .name(professional != null ? professional.getFullName() : "Casting Director")
                    .role("Casting Director")
                    .company(b.getProjectTitle())
                    .avatar(avatarUrl)
                    .email(professional != null ? professional.getEmail() : "")
                    .phone(professional != null ? professional.getMobileNumber() : "")
                    .lastMsg(lastText)
                    .lastMsgTime(lastTime)
                    .bookingId(b.getId())
                    .bookingRequest(toBookingResponse(b))
                    .build());
        }

        // 2. Profile Access Requests
        List<ProfileAccessRequest> accessRequests = profileAccessRequestRepository.findByTalentOrderByCreatedAtDesc(currentUser);
        for (ProfileAccessRequest req : accessRequests) {
            String key = "req-" + req.getId();
            Optional<ChatMessage> latestMsg = chatMessageRepository.findFirstByConversationKeyOrderByCreatedAtDesc(key);

            String lastText = latestMsg.map(ChatMessage::getMessageText).orElse(
                    req.getStatus() == AccessRequestStatus.PENDING
                            ? "🔒 Requested access to view your private portfolio"
                            : req.getStatus() == AccessRequestStatus.APPROVED
                            ? "✅ Profile access approved"
                            : "❌ Profile access declined"
            );
            LocalDateTime lastTime = latestMsg.map(ChatMessage::getCreatedAt).orElse(req.getCreatedAt());

            convMap.put(key, ConversationSummaryDTO.builder()
                    .id(key)
                    .conversationKey(key)
                    .targetUserId(req.getRequester() != null ? req.getRequester().getId() : null)
                    .name(req.getRequesterName() != null ? req.getRequesterName() : "Casting Director")
                    .role(req.getRequesterRole() != null ? req.getRequesterRole() : "Casting Director")
                    .company("Profile View Request")
                    .email(req.getRequesterEmail() != null ? req.getRequesterEmail() : "")
                    .lastMsg(lastText)
                    .lastMsgTime(lastTime)
                    .accessRequest(toAccessRequestDto(req))
                    .build());
        }

        // 3. Direct chats and opportunity chats
        List<ChatMessage> userMessages = chatMessageRepository.findAllByUserId(currentUser.getId());
        for (ChatMessage m : userMessages) {
            if (m.getBookingId() != null) {
                continue; // Already handled by booking request above
            }
            String key = m.getConversationKey();
            if (key == null || key.trim().isEmpty()) {
                Long otherId = m.getSenderId().equals(currentUser.getId()) ? m.getRecipientId() : m.getSenderId();
                if (otherId == null) continue;
                key = "user-" + Math.min(currentUser.getId(), otherId) + "-" + Math.max(currentUser.getId(), otherId);
            }

            if (!convMap.containsKey(key)) {
                Long otherUserId = m.getSenderId().equals(currentUser.getId()) ? m.getRecipientId() : m.getSenderId();
                User otherUser = (otherUserId != null) ? userRepository.findById(otherUserId).orElse(null) : null;

                String otherName = otherUser != null ? otherUser.getFullName() : (m.getSenderId().equals(currentUser.getId()) ? m.getRecipientName() : m.getSenderName());
                String otherRole = otherUser != null && otherUser.getAccountType() != null ? otherUser.getAccountType().name() : "User";
                String avatarUrl = getUserPhotoUrl(otherUser);

                String company = "Direct Conversation";
                if (m.getOpportunityId() != null) {
                    Optional<CastingCall> oppOpt = castingCallRepository.findById(m.getOpportunityId());
                    if (oppOpt.isPresent()) {
                        company = "Inquiry: " + oppOpt.get().getTitle();
                    }
                }

                convMap.put(key, ConversationSummaryDTO.builder()
                        .id(key)
                        .conversationKey(key)
                        .targetUserId(otherUserId)
                        .name(otherName != null ? otherName : "User")
                        .role(otherRole)
                        .company(company)
                        .avatar(avatarUrl)
                        .email(otherUser != null ? otherUser.getEmail() : "")
                        .phone(otherUser != null ? otherUser.getMobileNumber() : "")
                        .lastMsg(m.getMessageText())
                        .lastMsgTime(m.getCreatedAt())
                        .opportunityId(m.getOpportunityId())
                        .build());
            }
        }

        // Sort conversations by latest message / update time descending
        return convMap.values().stream()
                .sorted((a, b) -> {
                    LocalDateTime t1 = a.getLastMsgTime() != null ? a.getLastMsgTime() : LocalDateTime.MIN;
                    LocalDateTime t2 = b.getLastMsgTime() != null ? b.getLastMsgTime() : LocalDateTime.MIN;
                    return t2.compareTo(t1);
                })
                .collect(Collectors.toList());
    }

    private String getUserPhotoUrl(User user) {
        if (user == null) return null;
        return profileRepository.findByUser(user)
                .map(Profile::getProfilePhoto)
                .orElse(null);
    }

    private ChatMessageDTO toDTO(ChatMessage m) {
        return ChatMessageDTO.builder()
                .id(m.getId())
                .bookingId(m.getBookingId())
                .senderId(m.getSenderId())
                .senderName(m.getSenderName())
                .senderRole(m.getSenderRole())
                .recipientId(m.getRecipientId())
                .recipientName(m.getRecipientName())
                .opportunityId(m.getOpportunityId())
                .conversationKey(m.getConversationKey())
                .messageText(m.getMessageText())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private BookingRequestResponse toBookingResponse(BookingRequest b) {
        return BookingRequestResponse.builder()
                .id(b.getId())
                .professionalId(b.getProfessional().getId())
                .professionalName(b.getProfessional().getFullName())
                .professionalEmail(b.getProfessional().getEmail())
                .professionalMobile(b.getProfessional().getMobileNumber())
                .professionalPhotoUrl(getUserPhotoUrl(b.getProfessional()))
                .talentId(b.getTalent().getId())
                .talentName(b.getTalent().getFullName())
                .talentEmail(b.getTalent().getEmail())
                .talentPhotoUrl(getUserPhotoUrl(b.getTalent()))
                .bookingDate(b.getBookingDate())
                .projectTitle(b.getProjectTitle())
                .projectType(b.getProjectType())
                .location(b.getLocation())
                .offeredRate(b.getOfferedRate())
                .message(b.getMessage())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private ProfileAccessRequestDto toAccessRequestDto(ProfileAccessRequest req) {
        return ProfileAccessRequestDto.builder()
                .id(req.getId())
                .talentId(req.getTalent() != null ? req.getTalent().getId() : null)
                .talentName(req.getTalent() != null ? req.getTalent().getFullName() : null)
                .requesterId(req.getRequester() != null ? req.getRequester().getId() : null)
                .requesterName(req.getRequesterName())
                .requesterEmail(req.getRequesterEmail())
                .requesterRole(req.getRequesterRole())
                .requesterMessage(req.getRequesterMessage())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
