import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../Layout/AppLayout.jsx";
import ChatList from "./ChatList.jsx";
import ChatWindow from "./ChatWindow.jsx";
import ChatSidebar from "./ChatSidebar.jsx";
import { 
  getMyConversations,
  getThreadMessages,
  sendThreadMessage,
  uploadChatMedia,
  deleteChatMessage,
  respondToProfileAccessRequest, 
  updateBookingRequestStatus,
  respondToChatRequest,
  sendChatRequest,
  cancelChatRequest,
  disconnectChat,
  blockUser,
  unblockUser,
  getChatRequestStatus,
  getStoredUser,
  getFullImageUrl,
  sendHeartbeat,
  sendOffline,
  getUserPresence,
  getBatchUserPresence,
  setTypingStatus,
  getThreadTypingStatus
} from "../../features/bms/api";
import { showSuccess, showError } from "../../shared/utils/alert";
import "./messages.css";
import "./messages-mobile.css";

export default function Messages() {
  const location = useLocation();
  const storedUser = useMemo(() => getStoredUser(), []);
  const currentUserId = storedUser?.userId || storedUser?.id;
  const currentUserEmail = storedUser?.email || "";
  const isProfessional = (storedUser?.accountType || "").toUpperCase() === "PROFESSIONAL";

  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatListOpen, setIsChatListOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [typingMap, setTypingMap] = useState({});

  // Keep refs for live polling without stale closures
  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const activeChat = conversations.find((c) => c.id === activeChatId);
  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Track latest message signatures to avoid unnecessary re-renders during live polling
  const lastMsgSignatureRef = useRef({});
  const initializedCardsRef = useRef(new Set());
  const isFetchingThreadRef = useRef(false);
  const isSyncingConvsRef = useRef(false);
  const isPollingRef = useRef(false);
  const pollBackoffRef = useRef(0);

  const conversationsRef = useRef(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Lock body & html scroll when on Messages page so the entire page and header NEVER scroll away
  useEffect(() => {
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
    };
  }, []);

  // Real-time Presence Lifecycle: Tracks active status and visibility
  useEffect(() => {
    // 1. Send heartbeat immediately when entering Messages
    sendHeartbeat();

    // 2. Periodic heartbeat ping every 12 seconds while tab is active
    const heartbeatInterval = setInterval(() => {
      if (!document.hidden) {
        sendHeartbeat();
      }
    }, 12000);

    // 3. Mark offline when user switches tabs or minimizes browser; restore on return
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendOffline();
      } else {
        sendHeartbeat();
      }
    };

    // 4. Mark offline on window close or page refresh
    const handleBeforeUnload = () => {
      sendOffline();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      sendOffline();
    };
  }, []);

  // Helper to deduplicate conversations: ensures only 1 direct conversation per account
  const deduplicateConversations = useCallback((list) => {
    const deduplicated = [];
    const seenDirectUserIds = new Set();
    const seenDirectNames = new Set();

    for (const item of list) {
      if (item.bookingId || item.bookingRequest || item.opportunityId) {
        deduplicated.push(item);
        continue;
      }
      
      const uid = item.targetUserId ? String(item.targetUserId) : null;
      const normalizedName = item.name ? item.name.toLowerCase().trim() : null;

      let extractedId = uid;
      if (!extractedId && item.conversationKey && item.conversationKey.startsWith("user-")) {
        const parts = item.conversationKey.split("-");
        if (parts.length === 3) {
          extractedId = (String(parts[1]) === String(currentUserId)) ? parts[2] : parts[1];
        }
      }

      if (extractedId && seenDirectUserIds.has(extractedId)) {
        const existing = deduplicated.find(d => String(d.targetUserId) === extractedId || (d.conversationKey && d.conversationKey.includes(`-${extractedId}`)));
        if (existing && !existing.chatRequest && item.chatRequest) {
          existing.chatRequest = item.chatRequest;
        }
        continue;
      }
      if (normalizedName && seenDirectNames.has(normalizedName)) {
        const existing = deduplicated.find(d => d.name?.toLowerCase().trim() === normalizedName);
        if (existing && !existing.chatRequest && item.chatRequest) {
          existing.chatRequest = item.chatRequest;
        }
        continue;
      }

      if (extractedId) seenDirectUserIds.add(extractedId);
      if (normalizedName) seenDirectNames.add(normalizedName);
      deduplicated.push(item);
    }
    return deduplicated;
  }, [currentUserId]);

  // Load all user conversations from database
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const rawConvs = await getMyConversations();
      
      const formatted = (Array.isArray(rawConvs) ? rawConvs : []).map((c) => {
        let avatarUrl = c.avatar;
        if (avatarUrl && !avatarUrl.startsWith("http")) {
          avatarUrl = getFullImageUrl(avatarUrl);
        }
        if (!avatarUrl) {
          avatarUrl = c.role === "Talent"
            ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        }

        const timeStr = c.lastMsgTime
          ? new Date(c.lastMsgTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Recently";

        return {
          id: c.id,
          conversationKey: c.conversationKey || c.id,
          targetUserId: c.targetUserId,
          bookingId: c.bookingId,
          opportunityId: c.opportunityId,
          name: c.name || "User",
          role: c.role || "User",
          company: c.company || "",
          email: c.email || "",
          phone: c.phone || "",
          avatar: avatarUrl,
          lastMsg: c.lastMsg || "Conversation started",
          time: timeStr,
          unread: c.unreadCount || 0,
          online: c.isOnline === true,
          bookingRequest: c.bookingRequest,
          accessRequest: c.accessRequest,
          chatRequest: c.chatRequest,
          booking: c.bookingRequest ? {
            id: `BMS-SH-${c.bookingRequest.id}`,
            project: c.bookingRequest.projectTitle,
            role: c.bookingRequest.projectType || "Shoot",
            cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150"
          } : null
        };
      });

      // Handle direct navigation state from opportunity cards or other pages
      const navState = location.state;
      let targetId = navState?.targetChatId;

      if (navState?.targetUser) {
        const tUser = navState.targetUser;
        const oppId = navState.opportunityId;
        const prospectiveKey = oppId ? `opp-${oppId}-${tUser.id}` : `user-${tUser.id}`;
        
        const existing = formatted.find(
          (c) => c.id === prospectiveKey || (c.targetUserId && String(c.targetUserId) === String(tUser.id))
        );

        if (existing) {
          targetId = existing.id;
        } else {
          // Add new prospective conversation at top
          let avatar = tUser.photo || tUser.avatar;
          if (avatar && !avatar.startsWith("http")) avatar = getFullImageUrl(avatar);
          if (!avatar) avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

          const newConv = {
            id: prospectiveKey,
            conversationKey: prospectiveKey,
            targetUserId: tUser.id,
            opportunityId: oppId,
            name: tUser.name || tUser.fullName || "Casting Director",
            role: tUser.role || "Casting Director",
            company: navState.opportunityTitle ? `Inquiry: ${navState.opportunityTitle}` : "Casting Call",
            email: tUser.email || "",
            phone: tUser.mobileNumber || "",
            avatar,
            lastMsg: navState.opportunityTitle
              ? `Inquiry regarding "${navState.opportunityTitle}"`
              : "Start a conversation",
            time: "Just now",
            unread: 0,
            online: false
          };

          formatted.unshift(newConv);
          targetId = prospectiveKey;
        }
      }

      const deduplicated = deduplicateConversations(formatted);
      const targetUserIds = deduplicated.map(c => c.targetUserId).filter(Boolean);
      if (targetUserIds.length > 0) {
        try {
          const batchOnline = await getBatchUserPresence(targetUserIds);
          deduplicated.forEach(c => {
            if (c.targetUserId && batchOnline[c.targetUserId] !== undefined) {
              c.online = Boolean(batchOnline[c.targetUserId]);
            }
          });
        } catch (e) {}
      }
      setConversations(deduplicated);
      const initialUnread = deduplicated.reduce((sum, c) => sum + (c.unread || 0), 0);
      window.dispatchEvent(new CustomEvent("messages_unread_count", { detail: initialUnread }));

      if (targetId) {
        setActiveChatId(targetId);
        setIsMobileChatOpen(true);
      } else if (deduplicated.length > 0 && !activeChatIdRef.current) {
        setActiveChatId(deduplicated[0].id);
      }
    } catch (err) {
      console.error("Failed to load user conversations from DB:", err);
    } finally {
      setLoading(false);
    }
  }, [location.state, deduplicateConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Silent background sync for conversation list & status updates without loading spinner
  const syncConversationsSilently = useCallback(async () => {
    if (isSyncingConvsRef.current) return;
    isSyncingConvsRef.current = true;
    try {
      const rawConvs = await getMyConversations();
      if (!Array.isArray(rawConvs)) return;

      const formatted = rawConvs.map((c) => {
        let avatarUrl = c.avatar;
        if (avatarUrl && !avatarUrl.startsWith("http")) {
          avatarUrl = getFullImageUrl(avatarUrl);
        }
        if (!avatarUrl) {
          avatarUrl = c.role === "Talent"
            ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        }

        const timeStr = c.lastMsgTime
          ? new Date(c.lastMsgTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Recently";

        return {
          id: c.id,
          conversationKey: c.conversationKey || c.id,
          targetUserId: c.targetUserId,
          bookingId: c.bookingId,
          opportunityId: c.opportunityId,
          name: c.name || "User",
          role: c.role || "User",
          company: c.company || "",
          email: c.email || "",
          phone: c.phone || "",
          avatar: avatarUrl,
          lastMsg: c.lastMsg || "Conversation started",
          time: timeStr,
          unread: c.unreadCount || 0,
          online: c.isOnline === true,
          bookingRequest: c.bookingRequest,
          accessRequest: c.accessRequest,
          chatRequest: c.chatRequest,
          booking: c.bookingRequest ? {
            id: `BMS-SH-${c.bookingRequest.id}`,
            project: c.bookingRequest.projectTitle,
            role: c.bookingRequest.projectType || "Shoot",
            cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150"
          } : null
        };
      });

      const deduplicated = deduplicateConversations(formatted);
      const targetUserIds = deduplicated.map(c => c.targetUserId).filter(Boolean);
      if (targetUserIds.length > 0) {
        try {
          const batchOnline = await getBatchUserPresence(targetUserIds);
          deduplicated.forEach(c => {
            if (c.targetUserId && batchOnline[c.targetUserId] !== undefined) {
              c.online = Boolean(batchOnline[c.targetUserId]);
            }
          });
        } catch (e) {}
      }

      setConversations((prev) => {
        const currentActiveId = activeChatIdRef.current;
        const currentConv = prev.find((p) => p.id === currentActiveId);

        // If currently viewing a chatreq-X or prospective chat that is now accepted and given a user-X-Y key, switch smoothly
        if (currentConv && currentConv.targetUserId) {
          const matchingNew = deduplicated.find(
            (f) => f.targetUserId && String(f.targetUserId) === String(currentConv.targetUserId)
          );
          if (matchingNew && matchingNew.id !== currentActiveId) {
            setActiveChatId(matchingNew.id);
          }
        }

        // Avoid triggering re-renders if list data has not changed
        if (prev.length === deduplicated.length) {
          let hasDiff = false;
          for (let i = 0; i < prev.length; i++) {
            const p = prev[i];
            const d = deduplicated[i];
            if (
              !p || !d ||
              p.id !== d.id ||
              p.lastMsg !== d.lastMsg ||
              p.time !== d.time ||
              p.unread !== d.unread ||
              p.chatRequest?.status !== d.chatRequest?.status ||
              p.chatRequest?.rawStatus !== d.chatRequest?.rawStatus
            ) {
              hasDiff = true;
              break;
            }
          }
          if (!hasDiff) {
            return prev;
          }
        }

        return deduplicated;
      });

      const totalUnread = deduplicated.reduce((sum, c) => sum + (c.unread || 0), 0);
      window.dispatchEvent(new CustomEvent("messages_unread_count", { detail: totalUnread }));
    } catch (err) {
      console.debug("Silent conversation sync error:", err);
    } finally {
      isSyncingConvsRef.current = false;
    }
  }, [deduplicateConversations]);

  // Fetch real messages for the active conversation thread
  const fetchThreadMessages = useCallback(async (threadKey) => {
    if (!threadKey) return;
    if (isFetchingThreadRef.current) return;
    isFetchingThreadRef.current = true;
    try {
      const serverMsgs = await getThreadMessages(threadKey);
      if (Array.isArray(serverMsgs)) {
        const currentChat = activeChatRef.current;
        const targetIdStr = currentChat?.targetUserId != null ? String(currentChat.targetUserId).trim() : "";
        const myIdStr = currentUserId != null ? String(currentUserId).trim() : "";

        const deletedForMeKey = `bms_deleted_for_me_${currentUserId}`;
        let deletedForMeSet = new Set();
        try {
          const parsed = JSON.parse(localStorage.getItem(deletedForMeKey) || "[]");
          if (Array.isArray(parsed)) deletedForMeSet = new Set(parsed);
        } catch (e) {}

        const activeServerMsgs = serverMsgs.filter((m) => !deletedForMeSet.has(m.id));

        const mapped = activeServerMsgs.map((m) => {
          const senderIdStr = m.senderId != null ? String(m.senderId).trim() : "";
          const isSystem = m.senderRole === "SYSTEM" || 
            (m.messageText && (
              m.messageText.includes("🤝 Connection accepted") ||
              m.messageText.includes("🤝 Chat request accepted") ||
              m.messageText.includes("🔌 Chat connection disconnected") ||
              m.messageText.includes("⚠️ Chat connection was disconnected") ||
              m.messageText.includes("🚫 User was blocked")
            ));

          let isMe = false;
          if (senderIdStr && targetIdStr) {
            isMe = (senderIdStr !== targetIdStr);
          } else if (senderIdStr && myIdStr) {
            isMe = (senderIdStr === myIdStr);
          } else if (m.senderEmail && currentUserEmail) {
            isMe = (m.senderEmail.toLowerCase() === currentUserEmail.toLowerCase());
          } else if (m.senderRole) {
            isMe = isProfessional ? m.senderRole === "PROFESSIONAL" : m.senderRole !== "PROFESSIONAL";
          }

          return {
            id: m.id,
            sender: isMe ? "me" : "them",
            isSystem,
            text: m.messageText,
            mediaUrl: m.mediaUrl,
            mediaType: m.mediaType,
            fileName: m.fileName,
            fileSize: m.fileSize,
            time: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just now",
            senderName: m.senderName
          };
        });

        // Only update chatMessages state if the message list actually changed (prevents re-render cycles & scroll jumps)
        const newSig = serverMsgs.map(m => `${m.id}-${m.createdAt}`).join("|");
        const prevSig = lastMsgSignatureRef.current[threadKey];

        if (prevSig !== newSig) {
          lastMsgSignatureRef.current[threadKey] = newSig;
          setChatMessages((prev) => {
            const existing = prev[threadKey] || [];
            const initialCards = existing.filter(msg => String(msg.id).startsWith("card-"));
            return {
              ...prev,
              [threadKey]: [...initialCards, ...mapped]
            };
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch thread messages:", e);
    } finally {
      isFetchingThreadRef.current = false;
    }
  }, [currentUserId, isProfessional, currentUserEmail]);

  const fetchThreadMessagesRef = useRef(fetchThreadMessages);
  useEffect(() => {
    fetchThreadMessagesRef.current = fetchThreadMessages;
  }, [fetchThreadMessages]);

  const syncConversationsSilentlyRef = useRef(syncConversationsSilently);
  useEffect(() => {
    syncConversationsSilentlyRef.current = syncConversationsSilently;
  }, [syncConversationsSilently]);

  // Initialize booking details card when an active chat with bookingRequest is selected
  useEffect(() => {
    if (!activeChatId) return;
    if (initializedCardsRef.current.has(activeChatId)) return;

    const conv = (conversationsRef.current || []).find(c => c.id === activeChatId);
    if (!conv) return;

    let cardAdded = false;

    if (conv.bookingRequest) {
      cardAdded = true;
      const b = conv.bookingRequest;
      const cardId = `card-book-${b.id}`;
      const detailText = `🎬 Shoot Booking Offer Details:\n• Project: ${b.projectTitle} (${b.projectType || "Shoot"})\n• Shoot Date: ${b.bookingDate || "To be discussed"}\n• Location: ${b.location || "TBD"}\n• Offered Rate: ${b.offeredRate ? "₹" + b.offeredRate : "Standard Rate"}\n\n${isProfessional ? "Your Note:" : "Director's Note:"}\n"${b.message || "We would love to book you for this shoot. Please review the offer and confirm availability!"}"`;

      setChatMessages((prev) => {
        const threadList = prev[activeChatId] || [];
        if (threadList.some(m => m.id === cardId)) return prev;
        return {
          ...prev,
          [activeChatId]: [
            {
              id: cardId,
              sender: isProfessional ? "me" : "them",
              text: detailText,
              time: b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today"
            },
            ...threadList
          ]
        };
      });
    }

    if (conv.accessRequest) {
      cardAdded = true;
      const req = conv.accessRequest;
      const cardId = `card-req-${req.id}`;
      setChatMessages((prev) => {
        const threadList = prev[activeChatId] || [];
        if (threadList.some(m => m.id === cardId)) return prev;
        return {
          ...prev,
          [activeChatId]: [
            {
              id: cardId,
              sender: "them",
              text: req.requesterMessage || "Hello! I would like to request access to view your private portfolio, photos, and audition showreels.",
              time: req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today"
            },
            ...threadList
          ]
        };
      });
    }

    if (cardAdded) {
      initializedCardsRef.current.add(activeChatId);
    }
  }, [activeChatId, isProfessional]);

  // Real-time live polling: update active thread and check request status dynamically every 4 seconds
  useEffect(() => {
    if (!activeChatId) return;

    // Fetch immediately on chat selection
    fetchThreadMessagesRef.current?.(activeChatId);

    const poll = async () => {
      if (document.hidden) return;
      if (Date.now() < pollBackoffRef.current) return;
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        await fetchThreadMessagesRef.current?.(activeChatId);

        // 1. Check live typing status for active thread
        try {
          const typingRes = await getThreadTypingStatus(activeChatId);
          const isTyping = Boolean(typingRes?.isTyping);
          setTypingMap((prev) => {
            if (prev[activeChatId] === isTyping) return prev;
            return { ...prev, [activeChatId]: isTyping };
          });
        } catch (ignored) {}

        const curr = activeChatRef.current;

        // 2. Check live presence of active conversation partner
        const targetPresenceId = resolveTargetUserId(curr?.targetUserId);
        if (targetPresenceId) {
          try {
            const presenceRes = await getUserPresence(targetPresenceId);
            const isTargetOnline = Boolean(presenceRes?.isOnline);
            setConversations((prev) => {
              const currentItem = prev.find((c) => c.id === activeChatId || (c.targetUserId && String(c.targetUserId) === String(targetPresenceId)));
              if (!currentItem || currentItem.online === isTargetOnline) return prev;
              return prev.map((c) => {
                if (c.id === activeChatId || (c.targetUserId && String(c.targetUserId) === String(targetPresenceId))) {
                  return { ...c, online: isTargetOnline };
                }
                return c;
              });
            });
          } catch (ignored) {}
        }

        // Check request status dynamically only if not already connected/accepted
        const currentReqStatus = (curr?.chatRequest?.status || "").toUpperCase();

        // Skip getChatRequestStatus if connection is already established (e.g. user-2-118 is already ACCEPTED)
        if (currentReqStatus !== "ACCEPTED") {
          const targetUserId = resolveTargetUserId(curr?.targetUserId);
          if (targetUserId) {
            const statusRes = await getChatRequestStatus(targetUserId);
            if (statusRes && statusRes.status) {
              const rawStatus = (statusRes.status || "").toUpperCase();
              let normalizedStatus = rawStatus;
              if (rawStatus === "OUTGOING_PENDING" || rawStatus === "INCOMING_PENDING") {
                normalizedStatus = "PENDING";
              } else if (rawStatus === "BLOCKED_BY_ME") {
                normalizedStatus = "BLOCKED";
              }

              const myIdStr = currentUserId ? String(currentUserId).trim() : "";
              const isMeRequester = rawStatus === "OUTGOING_PENDING" || 
                (curr?.chatRequest?.senderId && String(curr.chatRequest.senderId) === myIdStr);
              const isBlockedByMe = rawStatus === "BLOCKED_BY_ME" || 
                (rawStatus === "BLOCKED" && curr?.chatRequest?.senderId && String(curr.chatRequest.senderId) === myIdStr);

              setConversations((prev) => {
                const currentConv = prev.find(c => c.id === activeChatId || (c.targetUserId && String(c.targetUserId) === String(targetUserId)));
                if (!currentConv) return prev;

                const curStatus = (currentConv.chatRequest?.status || "NONE").toUpperCase();
                const curRaw = (currentConv.chatRequest?.rawStatus || curStatus).toUpperCase();
                if (curStatus === normalizedStatus && curRaw === rawStatus) {
                  return prev;
                }

                return prev.map((c) => {
                  if (c.id === activeChatId || (c.targetUserId && String(c.targetUserId) === String(targetUserId))) {
                    return {
                      ...c,
                      targetUserId: targetUserId,
                      chatRequest: {
                        ...(c.chatRequest || {}),
                        id: statusRes.requestId || c.chatRequest?.id,
                        status: normalizedStatus,
                        rawStatus: rawStatus,
                        senderId: isMeRequester ? currentUserId : targetUserId,
                        recipientId: isMeRequester ? targetUserId : currentUserId,
                        blockedByMe: isBlockedByMe,
                        message: statusRes.message || c.chatRequest?.message
                      }
                    };
                  }
                  return c;
                });
              });
            }
          }
        }
      } catch (e) {
        // Circuit breaker: back off polling for 8 seconds on network error
        pollBackoffRef.current = Date.now() + 8000;
      } finally {
        isPollingRef.current = false;
      }
    };

    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [activeChatId, currentUserId]);

  // Periodic silent sync for conversation list every 8 seconds
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (!document.hidden && Date.now() >= pollBackoffRef.current) {
        syncConversationsSilentlyRef.current?.();
      }
    }, 8000);
    return () => clearInterval(syncInterval);
  }, []);

  // Handle responding to peer chat connection request
  const handleRespondChatRequest = async (requestId, accepted) => {
    try {
      await respondToChatRequest(requestId, accepted);
      const newStatus = accepted ? "ACCEPTED" : "DECLINED";

      if (activeFilter === "requests") {
        setActiveFilter("all");
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.chatRequest && c.chatRequest.id === requestId) {
            return {
              ...c,
              lastMsg: accepted
                ? "🤝 Connection accepted! Say hi to your new connection."
                : "❌ Connection request declined",
              chatRequest: { ...c.chatRequest, status: newStatus },
              unread: 0
            };
          }
          return c;
        })
      );

      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const confirmationMsg = {
        id: `sys-${Date.now()}`,
        sender: "me",
        isSystem: true,
        text: accepted
          ? "🤝 You accepted this chat request! You can now freely message each other."
          : "❌ You declined this chat request.",
        time: timeString
      };

      if (activeChatId) {
        setChatMessages((prev) => ({
          ...prev,
          [activeChatId]: [...(prev[activeChatId] || []), confirmationMsg]
        }));
      }

      showSuccess(
        accepted ? "Chat Request Accepted! 🎉" : "Request Declined",
        accepted ? "You can now message each other in real-time." : "Chat request was declined."
      );
      syncConversationsSilently();
    } catch (err) {
      showError("Chat Action Failed", err.message || "Failed to respond to chat request.");
    }
  };

  // Helper to resolve target user ID even if not populated directly on activeChat
  const resolveTargetUserId = (targetUserId) => {
    const myIdStr = currentUserId ? String(currentUserId).trim() : "";

    // 1. If targetUserId is directly a valid numeric ID and not me
    if (targetUserId != null && !isNaN(Number(targetUserId)) && String(targetUserId).trim() !== myIdStr) {
      return Number(targetUserId);
    }

    // 2. If targetUserId is a string key like "user-X" or "user-X-Y"
    if (typeof targetUserId === "string" && targetUserId.startsWith("user-")) {
      const parts = targetUserId.split("-");
      if (parts.length === 3) {
        const id1 = String(parts[1]).trim();
        const id2 = String(parts[2]).trim();
        const otherId = (id1 === myIdStr) ? id2 : id1;
        if (!isNaN(Number(otherId))) return Number(otherId);
      } else if (parts.length === 2) {
        const otherId = String(parts[1]).trim();
        if (otherId !== myIdStr && !isNaN(Number(otherId))) return Number(otherId);
      }
    }

    // 3. From activeChat.targetUserId
    if (activeChat?.targetUserId != null && !isNaN(Number(activeChat.targetUserId)) && String(activeChat.targetUserId).trim() !== myIdStr) {
      return Number(activeChat.targetUserId);
    }

    // 4. From activeChat.chatRequest
    if (activeChat?.chatRequest) {
      const cr = activeChat.chatRequest;
      if (cr.senderId != null && String(cr.senderId).trim() !== myIdStr && !isNaN(Number(cr.senderId))) {
        return Number(cr.senderId);
      }
      if (cr.recipientId != null && String(cr.recipientId).trim() !== myIdStr && !isNaN(Number(cr.recipientId))) {
        return Number(cr.recipientId);
      }
    }

    // 5. From activeChat.bookingRequest
    if (activeChat?.bookingRequest) {
      const b = activeChat.bookingRequest;
      if (b.talentId != null && String(b.talentId).trim() !== myIdStr && !isNaN(Number(b.talentId))) {
        return Number(b.talentId);
      }
      if (b.professionalId != null && String(b.professionalId).trim() !== myIdStr && !isNaN(Number(b.professionalId))) {
        return Number(b.professionalId);
      }
    }

    // 6. From activeChat.accessRequest
    if (activeChat?.accessRequest) {
      const a = activeChat.accessRequest;
      if (a.requesterId != null && String(a.requesterId).trim() !== myIdStr && !isNaN(Number(a.requesterId))) {
        return Number(a.requesterId);
      }
      if (a.talentId != null && String(a.talentId).trim() !== myIdStr && !isNaN(Number(a.talentId))) {
        return Number(a.talentId);
      }
    }

    // 7. From activeChat conversationKey or id ("user-X-Y" or "user-X")
    const key = activeChat?.conversationKey || activeChat?.id;
    if (key && String(key).startsWith("user-")) {
      const parts = String(key).split("-");
      if (parts.length === 3) {
        const id1 = String(parts[1]).trim();
        const id2 = String(parts[2]).trim();
        const otherId = (id1 === myIdStr) ? id2 : id1;
        if (!isNaN(Number(otherId))) return Number(otherId);
      } else if (parts.length === 2) {
        const otherId = String(parts[1]).trim();
        if (otherId !== myIdStr && !isNaN(Number(otherId))) return Number(otherId);
      }
    }
    return null;
  };

  // Handle sending a new chat connection request (e.g. after cancel/disconnect or from chat window)
  const handleSendChatRequest = async (targetUserId, message = "") => {
    try {
      const targetId = resolveTargetUserId(targetUserId);
      if (!targetId) {
        showError("Request Failed", "Could not identify recipient to send chat request.");
        return;
      }

      const res = await sendChatRequest(targetId, message || "Hi! I would like to connect and chat with you.");

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId || (c.targetUserId && String(c.targetUserId) === String(targetId))) {
            return {
              ...c,
              targetUserId: targetId,
              lastMsg: "⏳ Chat request sent. Waiting for acceptance.",
              chatRequest: {
                id: res?.id,
                senderId: currentUserId,
                recipientId: targetId,
                status: "PENDING",
                rawStatus: "OUTGOING_PENDING",
                message: message || "Hi! I would like to connect and chat with you."
              }
            };
          }
          return c;
        })
      );

      showSuccess("Chat Request Sent! 📩", "Your connection request has been sent. You can message once accepted.");
      syncConversationsSilently();
    } catch (err) {
      showError("Request Failed", err.message || "Failed to send chat request.");
    }
  };

  // Handle cancelling pending chat request
  const handleCancelChatRequest = async (requestId) => {
    try {
      const targetReqId = requestId || activeChat?.chatRequest?.id;
      if (!targetReqId) return;

      await cancelChatRequest(targetReqId);

      if (activeFilter === "requests") {
        setActiveFilter("all");
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId || (c.chatRequest && c.chatRequest.id === targetReqId)) {
            return {
              ...c,
              lastMsg: "❌ Chat request cancelled",
              chatRequest: { status: "NONE", rawStatus: "NONE" }
            };
          }
          return c;
        })
      );

      showSuccess("Request Cancelled", "Your chat request has been cancelled.");
      syncConversationsSilently();
    } catch (err) {
      showError("Cancel Failed", err.message || "Failed to cancel chat request.");
    }
  };

  // Handle disconnecting active chat connection
  const handleDisconnectChat = async (targetUserId) => {
    try {
      const targetId = resolveTargetUserId(targetUserId);
      if (!targetId) {
        showError("Disconnect Failed", "Could not identify target contact to disconnect.");
        return;
      }

      await disconnectChat(targetId);

      if (activeFilter === "requests") {
        setActiveFilter("all");
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId || (c.targetUserId && String(c.targetUserId) === String(targetId))) {
            return {
              ...c,
              targetUserId: targetId,
              lastMsg: "🔌 Chat disconnected",
              chatRequest: { status: "NONE", rawStatus: "NONE" }
            };
          }
          return c;
        })
      );

      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const disconnectMsg = {
        id: `sys-${Date.now()}`,
        sender: "me",
        isSystem: true,
        text: "🔌 Chat connection disconnected. A new request must be approved to resume messaging.",
        time: timeString
      };

      if (activeChatId) {
        setChatMessages((prev) => ({
          ...prev,
          [activeChatId]: [...(prev[activeChatId] || []), disconnectMsg]
        }));
      }

      showSuccess("Chat Disconnected", "You have disconnected from this chat. You can send a new request anytime.");
      syncConversationsSilently();
    } catch (err) {
      showError("Disconnect Failed", err.message || "Failed to disconnect chat.");
    }
  };

  // Handle blocking a user
  const handleBlockUser = async (targetUserId) => {
    try {
      const targetId = resolveTargetUserId(targetUserId);
      if (!targetId) {
        showError("Block Failed", "Could not identify target contact to block.");
        return;
      }

      await blockUser(targetId);

      if (activeFilter === "requests") {
        setActiveFilter("all");
      }

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId || (c.targetUserId && String(c.targetUserId) === String(targetId))) {
            return {
              ...c,
              targetUserId: targetId,
              lastMsg: "🚫 User blocked",
              chatRequest: { status: "BLOCKED", rawStatus: "BLOCKED_BY_ME", blockedByMe: true, senderId: currentUserId }
            };
          }
          return c;
        })
      );

      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const blockMsg = {
        id: `sys-${Date.now()}`,
        sender: "me",
        isSystem: true,
        text: "🚫 You blocked this user. Messages cannot be sent or received.",
        time: timeString
      };

      if (activeChatId) {
        setChatMessages((prev) => ({
          ...prev,
          [activeChatId]: [...(prev[activeChatId] || []), blockMsg]
        }));
      }

      showSuccess("User Blocked 🚫", "This contact is now blocked. You will not receive messages from them.");
      syncConversationsSilently();
    } catch (err) {
      showError("Block Failed", err.message || "Failed to block user.");
    }
  };

  // Handle unblocking a user
  const handleUnblockUser = async (targetUserId) => {
    try {
      const targetId = resolveTargetUserId(targetUserId);
      if (!targetId) {
        showError("Unblock Failed", "Could not identify target contact to unblock.");
        return;
      }

      await unblockUser(targetId);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId || (c.targetUserId && String(c.targetUserId) === String(targetId))) {
            return {
              ...c,
              targetUserId: targetId,
              lastMsg: "User unblocked",
              chatRequest: { status: "NONE", rawStatus: "NONE", blockedByMe: false }
            };
          }
          return c;
        })
      );

      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const unblockMsg = {
        id: `sys-${Date.now()}`,
        sender: "me",
        isSystem: true,
        text: "User was unblocked. You can now send a connection request to chat.",
        time: timeString
      };

      if (activeChatId) {
        setChatMessages((prev) => ({
          ...prev,
          [activeChatId]: [...(prev[activeChatId] || []), unblockMsg]
        }));
      }

      showSuccess("User Unblocked 🎉", "This contact has been unblocked. You can now send a connection request to chat.");
      syncConversationsSilently();
    } catch (err) {
      showError("Unblock Failed", err.message || "Failed to unblock user.");
    }
  };

  // Handle responding to shoot booking request
  const handleRespondBookingRequest = async (bookingId, accepted) => {
    try {
      const statusString = accepted ? "ACCEPTED" : "DECLINED";
      await updateBookingRequestStatus(bookingId, statusString);
      const chatId = `book-${bookingId}`;

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMsg: accepted
                ? `✅ Shoot Confirmed: ${c.bookingRequest?.projectTitle || "Shoot"}`
                : `❌ Offer Declined: ${c.bookingRequest?.projectTitle || "Shoot"}`,
              bookingRequest: { ...c.bookingRequest, status: statusString }
            };
          }
          return c;
        })
      );

      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const confirmationMsg = {
        id: Date.now(),
        sender: "me",
        text: accepted
          ? `✅ You accepted this shoot booking offer! The shoot date has been automatically scheduled on your calendar.`
          : `❌ You declined this shoot offer.`,
        time: timeString
      };

      setChatMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), confirmationMsg]
      }));

      // Send to DB
      await sendThreadMessage(chatId, confirmationMsg.text, { bookingId });
      showSuccess(
        accepted ? "Booking Accepted! 🎉" : "Booking Declined",
        accepted ? "Shoot date has been confirmed on your schedule." : "Shoot booking offer was declined."
      );
    } catch (err) {
      showError("Booking Action Failed", err.message || "Failed to update booking status.");
    }
  };

  // Handle responding to profile access request
  const handleRespondAccessRequest = async (requestId, approved) => {
    try {
      await respondToProfileAccessRequest(requestId, approved);
      const newStatus = approved ? "APPROVED" : "REJECTED";
      const chatId = `req-${requestId}`;

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMsg: approved ? "✅ Profile access approved" : "❌ Profile access declined",
              accessRequest: { ...c.accessRequest, status: newStatus }
            };
          }
          return c;
        })
      );

      const timeString = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const confirmationMsg = {
        id: Date.now(),
        sender: "me",
        text: approved
          ? "✅ You approved access. This casting professional can now view your complete portfolio, photos, and showreels."
          : "❌ You declined this profile access request.",
        time: timeString
      };

      setChatMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), confirmationMsg]
      }));

      await sendThreadMessage(chatId, confirmationMsg.text);
      showSuccess("Access Request", `Profile access has been ${approved ? "Approved" : "Declined"}.`);
    } catch (err) {
      showError("Access Action Failed", err.message || "Failed to respond to request.");
    }
  };

  const handleChatSelect = (id) => {
    setActiveChatId(id);
    setIsMobileChatOpen(true);
    setIsSidebarOpen(false);
  };

  // Clear unread badge on selecting chat
  useEffect(() => {
    if (activeChatId) {
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === activeChatId ? { ...c, unread: 0 } : c));
        const totalUnread = next.reduce((sum, c) => sum + (c.unread || 0), 0);
        window.dispatchEvent(new CustomEvent("messages_unread_count", { detail: totalUnread }));
        return next;
      });
    }
  }, [activeChatId]);

  // Handle sending a message or media item - saved directly to database
  const handleSendMessage = async (content, mediaPayload = null) => {
    if (!activeChatId) return;

    let text = "";
    let mediaUrl = null;
    let mediaType = null;
    let fileName = null;
    let fileSize = null;
    let replyTo = null;

    if (typeof content === "string") {
      text = content.trim();
      if (mediaPayload) {
        mediaUrl = mediaPayload.mediaUrl;
        mediaType = mediaPayload.mediaType;
        fileName = mediaPayload.fileName;
        fileSize = mediaPayload.fileSize;
        replyTo = mediaPayload.replyTo;
      }
    } else if (content && typeof content === "object") {
      text = content.messageText || content.text || "";
      mediaUrl = content.mediaUrl;
      mediaType = content.mediaType;
      fileName = content.fileName;
      fileSize = content.fileSize;
      replyTo = content.replyTo;
    }

    if (!text && !mediaUrl) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const optimisticMsg = {
      id: `tmp-${Date.now()}`,
      sender: "me",
      text: text || fileName || "Shared media",
      mediaUrl,
      mediaType,
      fileName,
      fileSize,
      replyTo,
      time: timeString,
      read: true
    };

    setChatMessages((prev) => {
      const history = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: [...history, optimisticMsg]
      };
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              lastMsg: mediaType ? `📷 [${mediaType}] ${text || fileName || ""}` : text,
              time: timeString
            }
          : c
      )
    );

    try {
      await sendThreadMessage(activeChatId, {
        messageText: text,
        mediaUrl,
        mediaType,
        fileName,
        fileSize,
        recipientId: activeChat?.targetUserId,
        opportunityId: activeChat?.opportunityId,
        bookingId: activeChat?.bookingId
      });
      fetchThreadMessages(activeChatId);
    } catch (err) {
      console.error("Failed to send chat message to database:", err);
      showError("Message Failed", err.message || "Could not deliver message to database.");
    }
  };

  // Handle deleting a message from chat (Delete for me vs Delete for everyone)
  const handleDeleteMessage = async (chatId, messageId, mode = "everyone") => {
    try {
      if (mode === "me") {
        const deletedForMeKey = `bms_deleted_for_me_${currentUserId}`;
        try {
          const parsed = JSON.parse(localStorage.getItem(deletedForMeKey) || "[]");
          if (!parsed.includes(messageId)) {
            parsed.push(messageId);
            localStorage.setItem(deletedForMeKey, JSON.stringify(parsed));
          }
        } catch (e) {}

        setChatMessages((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter((m) => m.id !== messageId)
        }));
        showSuccess("Deleted for you", "The message has been removed from your chat view.");
      } else {
        setChatMessages((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter((m) => m.id !== messageId)
        }));

        if (typeof messageId === "number" || (typeof messageId === "string" && !messageId.startsWith("tmp-"))) {
          await deleteChatMessage(messageId).catch(() => {});
        }
        showSuccess("Message Deleted", "The message has been deleted for everyone.");
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // Handle uploading and sending file from local storage
  const handleUploadChatFile = async (file, caption = "") => {
    if (!activeChatId || !file) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let detectedType = "DOCUMENT";
    if (file.type.startsWith("image/")) detectedType = "IMAGE";
    else if (file.type.startsWith("video/")) detectedType = "VIDEO";
    else if (file.type.startsWith("audio/")) detectedType = "AUDIO";

    const localBlobUrl = URL.createObjectURL(file);
    const optimisticMsg = {
      id: `tmp-upload-${Date.now()}`,
      sender: "me",
      text: caption || file.name,
      mediaUrl: localBlobUrl,
      mediaType: detectedType,
      fileName: file.name,
      fileSize: file.size,
      time: timeString,
      isUploading: true
    };

    setChatMessages((prev) => {
      const history = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: [...history, optimisticMsg]
      };
    });

    try {
      await uploadChatMedia(activeChatId, file, caption, {
        recipientId: activeChat?.targetUserId,
        opportunityId: activeChat?.opportunityId,
        bookingId: activeChat?.bookingId
      });
      fetchThreadMessages(activeChatId);
    } catch (err) {
      console.error("Failed to upload chat file to server:", err);
      showError("Upload Failed", err.message || "Failed to upload file to chat.");
      fetchThreadMessages(activeChatId);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.lastMsg || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.role || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "unread") return c.unread > 0;
    if (activeFilter === "requests") {
      return (
        (c.chatRequest && c.chatRequest.status === "PENDING") ||
        (c.bookingRequest && c.bookingRequest.status === "PENDING") ||
        (c.accessRequest && c.accessRequest.status === "PENDING")
      );
    }
    return true;
  });

  const conversationsWithTyping = useMemo(() => {
    return filteredConversations.map((c) => ({
      ...c,
      isTyping: Boolean(typingMap[c.id] || typingMap[c.conversationKey]),
    }));
  }, [filteredConversations, typingMap]);

  const handleUserTyping = useCallback((isTyping) => {
    if (!activeChatId) return;
    setTypingStatus(activeChatId, isTyping);
  }, [activeChatId]);

  return (
    <AppLayout
      pageTitle="Messages"
      searchPlaceholder="Search messages..."
      showMessages={true}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="msg-page">
        {loading && conversations.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "70vh",
            color: "#64748b",
            gap: "12px"
          }}>
            <div style={{ fontSize: "36px", animation: "spin 1s linear infinite" }}>⏳</div>
            <p style={{ fontSize: "14px", fontWeight: "600" }}>Loading conversations from database...</p>
          </div>
        ) : (
          <div className={`msg-grid-layout ${isMobileChatOpen ? "mobile-chat-open" : ""} ${!isChatListOpen ? "hide-chatlist" : ""} ${!isRightSidebarOpen ? "hide-sidebar" : ""}`}>
            {/* Column 1: Chat List */}
            <ChatList
              conversations={conversationsWithTyping}
              allConversations={conversations}
              activeChatId={activeChatId}
              setActiveChatId={handleChatSelect}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              onDisconnectChat={handleDisconnectChat}
              onBlockUser={handleBlockUser}
              onToggleCollapse={() => setIsChatListOpen(false)}
            />

            {/* Column 2: Chat Window */}
            <ChatWindow
              activeChat={activeChat}
              messages={chatMessages[activeChatId] || []}
              conversations={conversations}
              onSendMessage={handleSendMessage}
              onUploadFile={handleUploadChatFile}
              onDeleteMessage={handleDeleteMessage}
              onBack={() => setIsMobileChatOpen(false)}
              isOtherUserTyping={Boolean(typingMap[activeChatId])}
              onTyping={handleUserTyping}
              isChatListOpen={isChatListOpen}
              onToggleChatList={() => setIsChatListOpen((prev) => !prev)}
              isRightSidebarOpen={isRightSidebarOpen}
              onToggleRightSidebar={() => {
                if (window.innerWidth <= 1024) {
                  setIsSidebarOpen((prev) => !prev);
                } else {
                  setIsRightSidebarOpen((prev) => !prev);
                }
              }}
              onOpenSidebar={() => {
                if (window.innerWidth <= 1024) {
                  setIsSidebarOpen(true);
                } else {
                  setIsRightSidebarOpen(true);
                }
              }}
              onRespondAccessRequest={handleRespondAccessRequest}
              onRespondBookingRequest={handleRespondBookingRequest}
              onRespondChatRequest={handleRespondChatRequest}
              onSendChatRequest={handleSendChatRequest}
              onCancelChatRequest={handleCancelChatRequest}
              onDisconnectChat={handleDisconnectChat}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
              currentUserId={currentUserId}
            />

            {/* Column 3: Contact Details Sidebar */}
            <ChatSidebar 
              activeChat={activeChat}
              onClose={() => setIsRightSidebarOpen(false)}
              onDisconnectChat={handleDisconnectChat}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
              onCancelChatRequest={handleCancelChatRequest}
              currentUserId={currentUserId}
            />
          </div>
        )}

        {/* Mobile Slide-in Contact Info Drawer */}
        {isSidebarOpen && (
          <div className="msg-sidebar-drawer-overlay" onClick={() => setIsSidebarOpen(false)}>
            <div className="msg-sidebar-drawer" onClick={(e) => e.stopPropagation()}>
              <ChatSidebar
                activeChat={activeChat}
                isDrawer={true}
                onClose={() => setIsSidebarOpen(false)}
                onDisconnectChat={handleDisconnectChat}
                onBlockUser={handleBlockUser}
                onUnblockUser={handleUnblockUser}
                onCancelChatRequest={handleCancelChatRequest}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
