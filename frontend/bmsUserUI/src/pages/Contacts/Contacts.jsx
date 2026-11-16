import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../Layout/AppLayout.jsx";
import ContactList from "./ContactList.jsx";
import ContactDetails from "./ContactDetails.jsx";
import ContactSidebar from "./ContactSidebar.jsx";
import { getMyContacts, toggleStarContact } from "../../features/bms/api";
import { Users, MessageSquare, UserPlus, Loader2 } from "lucide-react";
import "./contacts.css";
import "./contacts-mobile.css";

export default function Contacts() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeContactId, setActiveContactId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState("All Contacts");
  const [activeSubTab, setActiveSubTab] = useState("Overview");
  
  // Mobile navigation state: tracks whether detail screen is open
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  // Fetch real saved contacts from database
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getMyContacts();
      const list = Array.isArray(data) ? data : [];
      setContacts(list);
      if (list.length > 0) {
        setActiveContactId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0].id));
      } else {
        setActiveContactId(null);
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Sync details tab reset when switching contact
  useEffect(() => {
    setActiveSubTab("Overview");
  }, [activeContactId]);

  // Handle contact item click
  const handleSelectContact = (id) => {
    setActiveContactId(id);
    setIsMobileDetailsOpen(true);
  };

  // Toggle favorite / starred status in DB
  const handleToggleStar = async (id) => {
    const target = contacts.find((c) => c.id === id);
    if (!target) return;
    const targetUserId = target.userId || target.id;

    // Optimistic UI update
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );

    try {
      const updated = await toggleStarContact(targetUserId);
      if (updated && typeof updated.starred === "boolean") {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, starred: updated.starred } : c))
        );
      }
    } catch (err) {
      console.error("Failed to toggle star contact on server:", err);
    }
  };

  // Filters logic
  const filteredContacts = contacts.filter((contact) => {
    // 1. Top Category Tabs
    if (activeCategoryTab !== "All Contacts") {
      const mappedCategory = contact.category;
      if (mappedCategory !== activeCategoryTab) {
        return false;
      }
    }

    // 2. Search Box Filter
    const query = searchQuery.toLowerCase().trim();
    if (query !== "") {
      const matchName = (contact.name || "").toLowerCase().includes(query);
      const matchRole = (contact.role || "").toLowerCase().includes(query);
      const matchCompany = (contact.company || "").toLowerCase().includes(query);
      return matchName || matchRole || matchCompany;
    }

    return true;
  });

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0] || null;

  return (
    <AppLayout
      pageTitle="Contacts"
      subTitle="Manage your network and important connections."
      showMessages={true}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search contacts..."
    >
      <div className="contacts-page-container">
        {loading ? (
          <div className="contacts-loading-state">
            <Loader2 size={36} className="animate-spin text-pink-600" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ fontWeight: 600, fontSize: "14px" }}>Loading your saved contacts...</p>
          </div>
        ) : contacts.length === 0 ? (
          <div className="contacts-empty-fullpage">
            <div className="contacts-empty-card">
              <div className="contacts-empty-icon-wrap">
                <Users size={40} color="#ee008f" />
              </div>
              <h3>No Saved Contacts Yet</h3>
              <p>
                Your contacts list is empty. When you chat with talents, casting directors, and industry professionals in the <strong>Messages</strong> tab, click <strong>"Add to Contacts"</strong> to save them here for quick access.
              </p>
              <div className="contacts-empty-actions">
                <button
                  type="button"
                  className="contacts-empty-btn primary"
                  onClick={() => navigate("/messages")}
                >
                  <MessageSquare size={16} /> Go to Messages
                </button>
                <button
                  type="button"
                  className="contacts-empty-btn secondary"
                  onClick={() => navigate("/talents")}
                >
                  <UserPlus size={16} /> Discover Talents
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 3-Column main contacts workspace */
          <div className={`contacts-grid-layout ${isMobileDetailsOpen ? "mobile-details-active" : ""}`}>
            {/* Column 1: Contacts Directory Directory List */}
            <ContactList
              contacts={filteredContacts}
              activeContactId={activeContactId}
              onSelectContact={handleSelectContact}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleStar={handleToggleStar}
              activeCategory={activeCategoryTab}
              onSelectCategory={setActiveCategoryTab}
            />

            {/* Column 2: Selected Contact Profile Sheet */}
            <ContactDetails
              contact={activeContact}
              activeSubTab={activeSubTab}
              onSelectSubTab={setActiveSubTab}
              onBack={() => setIsMobileDetailsOpen(false)}
            />

            {/* Column 3: Contact Contextual Sidebar */}
            <ContactSidebar
              contact={activeContact}
              onToggleStar={handleToggleStar}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
