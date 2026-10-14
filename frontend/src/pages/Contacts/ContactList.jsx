import PagesButton from "../common/PagesButton";
import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, ArrowUpDown, Star, ChevronDown, MoreVertical } from "lucide-react";

export default function ContactList({
  contacts,
  activeContactId,
  onSelectContact,
  searchQuery,
  onSearchChange,
  onToggleStar,
  activeCategory,
  onSelectCategory
}) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    "All Contacts",
    "Industry Professionals",
    "Agencies",
    "Casting Directors",
    "Co-stars",
    "Personal"
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="contact-list-column">
      {/* Search Input and Filter Icon */}
      <div className="contact-search-bar">
        <div className="contact-search-input-wrapper">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="contact-search-input"
          />
          <Search size={18} className="contact-search-icon" />
        </div>
        <PagesButton className="contact-filter-btn" aria-label="Filter options">
          <Filter size={18} />
        </PagesButton>
        
        {/* Category Dropdown Menu Trigger */}
        <div className="contact-more-menu-wrapper" ref={dropdownRef}>
          <PagesButton 
            className={`contact-more-btn ${showCategoryDropdown ? "active" : ""}`} 
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            aria-label="Filter by category"
          >
            <MoreVertical size={18} />
          </PagesButton>
          
          {showCategoryDropdown && (
            <div className="contact-category-dropdown">
              {categories.map((cat) => (
                <PagesButton
                  key={cat}
                  className={`contact-dropdown-item ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => {
                    onSelectCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                >
                  {cat}
                </PagesButton>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row showing list count and sort controls */}
      <div className="contact-list-meta">
        <span className="contact-list-count">
          All Contacts ({contacts.length})
        </span>
        <PagesButton className="contact-sort-btn" aria-label="Sort order">
          <ArrowUpDown size={16} />
        </PagesButton>
      </div>

      {/* List items */}
      <div className="contact-list-items scrollbar-custom">
        {contacts.length > 0 ? (
          contacts.map((contact) => {
            const isSelected = contact.id === activeContactId;
            const hasAvatar = !!contact.avatar;

            return (
              <div
                key={contact.id}
                className={`contact-item-card ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectContact(contact.id)}
              >
                <div className="contact-item-avatar-wrapper">
                  {hasAvatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="contact-item-avatar"
                    />
                  ) : (
                    <div className="contact-item-avatar-placeholder">
                      {contact.companyInfo?.logoText || contact.name.charAt(0)}
                    </div>
                  )}
                  {contact.online && <span className="contact-item-online-badge" />}
                </div>

                <div className="contact-item-info">
                  <h4 className="contact-item-name">{contact.name}</h4>
                  <span className="contact-item-role">{contact.role}</span>
                </div>

                <PagesButton
                  className={`contact-item-star-btn ${contact.starred ? "starred" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(contact.id);
                  }}
                  aria-label={contact.starred ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star size={18} className={contact.starred ? "fill-amber-400 text-amber-400" : "text-slate-400"} />
                </PagesButton>
              </div>
            );
          })
        ) : (
          <div className="contact-list-empty">No contacts found</div>
        )}

        {/* Load More Button */}
        {contacts.length > 0 && (
          <PagesButton className="contact-list-load-more-btn">
            Load More <ChevronDown size={16} />
          </PagesButton>
        )}
      </div>
    </div>
  );
}
