import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { Search, SlidersHorizontal, Star } from "lucide-react";

export default function ChatList({
  conversations,
  activeChatId,
  setActiveChatId,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter
}) {
  const handleChatClick = (id) => {
    setActiveChatId(id);
  };

  // Calculate unread totals for badges
  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unread, 0);

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
          className={`msg-tab-btn ${activeFilter === "unread" ? "active" : ""}`}
          onClick={() => setActiveFilter("unread")}
        >
          Unread {totalUnread > 0 && <span className="msg-tab-badge">{totalUnread}</span>}
        </PagesButton>
        <PagesButton
          className={`msg-tab-btn ${activeFilter === "starred" ? "active" : ""}`}
          onClick={() => setActiveFilter("starred")}
        >
          Starred
        </PagesButton>
      </div>

      {/* Conversations Scroll List */}
      <div className="msg-conversations-list">
        {conversations.map((conv) => {
          const isActive = conv.id === activeChatId;
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
                  <span className="msg-conv-time">{conv.time}</span>
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
                  <p className="msg-conv-preview">{conv.lastMsg}</p>
                  {conv.starred && (
                    <Star size={13} className="msg-star-icon filled" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {conversations.length === 0 && (
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
