import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../Layout/AppLayout.jsx";
import ChatList from "./ChatList.jsx";
import ChatWindow from "./ChatWindow.jsx";
import ChatSidebar from "./ChatSidebar.jsx";
import { 
  getMyConversations,
  getThreadMessages,
  sendThreadMessage,
  respondToProfileAccessRequest, 
  updateBookingRequestStatus,
  getStoredUser,
  getFullImageUrl 
} from "../../features/bms/api";
import { showSuccess, showError } from "../../shared/utils/alert";
import "./messages.css";
import "./messages-mobile.css";

export default function Messages() {
  const location = useLocation();
  const storedUser = getStoredUser();
  const currentUserId = storedUser?.userId || storedUser?.id;
  const isProfessional = (storedUser?.accountType || "").toUpperCase() === "PROFESSIONAL";

  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Keep a ref to activeChatId for live polling without re-creating interval
  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Load all user conversations from database
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const rawConvs = await getMyConversations();
      
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
          online: true,
          bookingRequest: c.bookingRequest,
          accessRequest: c.accessRequest,
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
            online: true
          };

          formatted.unshift(newConv);
          targetId = prospectiveKey;
        }
      }

      setConversations(formatted);

      if (targetId) {
        setActiveChatId(targetId);
        setIsMobileChatOpen(true);
      } else if (formatted.length > 0 && !activeChatIdRef.current) {
        setActiveChatId(formatted[0].id);
      }
    } catch (err) {
      console.error("Failed to load user conversations from DB:", err);
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Fetch real messages for the active conversation thread
  const fetchThreadMessages = useCallback(async (threadKey) => {
    if (!threadKey) return;
    try {
      const serverMsgs = await getThreadMessages(threadKey);
      if (Array.isArray(serverMsgs)) {
        const mapped = serverMsgs.map((m) => {
          const isMe = (currentUserId && m.senderId === currentUserId) ||
            (isProfessional && m.senderRole === "PROFESSIONAL") ||
            (!isProfessional && m.senderRole !== "PROFESSIONAL");
          return {
            id: m.id,
            sender: isMe ? "me" : "them",
            text: m.messageText,
            time: m.createdAt
              ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just now",
            senderName: m.senderName
          };
        });

        setChatMessages((prev) => {
          // If conversation has bookingRequest or accessRequest card, keep it at top if no DB card exists
          const existing = prev[threadKey] || [];
          const initialCards = existing.filter(msg => String(msg.id).startsWith("card-"));
          return {
            ...prev,
            [threadKey]: [...initialCards, ...mapped]
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch thread messages:", e);
    }
  }, [currentUserId, isProfessional]);

  // Initialize booking details card when an active chat with bookingRequest is selected
  useEffect(() => {
    if (!activeChatId) return;
    const conv = conversations.find(c => c.id === activeChatId);
    if (!conv) return;

    if (conv.bookingRequest) {
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

    fetchThreadMessages(activeChatId);
  }, [activeChatId, conversations, isProfessional, fetchThreadMessages]);

  // Real-time live polling: update active thread every 3 seconds stably
  useEffect(() => {
    if (!activeChatId) return;
    const interval = setInterval(() => {
      fetchThreadMessages(activeChatId);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChatId, fetchThreadMessages]);

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

  const activeChat = conversations.find((c) => c.id === activeChatId);

  // Clear unread badge on selecting chat
  useEffect(() => {
    if (activeChatId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeChatId ? { ...c, unread: 0 } : c))
      );
    }
  }, [activeChatId]);

  // Handle sending a message - saved directly to database!
  const handleSendMessage = async (text) => {
    if (!activeChatId || !text.trim()) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    const optimisticMsg = {
      id: `tmp-${Date.now()}`,
      sender: "me",
      text,
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
        c.id === activeChatId ? { ...c, lastMsg: text, time: timeString } : c
      )
    );

    try {
      await sendThreadMessage(activeChatId, text, {
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

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = (c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.lastMsg || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.role || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "unread") return c.unread > 0;
    return true;
  });

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
          <div className={`msg-grid-layout ${isMobileChatOpen ? "mobile-chat-open" : ""}`}>
            {/* Column 1: Chat List */}
            <ChatList
              conversations={filteredConversations}
              activeChatId={activeChatId}
              setActiveChatId={handleChatSelect}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />

            {/* Column 2: Chat Window */}
            <ChatWindow
              activeChat={activeChat}
              messages={chatMessages[activeChatId] || []}
              onSendMessage={handleSendMessage}
              onBack={() => setIsMobileChatOpen(false)}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onRespondAccessRequest={handleRespondAccessRequest}
              onRespondBookingRequest={handleRespondBookingRequest}
            />

            {/* Column 3: Contact Details Sidebar */}
            <ChatSidebar activeChat={activeChat} />
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
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
