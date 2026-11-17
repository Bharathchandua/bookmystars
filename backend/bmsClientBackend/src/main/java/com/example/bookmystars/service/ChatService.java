package com.example.bookmystars.service;

import com.example.bookmystars.dto.*;
import com.example.bookmystars.model.*;
import com.example.bookmystars.repository.*;
import com.example.bookmystars.util.UploadStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatConnectionRequestRepository chatConnectionRequestRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final BookingRequestRepository bookingRequestRepository;
    private final ProfileAccessRequestRepository profileAccessRequestRepository;
    private final CastingCallRepository castingCallRepository;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

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

        List<ChatMessage> messages = new ArrayList<>(chatMessageRepository.findMessagesForThread(threadKey, bookingId));

        // If threadKey is chatreq-X, fetch all direct messages between the two users
        if (threadKey.startsWith("chatreq-")) {
            try {
                Long reqId = Long.parseLong(threadKey.substring(8));
                Optional<ChatConnectionRequest> reqOpt = chatConnectionRequestRepository.findById(reqId);
                if (reqOpt.isPresent()) {
                    ChatConnectionRequest req = reqOpt.get();
                    if (req.getSender() != null && req.getRecipient() != null) {
                        Long u1Id = req.getSender().getId();
                        Long u2Id = req.getRecipient().getId();
                        List<ChatMessage> directMsgs = chatMessageRepository.findDirectMessagesBetweenUsers(u1Id, u2Id);
                        for (ChatMessage dm : directMsgs) {
                            if (messages.stream().noneMatch(m -> m.getId().equals(dm.getId()))) {
                                messages.add(dm);
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
        } else if (threadKey.startsWith("user-")) {
            // Also check if any direct messages exist between these two users (including legacy chatreq keys)
            String[] parts = threadKey.split("-");
            if (parts.length == 3) {
                try {
                    Long u1Id = Long.parseLong(parts[1]);
                    Long u2Id = Long.parseLong(parts[2]);
                    List<ChatMessage> directMsgs = chatMessageRepository.findDirectMessagesBetweenUsers(u1Id, u2Id);
                    for (ChatMessage dm : directMsgs) {
                        if (messages.stream().noneMatch(m -> m.getId().equals(dm.getId()))) {
                            messages.add(dm);
                        }
                    }
                } catch (Exception ignored) {}
            }
        }

        messages.sort(Comparator.comparing(ChatMessage::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));

        return messages.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> deleteMessage(Long messageId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        Optional<ChatMessage> msgOpt = chatMessageRepository.findById(messageId);
        if (msgOpt.isPresent()) {
            ChatMessage msg = msgOpt.get();
            if (msg.getSenderId().equals(currentUser.getId()) || (msg.getRecipientId() != null && msg.getRecipientId().equals(currentUser.getId()))) {
                chatMessageRepository.delete(msg);
            }
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Message deleted successfully");
        return response;
    }

    @Transactional
    public ChatMessageDTO sendMessage(Long bookingId, String userEmail, String text) {
        return sendMessageForThread(bookingId != null ? "book-" + bookingId : null, bookingId, null, null, userEmail, text);
    }

    @Transactional
    public ChatMessageDTO sendMessageForThread(String conversationKey, Long bookingId, Long recipientId, Long opportunityId, String userEmail, String text) {
        return sendMessageForThread(conversationKey, bookingId, recipientId, opportunityId, userEmail, text, null, null, null, null);
    }

    @Transactional
    public ChatMessageDTO sendMessageForThread(
            String conversationKey,
            Long bookingId,
            Long recipientId,
            Long opportunityId,
            String userEmail,
            String text,
            String mediaUrl,
            String mediaType,
            String fileName,
            Long fileSize
    ) {
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

        // Auto-resolve from chatreq-XX
        if (recipient == null && conversationKey != null && conversationKey.startsWith("chatreq-")) {
            try {
                Long reqId = Long.parseLong(conversationKey.substring(8));
                Optional<ChatConnectionRequest> reqOpt = chatConnectionRequestRepository.findById(reqId);
                if (reqOpt.isPresent()) {
                    ChatConnectionRequest req = reqOpt.get();
                    if (req.getSender().getId().equals(sender.getId())) {
                        recipient = req.getRecipient();
                    } else {
                        recipient = req.getSender();
                    }
                    if (req.getStatus() == ChatRequestStatus.ACCEPTED) {
                        long minId = Math.min(req.getSender().getId(), req.getRecipient().getId());
                        long maxId = Math.max(req.getSender().getId(), req.getRecipient().getId());
                        conversationKey = "user-" + minId + "-" + maxId;
                    }
                }
            } catch (Exception ignored) {}
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

        // Verify not blocked
        if (recipient != null) {
            List<ChatConnectionRequest> reqs = chatConnectionRequestRepository.findBetweenUsers(sender, recipient);
            for (ChatConnectionRequest r : reqs) {
                if (r.getStatus() == ChatRequestStatus.BLOCKED) {
                    throw new IllegalStateException("Messaging is blocked with this user.");
                }
            }
        }

        String finalText = (text != null && !text.trim().isEmpty()) ? text.trim() : "";
        if (finalText.isEmpty() && mediaUrl != null && !mediaUrl.trim().isEmpty()) {
            finalText = (fileName != null && !fileName.trim().isEmpty()) ? fileName.trim() : "Shared " + (mediaType != null ? mediaType.toLowerCase() : "media");
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
                .messageText(finalText)
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .fileName(fileName)
                .fileSize(fileSize)
                .createdAt(LocalDateTime.now())
                .build();

        ChatMessage saved = chatMessageRepository.save(msg);
        return toDTO(saved);
    }

    @Transactional
    public ChatMessageDTO uploadChatMedia(
            String conversationKey,
            Long bookingId,
            Long recipientId,
            Long opportunityId,
            String userEmail,
            MultipartFile file,
            String caption
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        try {
            Path chatUploadDir = UploadStorageUtil.getCategoryUploadDir("chat");
            String origName = file.getOriginalFilename();
            String ext = "";
            if (origName != null && origName.contains(".")) {
                ext = origName.substring(origName.lastIndexOf(".")).toLowerCase();
            }

            String uniqueName = UUID.randomUUID().toString() + ext;
            Path targetPath = chatUploadDir.resolve(uniqueName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String mediaUrl = "/uploads/chat/" + uniqueName;

            String contentType = file.getContentType();
            String mediaType = "DOCUMENT";
            if (contentType != null) {
                if (contentType.startsWith("image/")) {
                    mediaType = "IMAGE";
                } else if (contentType.startsWith("video/")) {
                    mediaType = "VIDEO";
                } else if (contentType.startsWith("audio/")) {
                    mediaType = "AUDIO";
                }
            } else {
                if (ext.matches("\\.(jpg|jpeg|png|gif|webp|bmp)")) {
                    mediaType = "IMAGE";
                } else if (ext.matches("\\.(mp4|webm|mov|mkv|avi)")) {
                    mediaType = "VIDEO";
                } else if (ext.matches("\\.(mp3|wav|ogg|m4a|aac)")) {
                    mediaType = "AUDIO";
                }
            }

            return sendMessageForThread(
                    conversationKey,
                    bookingId,
                    recipientId,
                    opportunityId,
                    userEmail,
                    caption,
                    mediaUrl,
                    mediaType,
                    origName,
                    file.getSize()
            );
        } catch (Exception e) {
            log.error("Failed to upload chat file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    // =========================================================================
    // CHAT CONNECTION REQUESTS
    // =========================================================================

    @Transactional
    public ChatRequestDto sendChatRequest(String userEmail, Long recipientId, String message) {
        User sender = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found: " + userEmail));

        if (recipientId == null) {
            throw new IllegalArgumentException("Recipient ID must be provided");
        }

        if (sender.getId().equals(recipientId)) {
            throw new IllegalArgumentException("You cannot send a chat request to yourself");
        }

        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found with id: " + recipientId));

        // Check for existing request between these two users
        List<ChatConnectionRequest> existingList = chatConnectionRequestRepository.findBetweenUsers(sender, recipient);
        ChatConnectionRequest targetReq;

        long minId = Math.min(sender.getId(), recipient.getId());
        long maxId = Math.max(sender.getId(), recipient.getId());
        String canonicalUserKey = "user-" + minId + "-" + maxId;

        // If communication is blocked, neither party can send another request until unblocked
        for (ChatConnectionRequest req : existingList) {
            if (req.getStatus() == ChatRequestStatus.BLOCKED) {
                boolean isBlocker = req.getSender().getId().equals(sender.getId());
                if (isBlocker) {
                    throw new IllegalStateException("You have blocked this user. Unblock them first before sending a request.");
                } else {
                    throw new IllegalStateException("Cannot send request: You cannot send requests to this user.");
                }
            }
        }

        if (!existingList.isEmpty()) {
            targetReq = existingList.get(0);
            if (targetReq.getStatus() == ChatRequestStatus.ACCEPTED) {
                targetReq.setConversationKey(canonicalUserKey);
                targetReq = chatConnectionRequestRepository.save(targetReq);
                return toChatRequestDto(targetReq);
            }
            if (targetReq.getStatus() == ChatRequestStatus.PENDING) {
                // If the other user already sent a pending request to me, auto-accept it!
                if (targetReq.getSender().getId().equals(recipient.getId())) {
                    targetReq.setStatus(ChatRequestStatus.ACCEPTED);
                    targetReq.setConversationKey(canonicalUserKey);
                    targetReq = chatConnectionRequestRepository.save(targetReq);
                    return toChatRequestDto(targetReq);
                }
                // If I already sent it, update message and return
                if (message != null && !message.trim().isEmpty()) {
                    targetReq.setMessage(message.trim());
                    targetReq.setConversationKey(canonicalUserKey);
                    targetReq = chatConnectionRequestRepository.save(targetReq);
                }
                return toChatRequestDto(targetReq);
            }
            // If DECLINED or CANCELLED, check attempt limit (max 3 requests)
            int currentAttempts = targetReq.getAttemptCount() != null ? targetReq.getAttemptCount() : 1;
            if (currentAttempts >= 3) {
                throw new IllegalStateException("Maximum limit of 3 connection requests to this user has been reached.");
            }

            targetReq.setSender(sender);
            targetReq.setRecipient(recipient);
            targetReq.setStatus(ChatRequestStatus.PENDING);
            targetReq.setConversationKey(canonicalUserKey);
            targetReq.setMessage(message != null ? message.trim() : "");
            targetReq.setAttemptCount(currentAttempts + 1);
            targetReq = chatConnectionRequestRepository.save(targetReq);
        } else {
            targetReq = ChatConnectionRequest.builder()
                    .sender(sender)
                    .recipient(recipient)
                    .status(ChatRequestStatus.PENDING)
                    .conversationKey(canonicalUserKey)
                    .message(message != null ? message.trim() : "")
                    .attemptCount(1)
                    .build();
            targetReq = chatConnectionRequestRepository.save(targetReq);
        }

        // Save introductory message in chat history
        if (message != null && !message.trim().isEmpty()) {
            ChatMessage introMsg = ChatMessage.builder()
                    .conversationKey(canonicalUserKey)
                    .senderId(sender.getId())
                    .senderName(sender.getFullName())
                    .senderRole(sender.getAccountType() != null ? sender.getAccountType().name() : "USER")
                    .recipientId(recipient.getId())
                    .recipientName(recipient.getFullName())
                    .messageText(message.trim())
                    .createdAt(LocalDateTime.now())
                    .build();
            chatMessageRepository.save(introMsg);
        }

        return toChatRequestDto(targetReq);
    }

    @Transactional
    public ChatRequestDto respondToChatRequest(String userEmail, Long requestId, boolean accept) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        ChatConnectionRequest req = chatConnectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Chat request not found: " + requestId));

        if (!req.getRecipient().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Only the recipient can respond to this chat request");
        }

        if (accept) {
            req.setStatus(ChatRequestStatus.ACCEPTED);
            long minId = Math.min(req.getSender().getId(), req.getRecipient().getId());
            long maxId = Math.max(req.getSender().getId(), req.getRecipient().getId());
            String unifiedKey = "user-" + minId + "-" + maxId;
            req.setConversationKey(unifiedKey);

            // Add confirmation message in chat
            ChatMessage acceptMsg = ChatMessage.builder()
                    .conversationKey(unifiedKey)
                    .senderId(currentUser.getId())
                    .senderName(currentUser.getFullName())
                    .senderRole(currentUser.getAccountType() != null ? currentUser.getAccountType().name() : "USER")
                    .recipientId(req.getSender().getId())
                    .recipientName(req.getSender().getFullName())
                    .messageText("🤝 Chat request accepted! You can now freely message each other.")
                    .createdAt(LocalDateTime.now())
                    .build();
            chatMessageRepository.save(acceptMsg);
        } else {
            req.setStatus(ChatRequestStatus.DECLINED);
        }

        ChatConnectionRequest updated = chatConnectionRequestRepository.save(req);
        return toChatRequestDto(updated);
    }

    @Transactional(readOnly = true)
    public ChatRequestStatusResponse getChatRequestStatus(String userEmail, Long targetUserId) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        if (targetUserId == null || currentUser.getId().equals(targetUserId)) {
            return ChatRequestStatusResponse.builder()
                    .status("SELF")
                    .build();
        }

        User targetUser = userRepository.findById(targetUserId).orElse(null);
        if (targetUser == null) {
            return ChatRequestStatusResponse.builder()
                    .status("NONE")
                    .build();
        }

        List<ChatConnectionRequest> list = chatConnectionRequestRepository.findBetweenUsers(currentUser, targetUser);
        if (list.isEmpty()) {
            return ChatRequestStatusResponse.builder()
                    .status("NONE")
                    .build();
        }

        for (ChatConnectionRequest req : list) {
            if (req.getStatus() == ChatRequestStatus.BLOCKED) {
                boolean isBlocker = req.getSender().getId().equals(currentUser.getId());
                return ChatRequestStatusResponse.builder()
                        .status(isBlocker ? "BLOCKED_BY_ME" : "BLOCKED")
                        .requestId(req.getId())
                        .conversationKey(req.getConversationKey())
                        .message(isBlocker ? "You have blocked this user" : "You cannot message this user")
                        .build();
            }
        }

        ChatConnectionRequest latest = list.get(0);

        if (latest.getStatus() == ChatRequestStatus.CANCELLED) {
            return ChatRequestStatusResponse.builder()
                    .status("NONE")
                    .attemptCount(latest.getAttemptCount() != null ? latest.getAttemptCount() : 1)
                    .build();
        }

        if (latest.getStatus() == ChatRequestStatus.ACCEPTED) {
            long minId = Math.min(currentUser.getId(), targetUser.getId());
            long maxId = Math.max(currentUser.getId(), targetUser.getId());
            return ChatRequestStatusResponse.builder()
                    .status("ACCEPTED")
                    .requestId(latest.getId())
                    .conversationKey("user-" + minId + "-" + maxId)
                    .message(latest.getMessage())
                    .attemptCount(latest.getAttemptCount() != null ? latest.getAttemptCount() : 1)
                    .build();
        }

        if (latest.getStatus() == ChatRequestStatus.PENDING) {
            if (latest.getSender().getId().equals(currentUser.getId())) {
                return ChatRequestStatusResponse.builder()
                        .status("OUTGOING_PENDING")
                        .requestId(latest.getId())
                        .conversationKey("chatreq-" + latest.getId())
                        .message(latest.getMessage())
                        .attemptCount(latest.getAttemptCount() != null ? latest.getAttemptCount() : 1)
                        .build();
            } else {
                return ChatRequestStatusResponse.builder()
                        .status("INCOMING_PENDING")
                        .requestId(latest.getId())
                        .conversationKey("chatreq-" + latest.getId())
                        .message(latest.getMessage())
                        .attemptCount(latest.getAttemptCount() != null ? latest.getAttemptCount() : 1)
                        .build();
            }
        }

        return ChatRequestStatusResponse.builder()
                .status(latest.getStatus().name())
                .requestId(latest.getId())
                .conversationKey(latest.getConversationKey())
                .message(latest.getMessage())
                .attemptCount(latest.getAttemptCount() != null ? latest.getAttemptCount() : 1)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatRequestDto> getIncomingChatRequests(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return chatConnectionRequestRepository.findByRecipientAndStatusOrderByCreatedAtDesc(currentUser, ChatRequestStatus.PENDING)
                .stream()
                .map(this::toChatRequestDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatRequestDto> getOutgoingChatRequests(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));
        return chatConnectionRequestRepository.findBySenderOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(this::toChatRequestDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> cancelChatRequest(String userEmail, Long requestId) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        ChatConnectionRequest req = chatConnectionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Chat request not found: " + requestId));

        if (!req.getSender().getId().equals(currentUser.getId()) && !req.getRecipient().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("You are not authorized to cancel this chat request");
        }

        req.setStatus(ChatRequestStatus.CANCELLED);
        chatConnectionRequestRepository.save(req);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Chat request cancelled successfully");
        return response;
    }

    @Transactional
    public Map<String, Object> disconnectChat(String userEmail, Long targetUserId) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found: " + targetUserId));

        List<ChatConnectionRequest> existing = chatConnectionRequestRepository.findBetweenUsers(currentUser, targetUser);
        for (ChatConnectionRequest req : existing) {
            req.setStatus(ChatRequestStatus.CANCELLED);
        chatConnectionRequestRepository.save(req);
        }

        long minId = Math.min(currentUser.getId(), targetUser.getId());
        long maxId = Math.max(currentUser.getId(), targetUser.getId());
        String convKey = "user-" + minId + "-" + maxId;

        // Add system message
        ChatMessage sysMsg = ChatMessage.builder()
                .conversationKey(convKey)
                .senderId(currentUser.getId())
                .senderName(currentUser.getFullName())
                .senderRole(currentUser.getAccountType() != null ? currentUser.getAccountType().name() : "USER")
                .recipientId(targetUser.getId())
                .recipientName(targetUser.getFullName())
                .messageText("⚠️ Chat connection was disconnected. A new request must be sent and approved to chat again.")
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(sysMsg);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Connection disconnected. To chat again, send a new request.");
        return response;
    }

    @Transactional
    public Map<String, Object> blockUser(String userEmail, Long targetUserId) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found: " + targetUserId));

        List<ChatConnectionRequest> existing = chatConnectionRequestRepository.findBetweenUsers(currentUser, targetUser);
        ChatConnectionRequest blockReq;
        if (!existing.isEmpty()) {
            blockReq = existing.get(0);
            blockReq.setSender(currentUser);
            blockReq.setRecipient(targetUser);
            blockReq.setStatus(ChatRequestStatus.BLOCKED);
        } else {
            blockReq = ChatConnectionRequest.builder()
                    .sender(currentUser)
                    .recipient(targetUser)
                    .status(ChatRequestStatus.BLOCKED)
                    .build();
        }
        chatConnectionRequestRepository.save(blockReq);

        long minId = Math.min(currentUser.getId(), targetUser.getId());
        long maxId = Math.max(currentUser.getId(), targetUser.getId());
        String convKey = "user-" + minId + "-" + maxId;

        ChatMessage blockMsg = ChatMessage.builder()
                .conversationKey(convKey)
                .senderId(currentUser.getId())
                .senderName(currentUser.getFullName())
                .senderRole(currentUser.getAccountType() != null ? currentUser.getAccountType().name() : "USER")
                .recipientId(targetUser.getId())
                .recipientName(targetUser.getFullName())
                .messageText("🚫 User was blocked.")
                .createdAt(LocalDateTime.now())
                .build();
        chatMessageRepository.save(blockMsg);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User blocked successfully");
        return response;
    }

    @Transactional
    public Map<String, Object> unblockUser(String userEmail, Long targetUserId) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found: " + targetUserId));

        List<ChatConnectionRequest> existing = chatConnectionRequestRepository.findBetweenUsers(currentUser, targetUser);
        for (ChatConnectionRequest req : existing) {
            if (req.getStatus() == ChatRequestStatus.BLOCKED && req.getSender().getId().equals(currentUser.getId())) {
                req.setStatus(ChatRequestStatus.CANCELLED);
        chatConnectionRequestRepository.save(req);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User unblocked successfully");
        return response;
    }

    // =========================================================================
    // GET MY CONVERSATIONS
    // =========================================================================

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

        // 3. Chat Connection Requests (New Peer-to-Peer Craft Requests)
        List<ChatConnectionRequest> chatReqs = chatConnectionRequestRepository.findAllByUser(currentUser);
        for (ChatConnectionRequest cr : chatReqs) {
            boolean isSender = cr.getSender().getId().equals(currentUser.getId());
            User otherUser = isSender ? cr.getRecipient() : cr.getSender();
            if (otherUser == null) continue;

            long minId = Math.min(currentUser.getId(), otherUser.getId());
            long maxId = Math.max(currentUser.getId(), otherUser.getId());
            String key = "user-" + minId + "-" + maxId;

            Optional<ChatMessage> latestMsg = chatMessageRepository.findFirstByConversationKeyOrderByCreatedAtDesc(key);
            if (!latestMsg.isPresent()) {
                String altKey = "chatreq-" + cr.getId();
                latestMsg = chatMessageRepository.findFirstByConversationKeyOrderByCreatedAtDesc(altKey);
            }

            String lastText;
            if (latestMsg.isPresent()) {
                lastText = latestMsg.get().getMessageText();
            } else if (cr.getStatus() == ChatRequestStatus.PENDING) {
                lastText = isSender
                        ? "⏳ Request Pending: Waiting for " + otherUser.getFullName() + " to accept"
                        : "📩 New Chat Request: " + (cr.getMessage() != null && !cr.getMessage().isEmpty() ? cr.getMessage() : "Wants to connect with you");
            } else if (cr.getStatus() == ChatRequestStatus.ACCEPTED) {
                lastText = "🤝 Connection accepted! Say hi to " + otherUser.getFullName();
            } else {
                lastText = "❌ Connection request declined";
            }

            LocalDateTime lastTime = latestMsg.map(ChatMessage::getCreatedAt)
                    .orElse(cr.getUpdatedAt() != null ? cr.getUpdatedAt() : cr.getCreatedAt());
            String otherCraft = getUserCraft(otherUser);
            String avatarUrl = getUserPhotoUrl(otherUser);

            int unread = (!isSender && cr.getStatus() == ChatRequestStatus.PENDING) ? 1 : 0;

            convMap.put(key, ConversationSummaryDTO.builder()
                    .id(key)
                    .conversationKey(key)
                    .targetUserId(otherUser.getId())
                    .name(otherUser.getFullName())
                    .role(otherCraft)
                    .company("Direct Connection")
                    .avatar(avatarUrl)
                    .email(otherUser.getEmail())
                    .phone(otherUser.getMobileNumber())
                    .lastMsg(lastText)
                    .lastMsgTime(lastTime)
                    .unreadCount(unread)
                    .chatRequest(toChatRequestDto(cr))
                    .build());
        }

        // 4. Direct chats and opportunity chats
        List<ChatMessage> userMessages = chatMessageRepository.findAllByUserId(currentUser.getId());
        for (ChatMessage m : userMessages) {
            if (m.getBookingId() != null) {
                continue; // Already handled by booking request above
            }
            if (m.getOpportunityId() != null) {
                String oppKey = m.getConversationKey();
                if (oppKey == null || oppKey.trim().isEmpty()) {
                    Long otherId = m.getSenderId().equals(currentUser.getId()) ? m.getRecipientId() : m.getSenderId();
                    if (otherId == null) continue;
                    oppKey = "opp-" + m.getOpportunityId() + "-" + otherId;
                }
                if (!convMap.containsKey(oppKey)) {
                    Long otherUserId = m.getSenderId().equals(currentUser.getId()) ? m.getRecipientId() : m.getSenderId();
                    User otherUser = (otherUserId != null) ? userRepository.findById(otherUserId).orElse(null) : null;
                    String otherName = otherUser != null ? otherUser.getFullName() : (m.getSenderId().equals(currentUser.getId()) ? m.getRecipientName() : m.getSenderName());
                    String otherRole = getUserCraft(otherUser);
                    String avatarUrl = getUserPhotoUrl(otherUser);
                    String company = "Inquiry";
                    Optional<CastingCall> oppOpt = castingCallRepository.findById(m.getOpportunityId());
                    if (oppOpt.isPresent()) {
                        company = "Inquiry: " + oppOpt.get().getTitle();
                    }
                    convMap.put(oppKey, ConversationSummaryDTO.builder()
                            .id(oppKey)
                            .conversationKey(oppKey)
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
                continue;
            }

            // Direct user-to-user conversation (NO booking, NO opportunity)
            Long otherUserId = m.getSenderId().equals(currentUser.getId()) ? m.getRecipientId() : m.getSenderId();
            if (otherUserId == null && m.getConversationKey() != null && m.getConversationKey().startsWith("chatreq-")) {
                try {
                    Long rId = Long.parseLong(m.getConversationKey().substring(8));
                    Optional<ChatConnectionRequest> crOpt = chatConnectionRequestRepository.findById(rId);
                    if (crOpt.isPresent()) {
                        ChatConnectionRequest cr = crOpt.get();
                        otherUserId = cr.getSender().getId().equals(currentUser.getId()) ? cr.getRecipient().getId() : cr.getSender().getId();
                    }
                } catch (Exception ignored) {}
            }
            if (otherUserId == null || otherUserId.equals(currentUser.getId())) {
                continue;
            }

            String canonicalKey = "user-" + Math.min(currentUser.getId(), otherUserId) + "-" + Math.max(currentUser.getId(), otherUserId);

            ConversationSummaryDTO existing = convMap.get(canonicalKey);
            if (existing != null) {
                if (m.getCreatedAt() != null && (existing.getLastMsgTime() == null || m.getCreatedAt().isAfter(existing.getLastMsgTime()))) {
                    existing.setLastMsg(m.getMessageText());
                    existing.setLastMsgTime(m.getCreatedAt());
                }
            } else {
                User otherUser = userRepository.findById(otherUserId).orElse(null);
                String otherName = otherUser != null ? otherUser.getFullName() : (m.getSenderId().equals(currentUser.getId()) ? m.getRecipientName() : m.getSenderName());
                String otherRole = getUserCraft(otherUser);
                String avatarUrl = getUserPhotoUrl(otherUser);

                convMap.put(canonicalKey, ConversationSummaryDTO.builder()
                        .id(canonicalKey)
                        .conversationKey(canonicalKey)
                        .targetUserId(otherUserId)
                        .name(otherName != null ? otherName : "User")
                        .role(otherRole)
                        .company("Direct Conversation")
                        .avatar(avatarUrl)
                        .email(otherUser != null ? otherUser.getEmail() : "")
                        .phone(otherUser != null ? otherUser.getMobileNumber() : "")
                        .lastMsg(m.getMessageText())
                        .lastMsgTime(m.getCreatedAt())
                        .build());
            }
        }

        // Guarantee: deduplicate direct conversations by target user ID so only 1 conversation entry exists per account
        Map<Long, ConversationSummaryDTO> userDirectMap = new HashMap<>();
        List<ConversationSummaryDTO> deduplicatedList = new ArrayList<>();

        for (ConversationSummaryDTO conv : convMap.values()) {
            if (conv.getBookingId() != null || conv.getOpportunityId() != null) {
                deduplicatedList.add(conv);
            } else if (conv.getTargetUserId() != null) {
                if (!userDirectMap.containsKey(conv.getTargetUserId())) {
                    userDirectMap.put(conv.getTargetUserId(), conv);
                    deduplicatedList.add(conv);
                } else {
                    // Update existing entry with newer message or request info
                    ConversationSummaryDTO existing = userDirectMap.get(conv.getTargetUserId());
                    if (conv.getLastMsgTime() != null && (existing.getLastMsgTime() == null || conv.getLastMsgTime().isAfter(existing.getLastMsgTime()))) {
                        existing.setLastMsg(conv.getLastMsg());
                        existing.setLastMsgTime(conv.getLastMsgTime());
                    }
                    if (existing.getChatRequest() == null && conv.getChatRequest() != null) {
                        existing.setChatRequest(conv.getChatRequest());
                    }
                }
            } else {
                deduplicatedList.add(conv);
            }
        }

        // Populate isOnline status for deduplicated conversations
        for (ConversationSummaryDTO conv : deduplicatedList) {
            if (conv.getTargetUserId() != null) {
                conv.setIsOnline(isUserOnline(conv.getTargetUserId()));
            } else {
                conv.setIsOnline(false);
            }
        }

        // Sort conversations by latest message / update time descending
        return deduplicatedList.stream()
                .sorted((a, b) -> {
                    LocalDateTime t1 = a.getLastMsgTime() != null ? a.getLastMsgTime() : LocalDateTime.MIN;
                    LocalDateTime t2 = b.getLastMsgTime() != null ? b.getLastMsgTime() : LocalDateTime.MIN;
                    return t2.compareTo(t1);
                })
                .collect(Collectors.toList());
    }

    private String getUserCraft(User user) {
        if (user == null) return "User";
        return profileRepository.findByUser(user)
                .map(p -> {
                    if (p.getPrimaryProfession() != null && !p.getPrimaryProfession().trim().isEmpty()) {
                        return p.getPrimaryProfession();
                    }
                    if (p.getCustomProfession() != null && !p.getCustomProfession().trim().isEmpty()) {
                        return p.getCustomProfession();
                    }
                    if (p.getTalentCategory() != null && !p.getTalentCategory().trim().isEmpty()) {
                        return p.getTalentCategory();
                    }
                    return user.getAccountType() != null ? user.getAccountType().name() : "Talent";
                })
                .orElse(user.getAccountType() != null ? user.getAccountType().name() : "Talent");
    }

    private String getUserPhotoUrl(User user) {
        if (user == null) return null;
        return profileRepository.findByUser(user)
                .map(Profile::getProfilePhoto)
                .orElse(null);
    }

    public ChatRequestDto toChatRequestDto(ChatConnectionRequest req) {
        if (req == null) return null;
        User s = req.getSender();
        User r = req.getRecipient();

        return ChatRequestDto.builder()
                .id(req.getId())
                .senderId(s != null ? s.getId() : null)
                .senderName(s != null ? s.getFullName() : "User")
                .senderRole(s != null && s.getAccountType() != null ? s.getAccountType().name() : "USER")
                .senderCraft(getUserCraft(s))
                .senderAvatar(getUserPhotoUrl(s))
                .senderEmail(s != null ? s.getEmail() : "")
                .recipientId(r != null ? r.getId() : null)
                .recipientName(r != null ? r.getFullName() : "User")
                .recipientRole(r != null && r.getAccountType() != null ? r.getAccountType().name() : "USER")
                .recipientAvatar(getUserPhotoUrl(r))
                .recipientEmail(r != null ? r.getEmail() : "")
                .status(req.getStatus())
                .message(req.getMessage())
                .conversationKey(req.getConversationKey())
                .attemptCount(req.getAttemptCount() != null ? req.getAttemptCount() : 1)
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
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
                .mediaUrl(m.getMediaUrl())
                .mediaType(m.getMediaType())
                .fileName(m.getFileName())
                .fileSize(m.getFileSize())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private BookingRequestResponse toBookingResponse(BookingRequest b) {
        if (b == null) return null;
        return BookingRequestResponse.builder()
                .id(b.getId())
                .professionalId(b.getProfessional() != null ? b.getProfessional().getId() : null)
                .professionalName(b.getProfessional() != null ? b.getProfessional().getFullName() : null)
                .professionalCompany(b.getProfessional() != null ? b.getProfessional().getStageName() : null)
                .talentId(b.getTalent() != null ? b.getTalent().getId() : null)
                .talentName(b.getTalent() != null ? b.getTalent().getFullName() : null)
                .projectTitle(b.getProjectTitle())
                .projectType(b.getProjectType())
                .bookingDate(b.getBookingDate())
                .location(b.getLocation())
                .offeredRate(b.getOfferedRate())
                .message(b.getMessage())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .build();
    }

    private ProfileAccessRequestDto toAccessRequestDto(ProfileAccessRequest req) {
        if (req == null) return null;
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

    // =========================================================================
    // REAL-TIME PRESENCE & TYPING METHODS
    // =========================================================================

    private static final Map<Long, Long> onlineHeartbeats = new java.util.concurrent.ConcurrentHashMap<>();
    private static final Map<String, Map<Long, Long>> threadTypingStatus = new java.util.concurrent.ConcurrentHashMap<>();

    private static final long ONLINE_TIMEOUT_MS = 25_000L;
    private static final long TYPING_TIMEOUT_MS = 4_500L;

    public void recordHeartbeat(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null) {
            long now = System.currentTimeMillis();
            onlineHeartbeats.put(user.getId(), now);
            if (jdbcTemplate != null) {
                try {
                    jdbcTemplate.update(
                        "INSERT INTO user_presence (user_id, last_heartbeat) VALUES (?, ?) " +
                        "ON CONFLICT (user_id) DO UPDATE SET last_heartbeat = EXCLUDED.last_heartbeat",
                        user.getId(), now
                    );
                } catch (Exception e) {
                    log.warn("Failed to persist heartbeat in user_presence: {}", e.getMessage());
                }
            }
        }
    }

    public void recordOffline(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user != null) {
            onlineHeartbeats.remove(user.getId());
            if (jdbcTemplate != null) {
                try {
                    jdbcTemplate.update("UPDATE user_presence SET last_heartbeat = 0 WHERE user_id = ?", user.getId());
                } catch (Exception e) {
                    log.warn("Failed to update offline in user_presence: {}", e.getMessage());
                }
            }
        }
    }

    public boolean isUserOnline(Long userId) {
        if (userId == null) return false;
        long now = System.currentTimeMillis();
        Long localLastSeen = onlineHeartbeats.get(userId);
        if (localLastSeen != null && (now - localLastSeen) < ONLINE_TIMEOUT_MS) {
            return true;
        }
        if (jdbcTemplate != null) {
            try {
                List<Long> rows = jdbcTemplate.query(
                    "SELECT last_heartbeat FROM user_presence WHERE user_id = ?",
                    (rs, rowNum) -> rs.getLong("last_heartbeat"),
                    userId
                );
                if (!rows.isEmpty()) {
                    long dbLastSeen = rows.get(0);
                    return (now - dbLastSeen) < ONLINE_TIMEOUT_MS;
                }
            } catch (Exception e) {
                log.warn("Failed to query user_presence: {}", e.getMessage());
            }
        }
        return false;
    }

    public Map<Long, Boolean> getBatchUserOnlineStatus(List<Long> userIds) {
        Map<Long, Boolean> result = new HashMap<>();
        if (userIds == null || userIds.isEmpty()) return result;
        long now = System.currentTimeMillis();
        List<Long> missingFromLocal = new ArrayList<>();
        for (Long uid : userIds) {
            if (uid != null) {
                Long localLastSeen = onlineHeartbeats.get(uid);
                if (localLastSeen != null && (now - localLastSeen) < ONLINE_TIMEOUT_MS) {
                    result.put(uid, true);
                } else {
                    missingFromLocal.add(uid);
                }
            }
        }
        if (!missingFromLocal.isEmpty() && jdbcTemplate != null) {
            try {
                String inSql = String.join(",", Collections.nCopies(missingFromLocal.size(), "?"));
                jdbcTemplate.query(
                    "SELECT user_id, last_heartbeat FROM user_presence WHERE user_id IN (" + inSql + ")",
                    rs -> {
                        long uid = rs.getLong("user_id");
                        long dbLastSeen = rs.getLong("last_heartbeat");
                        result.put(uid, (now - dbLastSeen) < ONLINE_TIMEOUT_MS);
                    },
                    missingFromLocal.toArray()
                );
            } catch (Exception e) {
                log.warn("Failed batch query user_presence: {}", e.getMessage());
            }
        }
        for (Long uid : missingFromLocal) {
            result.putIfAbsent(uid, false);
        }
        return result;
    }

    public void setTypingStatus(String userEmail, String threadKey, boolean isTyping) {
        if (threadKey == null || threadKey.trim().isEmpty()) return;
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return;

        Map<Long, Long> userTypingMap = threadTypingStatus.computeIfAbsent(threadKey, k -> new java.util.concurrent.ConcurrentHashMap<>());
        long now = System.currentTimeMillis();
        if (isTyping) {
            userTypingMap.put(user.getId(), now);
        } else {
            userTypingMap.remove(user.getId());
        }

        if (jdbcTemplate != null) {
            try {
                if (isTyping) {
                    jdbcTemplate.update(
                        "INSERT INTO user_presence (user_id, last_heartbeat, active_thread, last_typing) " +
                        "VALUES (?, ?, ?, ?) ON CONFLICT (user_id) DO UPDATE SET active_thread = EXCLUDED.active_thread, last_typing = EXCLUDED.last_typing",
                        user.getId(), now, threadKey, now
                    );
                } else {
                    jdbcTemplate.update(
                        "UPDATE user_presence SET active_thread = NULL, last_typing = 0 WHERE user_id = ?",
                        user.getId()
                    );
                }
            } catch (Exception e) {
                log.warn("Failed to persist typing in user_presence: {}", e.getMessage());
            }
        }
    }

    public Map<String, Object> getThreadTypingStatus(String userEmail, String threadKey) {
        Map<String, Object> response = new HashMap<>();
        response.put("isTyping", false);
        response.put("threadKey", threadKey);

        if (threadKey == null || threadKey.trim().isEmpty()) return response;
        User currentUser = userRepository.findByEmail(userEmail).orElse(null);
        Long myId = currentUser != null ? currentUser.getId() : null;

        long now = System.currentTimeMillis();

        // 1. Check local in-memory first
        Map<Long, Long> userTypingMap = threadTypingStatus.get(threadKey);
        if (userTypingMap != null && !userTypingMap.isEmpty()) {
            for (Map.Entry<Long, Long> entry : userTypingMap.entrySet()) {
                Long typistId = entry.getKey();
                Long timestamp = entry.getValue();

                if (!typistId.equals(myId) && timestamp != null && (now - timestamp) < TYPING_TIMEOUT_MS) {
                    User typist = userRepository.findById(typistId).orElse(null);
                    String typistName = typist != null ? typist.getFullName() : "User";
                    response.put("isTyping", true);
                    response.put("typistId", typistId);
                    response.put("typistName", typistName);
                    return response;
                }
            }
        }

        // 2. Check cross-service database user_presence
        if (jdbcTemplate != null) {
            try {
                long threshold = now - TYPING_TIMEOUT_MS;
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    "SELECT u.id, u.full_name FROM user_presence up JOIN users u ON up.user_id = u.id " +
                    "WHERE up.active_thread = ? AND up.user_id != ? AND up.last_typing > ? LIMIT 1",
                    threadKey, (myId != null ? myId : -1L), threshold
                );
                if (!rows.isEmpty()) {
                    Map<String, Object> row = rows.get(0);
                    response.put("isTyping", true);
                    response.put("typistId", row.get("id"));
                    response.put("typistName", row.get("full_name"));
                    return response;
                }
            } catch (Exception e) {
                log.warn("Failed to query thread typing status: {}", e.getMessage());
            }
        }

        return response;
    }
}
