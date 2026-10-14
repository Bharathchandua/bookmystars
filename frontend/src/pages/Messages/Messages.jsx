import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../Layout/AppLayout.jsx";
import ChatList from "./ChatList.jsx";
import ChatWindow from "./ChatWindow.jsx";
import ChatSidebar from "./ChatSidebar.jsx";
import { CONVERSATIONS, INITIAL_MESSAGES } from "./messagesData.js";
import { 
  getProfileAccessRequests, 
  respondToProfileAccessRequest, 
  getIncomingBookingRequests, 
  getSentBookingRequests,
  updateBookingRequestStatus,
  getChatMessages,
  sendChatMessage,
  getStoredUser,
  getFullImageUrl 
} from "../../services/api";
import "./messages.css";
import "./messages-mobile.css";

export default function Messages() {
  const location = useLocation();
  const storedUser = getStoredUser();
  const isProfessional = (storedUser?.accountType || "").toUpperCase() === "PROFESSIONAL";

  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState(1);
  const [chatMessages, setChatMessages] = useState(INITIAL_MESSAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch real incoming & sent booking requests from database
  useEffect(() => {
    async function loadAllConversations() {
      try {
        let allNewConversations = [];
        let newChatMessages = {};

        if (isProfessional) {
          // 1. Casting Director: Sent Booking Requests
          const sentReqs = await getSentBookingRequests().catch((err) => {
            console.error("Failed to load sent bookings:", err);
            return [];
          });

          if (Array.isArray(sentReqs) && sentReqs.length > 0) {
            const formatted = sentReqs.map((b) => ({
              id: `book-${b.id}`,
              bookingId: b.id,
              name: b.talentName || "Talent",
              role: "Talent",
              company: b.projectTitle || "Shoot Booking",
              email: b.talentEmail || "",
              avatar: b.talentPhotoUrl
                ? getFullImageUrl(b.talentPhotoUrl)
                : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
              lastMsg: b.status === "PENDING"
                ? `⏳ Request Pending: ${b.projectTitle}`
                : b.status === "ACCEPTED"
                ? `✅ Offer Accepted: ${b.projectTitle}`
                : `❌ Offer Declined: ${b.projectTitle}`,
              time: b.createdAt
                ? new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Today",
              unread: b.status === "ACCEPTED" ? 1 : 0,
              online: true,
              bookingRequest: b,
              booking: {
                id: `BMS-SH-${b.id}`,
                project: b.projectTitle,
                role: b.projectType || "Shoot",
                cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150"
              }
            }));
            allNewConversations.push(...formatted);

            sentReqs.forEach((b) => {
              const cId = `book-${b.id}`;
              const detailText = `🎬 Shoot Booking Offer Details:\n• Project: ${b.projectTitle} (${b.projectType || "Shoot"})\n• Shoot Date: ${b.bookingDate || "To be discussed"}\n• Location: ${b.location || "TBD"}\n• Offered Rate: ${b.offeredRate ? "₹" + b.offeredRate : "Standard Rate"}\n\nYour Note to Talent:\n"${b.message || "We would love to book you for this shoot. Please review the offer and confirm availability!"}"`;

              newChatMessages[cId] = [
                {
                  id: `book-info-${b.id}`,
                  sender: "me",
                  text: detailText,
                  time: b.createdAt
                    ? new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Today"
                }
              ];
            });
          }
        } else {
          // 2. Talent: Incoming Booking Requests & Profile Access Requests
          const [accessReqs, bookingReqs] = await Promise.all([
            getProfileAccessRequests().catch((err) => {
              console.error("Failed to load access requests:", err);
              return [];
            }),
            getIncomingBookingRequests().catch((err) => {
              console.error("Failed to load booking requests:", err);
              return [];
            }),
          ]);

          if (Array.isArray(bookingReqs) && bookingReqs.length > 0) {
            const formattedBookings = bookingReqs.map((b) => ({
              id: `book-${b.id}`,
              bookingId: b.id,
              name: b.professionalName || b.professionalCompany || "Casting Director",
              role: "Casting Director",
              company: b.projectTitle || "Shoot Booking",
              email: b.professionalEmail || "director@bookmystars.com",
              phone: b.professionalMobile || "+91 98765 43210",
              avatar: b.professionalPhotoUrl
                ? getFullImageUrl(b.professionalPhotoUrl)
                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
              lastMsg: b.status === "PENDING"
                ? `🎬 Shoot Request: ${b.projectTitle}`
                : b.status === "ACCEPTED"
                ? `✅ Shoot Confirmed: ${b.projectTitle}`
                : `❌ Offer Declined: ${b.projectTitle}`,
              time: b.createdAt
                ? new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Today",
              unread: b.status === "PENDING" ? 1 : 0,
              online: true,
              bookingRequest: b,
              booking: {
                id: `BMS-SH-${b.id}`,
                project: b.projectTitle,
                role: b.projectType || "Shoot",
                cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=150"
              }
            }));
            allNewConversations.push(...formattedBookings);

            bookingReqs.forEach((b) => {
              const cId = `book-${b.id}`;
              const detailText = `🎬 Shoot Booking Offer Details:\n• Project: ${b.projectTitle} (${b.projectType || "Shoot"})\n• Shoot Date: ${b.bookingDate || "To be discussed"}\n• Location: ${b.location || "TBD"}\n• Offered Rate: ${b.offeredRate ? "₹" + b.offeredRate : "Standard Rate"}\n\nDirector's Message:\n"${b.message || "We would love to book you for this shoot. Please review the offer and confirm availability!"}"`;

              const threadMsgs = [
                {
                  id: `book-info-${b.id}`,
                  sender: "them",
                  text: detailText,
                  time: b.createdAt
                    ? new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "Today"
                }
              ];

              if (b.status === "ACCEPTED") {
                threadMsgs.push({
                  id: `book-acc-${b.id}`,
                  sender: "me",
                  text: `✅ You accepted this shoot booking for '${b.projectTitle}'. Shoot date (${b.bookingDate}) is confirmed on your schedule!`,
                  time: "Confirmed"
                });
              } else if (b.status === "DECLINED") {
                threadMsgs.push({
                  id: `book-dec-${b.id}`,
                  sender: "me",
                  text: `❌ You declined this shoot offer for '${b.projectTitle}'.`,
                  time: "Declined"
                });
              }

              newChatMessages[cId] = threadMsgs;
            });
          }

          if (Array.isArray(accessReqs) && accessReqs.length > 0) {
            const formattedAccess = accessReqs.map((req) => ({
              id: `req-${req.id}`,
              requestId: req.id,
              name: req.requesterName || "Casting Professional",
              role: req.requesterRole || "Casting Director",
              company: "Profile View Request",
              email: req.requesterEmail || "",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
              lastMsg: req.status === "PENDING"
                ? "🔒 Requested access to view your private portfolio"
                : req.status === "APPROVED"
                ? "✅ Profile access approved"
                : "❌ Profile access declined",
              time: req.createdAt
                ? new Date(req.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Today",
              unread: req.status === "PENDING" ? 1 : 0,
              online: true,
              accessRequest: req
            }));
            allNewConversations.push(...formattedAccess);

            accessReqs.forEach((req) => {
              const cId = `req-${req.id}`;
              if (!newChatMessages[cId]) {
                newChatMessages[cId] = [
                  {
                    id: `req-msg-${req.id}`,
                    sender: "them",
                    text: req.requesterMessage || "Hello! I would like to request access to view your private portfolio, photos, and audition showreels.",
                    time: req.createdAt
                      ? new Date(req.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Today"
                  }
                ];
              }
            });
          }
        }

        if (allNewConversations.length > 0) {
          setConversations((prev) => {
            const nonApiConvs = prev.filter(
              (c) => !String(c.id).startsWith("book-") && !String(c.id).startsWith("req-")
            );
            return [...allNewConversations, ...nonApiConvs];
          });

          setChatMessages((prev) => ({
            ...prev,
            ...newChatMessages
          }));

          // Target chat from navigation state (e.g. from Notification "Go to Chat")
          if (location.state?.targetChatId) {
            setActiveChatId(location.state.targetChatId);
            setIsMobileChatOpen(true);
          } else {
            setActiveChatId(allNewConversations[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load conversations in messages:", err);
      }
    }

    loadAllConversations();
  }, [isProfessional, location.state]);

  // Fetch real messages from database for the active booking chat
  const fetchRealChatMessages = useCallback(async (bId) => {
    if (!bId) return;
    try {
      const serverMsgs = await getChatMessages(bId);
      if (Array.isArray(serverMsgs)) {
        const currentUserId = storedUser?.userId || storedUser?.id;
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

        const conv = conversations.find((c) => String(c.id) === `book-${bId}`);
        const bookingReq = conv?.bookingRequest;
        const initialCardMsg = bookingReq ? [{
          id: `book-info-${bId}`,
          sender: isProfessional ? "me" : "them",
          text: `🎬 Shoot Booking Offer Details:\n• Project: ${bookingReq.projectTitle} (${bookingReq.projectType || "Shoot"})\n• Shoot Date: ${bookingReq.bookingDate || "To be discussed"}\n• Location: ${bookingReq.location || "TBD"}\n• Offered Rate: ${bookingReq.offeredRate ? "₹" + bookingReq.offeredRate : "Standard Rate"}\n\n${isProfessional ? "Your Note:" : "Director's Note:"}\n"${bookingReq.message || "We would love to book you for this shoot. Please review the offer and confirm availability!"}"`,
          time: bookingReq.createdAt ? new Date(bookingReq.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today"
        }] : [];

        setChatMessages((prev) => ({
          ...prev,
          [`book-${bId}`]: [...initialCardMsg, ...mapped]
        }));
      }
    } catch (e) {
      console.error("Failed to fetch live chat messages:", e);
    }
  }, [conversations, isProfessional, storedUser]);

  // Live polling: update active booking chat every 2.5 seconds
  useEffect(() => {
    if (activeChatId && String(activeChatId).startsWith("book-")) {
      const bId = String(activeChatId).replace("book-", "");
      fetchRealChatMessages(bId);
      const pollTimer = setInterval(() => {
        fetchRealChatMessages(bId);
      }, 2500);
      return () => clearInterval(pollTimer);
    }
  }, [activeChatId, fetchRealChatMessages]);

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
          ? `✅ You accepted this shoot booking offer! The shoot date has been automatically scheduled.`
          : `❌ You declined this shoot offer.`,
        time: timeString
      };

      setChatMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), confirmationMsg]
      }));
    } catch (err) {
      alert("Failed to update booking status: " + (err.message || "Network error"));
    }
  };

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
    } catch (err) {
      alert("Failed to respond to request: " + (err.message || "Network error"));
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

  // Handle message sending
  const handleSendMessage = async (text) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    const newMsg = {
      id: Date.now(),
      sender: "me",
      text,
      time: timeString,
      read: true
    };

    setChatMessages((prev) => {
      const chatHistory = prev[activeChatId] || [];
      return {
        ...prev,
        [activeChatId]: [...chatHistory, newMsg]
      };
    });

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId ? { ...c, lastMsg: text, time: timeString } : c
      )
    );

    // If this is a real shoot booking chat, save directly to backend database!
    if (String(activeChatId).startsWith("book-")) {
      const bId = String(activeChatId).replace("book-", "");
      try {
        await sendChatMessage(bId, text);
        fetchRealChatMessages(bId);
      } catch (err) {
        console.error("Failed to send chat message to server:", err);
      }
    } else {
      // Mock demo contacts simulation
      setTimeout(() => {
        const replyText = getMockReply(activeChat?.name || "User");
        const replyMsg = {
          id: Date.now() + 1,
          sender: "them",
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setChatMessages((prev) => {
          const chatHistory = prev[activeChatId] || [];
          return {
            ...prev,
            [activeChatId]: [...chatHistory, replyMsg]
          };
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, lastMsg: replyText, time: replyMsg.time }
              : c
          )
        );
      }, 1500);
    }
  };

  const getMockReply = (name) => {
    const replies = [
      `Thanks for writing back! I will coordinate with the team and update you shortly.`,
      `Sounds great. Let me check the schedule and get back to you by end of the day.`,
      `Perfect! I've received your updates and will forward them.`,
      `Awesome! I'll talk to our scheduling coordinator to block this slot.`,
      `Thank you for confirming, I'll send over the details soon.`
    ];
    const randomIndex = Math.floor(Math.random() * replies.length);
    return replies[randomIndex];
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "unread") return c.unread > 0;
    if (activeFilter === "starred") return c.starred;
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
