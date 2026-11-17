import PagesButton from "../common/PagesButton";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Star, ChevronDown, Pin, BellOff, Bell, Mail, UserMinus, Ban, Check, PanelLeftClose } from "lucide-react";
import Swal from "sweetalert2";

export default function ChatList({
  conversations,
  allConversations,
  activeChatId,
  setActiveChatId,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onDisconnectChat,
  onBlockUser,
  onToggleCollapse
}) {
  const [activeMenuConvId, setActiveMenuConvId] = useState(null);
  const [pinnedConvIds, setPinnedConvIds] = useState(new Set());
  const [mutedConvIds, setMutedConvIds] = useState(new Set());

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".msg-conv-dropdown-menu") && !e.target.closest(".msg-conv-chevron-btn")) {
        setActiveMenuConvId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChatClick = (id) => {
    setActiveChatId(id);
  };

  const togglePinConv = (id) => {
    setActiveMenuConvId(null);
    setPinnedConvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMuteConv = (id) => {
    setActiveMenuConvId(null);
    setMutedConvIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const badgeSource = allConversations || conversations;
  // Calculate unread totals for badges
  const totalUnread = badgeSource.reduce((acc, conv) => acc + (conv.unread || 0), 0);
  const totalRequests = badgeSource.filter(c => 
    (c.chatRequest && c.chatRequest.status === "PENDING") ||
    (c.bookingRequest && c.bookingRequest.status === "PENDING") ||
    (c.accessRequest && c.accessRequest.status === "PENDING")
  ).length;

  // Sort pinned conversations to the top
  const sortedConversations = [...conversations].sort((a, b) => {
    const aPin = pinnedConvIds.has(a.id);
    const bPin = pinnedConvIds.has(b.id);
    if (aPin && !bPin) return -1;
    if (!aPin && bPin) return 1;
    return 0;
  });

  return (
    <div className="msg-chat-list-panel">
      {/* Search and Filter Row */}
      <div className="msg-search-row">
        <div className="msg-search-input-wrapper">
          <Search size={16} className="msg-search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="msg-search-input"
          />
        </div>
        <PagesButton className="msg-filter-btn" title="Filters">
          <SlidersHorizontal size={16} />
        </PagesButton>
        {onToggleCollapse && (
          <PagesButton
            className="msg-filter-btn"
            title="Collapse chat list"
            onClick={onToggleCollapse}
          >
            <PanelLeftClose size={16} />
          </PagesButton>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="msg-filter-tabs">
        <PagesButton
          className={`msg-tab-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          All {totalUnread > 0 && <span className="msg-tab-badge">{totalUnread}</span>}
        </PagesButton>
        <PagesButton
          className={`msg-tab-btn ${activeFilter === "requests" ? "active" : ""}`}
          onClick={() => setActiveFilter("requests")}
        >
          Requests {totalRequests > 0 && <span className="msg-tab-badge" style={{ background: "#ec4899" }}>{totalRequests}</span>}
        </PagesButton>
        <PagesButton
          className={`msg-tab-btn ${activeFilter === "unread" ? "active" : ""}`}
          onClick={() => setActiveFilter("unread")}
        >
          Unread
        </PagesButton>
      </div>

      {/* Conversations Scroll List */}
      <div className="msg-conversations-list">
        {sortedConversations.map((conv) => {
          const isActive = conv.id === activeChatId;
          const isPinned = pinnedConvIds.has(conv.id);
          const isMuted = mutedConvIds.has(conv.id);

          return (
            <div
              key={conv.id}
              className={`msg-conv-item ${isActive ? "active" : ""}`}
              onClick={() => handleChatClick(conv.id)}
            >
              {/* Avatar Column */}
              <div className="msg-conv-avatar-wrap">
                <img src={conv.avatar} alt={conv.name} className="msg-conv-avatar" />
                {conv.online && <span className="msg-online-dot" />}
              </div>

              {/* Info Column */}
              <div className="msg-conv-info">
                <div className="msg-conv-name-row">
                  <span className="msg-conv-name">{conv.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {isPinned && <Pin size={11} color="#ec4899" />}
                    {isMuted && <BellOff size={11} color="#94a3b8" />}
                    <span className="msg-conv-time">{conv.time}</span>
                  </div>
                </div>

                <div className="msg-conv-meta-row">
                  <span className="msg-conv-role-company">
                    {conv.role}
                    {conv.company && ` · ${conv.company}`}
                  </span>
                  {conv.unread > 0 && (
                    <span className="msg-conv-unread-badge">{conv.unread}</span>
                  )}
                </div>

                <div className="msg-conv-preview-row">
                  {conv.isTyping ? (
                    <p className="msg-conv-preview" style={{ color: "#10b981", fontWeight: 700, fontStyle: "italic" }}>
                      typing...
                    </p>
                  ) : (
                    <p className="msg-conv-preview">{conv.lastMsg}</p>
                  )}
                  {conv.starred && (
                    <Star size={13} className="msg-star-icon filled" />
                  )}
                </div>
              </div>

              {/* WhatsApp Dropdown Chevron Button for Conversation */}
              <button
                type="button"
                className={`msg-conv-chevron-btn ${activeMenuConvId === conv.id ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuConvId((prev) => (prev === conv.id ? null : conv.id));
                }}
                title="Chat options"
              >
                <ChevronDown size={14} />
              </button>

              {/* WhatsApp Conversation Dropdown Menu */}
              {activeMenuConvId === conv.id && (
                <div
                  className="msg-conv-dropdown-menu"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: 40,
                    right: 12,
                    background: "#233138",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: 12,
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
                    zIndex: 60,
                    minWidth: 175,
                    padding: "6px 0",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <button
                    type="button"
                    className="wa-dropdown-item"
                    onClick={() => togglePinConv(conv.id)}
                  >
                    <Pin size={15} color="#94a3b8" />
                    <span>{isPinned ? "Unpin chat" : "Pin chat"}</span>
                  </button>

                  <button
                    type="button"
                    className="wa-dropdown-item"
                    onClick={() => toggleMuteConv(conv.id)}
                  >
                    {isMuted ? <Bell size={15} color="#94a3b8" /> : <BellOff size={15} color="#94a3b8" />}
                    <span>{isMuted ? "Unmute notifications" : "Mute notifications"}</span>
                  </button>

                  <button
                    type="button"
                    className="wa-dropdown-item"
                    onClick={() => {
                      setActiveMenuConvId(null);
                      conv.unread = conv.unread > 0 ? 0 : 1;
                    }}
                  >
                    <Mail size={15} color="#94a3b8" />
                    <span>{conv.unread > 0 ? "Mark as read" : "Mark as unread"}</span>
                  </button>

                  {onDisconnectChat && (
                    <>
                      <div className="wa-dropdown-divider" />
                      <button
                        type="button"
                        className="wa-dropdown-item delete"
                        onClick={async () => {
                          setActiveMenuConvId(null);
                          const result = await Swal.fire({
                            title: `Disconnect ${conv.name}?`,
                            html: `<div style="font-size: 14px; color: #475569; line-height: 1.5; margin-top: 6px;">
                              Are you sure you want to disconnect from <strong>${conv.name}</strong>?
                            </div>`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#e11d48",
                            cancelButtonColor: "#64748b",
                            confirmButtonText: "Yes, Disconnect",
                            cancelButtonText: "Cancel",
                            reverseButtons: true,
                            customClass: {
                              popup: "bms-swal-popup",
                              title: "bms-swal-title",
                              confirmButton: "bms-swal-btn-danger",
                              cancelButton: "bms-swal-btn-cancel"
                            }
                          });
                          if (result.isConfirmed) {
                            onDisconnectChat(conv.targetUserId || conv.id);
                          }
                        }}
                      >
                        <UserMinus size={15} color="#f87171" />
                        <span>Disconnect Chat</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sortedConversations.length === 0 && (
          <div className="msg-list-empty">
            No conversations found.
          </div>
        )}
      </div>

      {/* Load More Button */}
      <div className="msg-load-more-wrap">
        <PagesButton className="msg-load-more-btn">
          Load more conversations
          <svg
            style={{ width: "14px", height: "14px", marginLeft: "6px", flexShrink: 0 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </PagesButton>
      </div>
    </div>
  );
}
