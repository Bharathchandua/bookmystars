import React, { useState, useEffect } from "react";
import AppLayout from "../Layout/AppLayout.jsx";
import ContactList from "./ContactList.jsx";
import ContactDetails from "./ContactDetails.jsx";
import ContactSidebar from "./ContactSidebar.jsx";
import { CONTACTS_DATA } from "./contactsData.js";
import "./contacts.css";
import "./contacts-mobile.css";


export default function Contacts() {
  const [contacts, setContacts] = useState(CONTACTS_DATA);
  const [activeContactId, setActiveContactId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState("All Contacts");
  const [activeSubTab, setActiveSubTab] = useState("Overview");
  
  // Mobile navigation state: tracks whether detail screen is open
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  // Sync details tab reset when switching contact
  useEffect(() => {
    setActiveSubTab("Overview");
  }, [activeContactId]);

  // Handle contact item click
  const handleSelectContact = (id) => {
    setActiveContactId(id);
    setIsMobileDetailsOpen(true);
  };

  // Toggle favorite / starred status
  const handleToggleStar = (id) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );
  };

  // Filters logic
  const filteredContacts = contacts.filter((contact) => {
    // 1. Top Category Tabs
    if (activeCategoryTab !== "All Contacts") {
      // If we select Casting Directors, filter where category matches "Casting Directors"
      // If we select Co-stars, we can match "Personal" or similar (for demo, allow filtering)
      const mappedCategory = contact.category;
      if (mappedCategory !== activeCategoryTab) {
        return false;
      }
    }

    // 2. Search Box Filter
    const query = searchQuery.toLowerCase().trim();
    if (query !== "") {
      const matchName = contact.name.toLowerCase().includes(query);
      const matchRole = contact.role.toLowerCase().includes(query);
      const matchCompany = contact.company.toLowerCase().includes(query);
      return matchName || matchRole || matchCompany;
    }

    return true;
  });

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

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
        {/* 3-Column main contacts workspace */}
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
      </div>
    </AppLayout>
  );
}
