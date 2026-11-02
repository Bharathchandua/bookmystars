import PagesButton from "../common/PagesButton";
import { useState, useEffect } from "react";
import AppLayout from "../Layout/AppLayout.jsx";
import "./opportunities.css";
import "./opportunities-mobile.css";

import OpportunityHero from "./OpportunityHero.jsx";
import OpportunityTabs from "./OpportunityTabs.jsx";
import OpportunityFilters from "./OpportunityFilters.jsx";
import OpportunityCards from "./OpportunityCards.jsx";
import OpportunityDetailModal from "./OpportunityDetailModal.jsx";
import OpportunityPagination from "./OpportunityPagination.jsx";
import RecommendedOpportunities from "./RecommendedOpportunities.jsx";
import ApplicationStatsWidget from "./ApplicationStatsWidget.jsx";
import AlertsWidget from "./AlertsWidget.jsx";
import BoostProfileCard from "./BoostProfileCard.jsx";
import PostOpportunityModal from "./PostOpportunityModal.jsx";
import { ChevronDown, SlidersHorizontal, Plus, List, LayoutGrid } from "lucide-react";
import {
  getPublicCastingCalls,
  getMyCastingCalls,
  getMyCastingApplications,
  getIncomingBookingRequests,
  updateBookingRequestStatus,
  getStoredUser,
} from "../../features/bms/api";
import { getPublicLanguages } from "../../features/bms/api/languages/languagesApi";
import { showSuccess, showError } from "../../shared/utils/alert";
import { onLiveSync } from "../../shared/utils/liveSync";

export default function Opportunities() {
  const [activeTab, setActiveTab] = useState("All Opportunities");
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPostModal, setShowPostModal] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"

  // User filters for discipline, language, location
  const [disciplineFilter, setDisciplineFilter] = useState("ALL");
  const [languageFilter, setLanguageFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // Dynamic DB state
  const [dbPublicOpps, setDbPublicOpps] = useState([]);
  const [myOpps, setMyOpps] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [directBookings, setDirectBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = getStoredUser();

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const [pubRes, myRes, appRes, directRes, langRes] = await Promise.all([
        getPublicCastingCalls().catch(() => []),
        getMyCastingCalls().catch(() => []),
        getMyCastingApplications().catch(() => []),
        getIncomingBookingRequests().catch(() => []),
        getPublicLanguages().catch(() => []),
      ]);
      setDbPublicOpps(Array.isArray(pubRes) ? pubRes : []);
      setMyOpps(Array.isArray(myRes) ? myRes : []);
      setMyApplications(Array.isArray(appRes) ? appRes : []);
      setDirectBookings(Array.isArray(directRes) ? directRes : []);
      if (Array.isArray(langRes) && langRes.length > 0) {
        setAvailableLanguages(langRes);
      }
    } catch (err) {
      console.warn("Error loading opportunities from database:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateBookingRequestStatus(bookingId, newStatus);
      showSuccess(
        newStatus === "ACCEPTED" ? "Booking Accepted! 🎉" : "Booking Declined",
        newStatus === "ACCEPTED"
          ? "You have accepted this booking invitation. The production director has been notified."
          : "You have declined this booking proposal."
      );
      await loadOpportunities();
    } catch (err) {
      showError("Update Failed", err.message || "Failed to update booking status.");
    }
  };

  useEffect(() => {
    loadOpportunities();

    const unsubscribe = onLiveSync(
      [
        "opportunity_created",
        "opportunity_updated",
        "opportunity_deleted",
        "opportunity_applied",
        "booking_request_updated",
        "auth_changed"
      ],
      () => {
        loadOpportunities();
      },
      { pollIntervalMs: 8000, triggerOnFocus: true }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter items based on activeTab - 100% Dynamic from Database
  const getFilteredOpportunities = () => {
    // Format incoming direct bookings as opportunities specifically targeted to this user
    const formattedDirectOpps = directBookings.map((req) => ({
      id: `booking-${req.id}`,
      rawBookingId: req.id,
      isDirectTargeted: true,
      title: req.projectTitle || "Direct Booking Request",
      type: req.projectType || "Direct Booking",
      projectType: req.projectType || "Direct Booking",
      badgeClass: "badge-feature-film",
      description: req.message || `Direct production offer from ${req.professionalName || "production director"} for ${req.projectTitle || "their upcoming project"}.`,
      location: req.location || "TBD",
      budget: req.offeredRate ? (req.offeredRate.toString().startsWith("₹") ? req.offeredRate : `₹ ${req.offeredRate}`) : "Negotiable",
      auditionDate: req.bookingDate || "Confirmed Dates",
      applicationDeadline: req.bookingDate || "Confirmed Dates",
      banner: req.professionalPhotoUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
      posterUrl: req.professionalPhotoUrl,
      directorName: req.professionalName || req.professionalCompany || "Production Director",
      directorEmail: req.professionalEmail,
      directorMobile: req.professionalMobile,
      directorCompany: req.professionalCompany,
      status: req.status || "PENDING",
      postedAgo: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Direct Invitation",
      createdAt: req.createdAt,
    }));

    // 1. Specifically For You tab
    if (activeTab === "Specifically For You") {
      return formattedDirectOpps;
    }

    // 2. My Posted Tab
    if (activeTab === "My Posted Opportunities") {
      return myOpps.map((opp) => ({
        ...opp,
        isMyPost: true,
        banner: opp.posterUrl || opp.banner,
        type: opp.projectType || opp.type || "Casting Call",
        auditionDate: opp.applicationDeadline || opp.shootStartDate || "Open",
      }));
    }

    // 3. Combine DB public posts + user's own posts
    const formattedMyPosts = myOpps.map((opp) => ({
      ...opp,
      isMyPost: true,
      banner: opp.posterUrl || opp.banner,
      type: opp.projectType || opp.type || "Casting Call",
      auditionDate: opp.applicationDeadline || opp.shootStartDate || "Open",
    }));

    const formattedPublicPosts = dbPublicOpps.map((opp) => ({
      ...opp,
      isMyPost: opp.postedByUserId === storedUser?.userId,
      banner: opp.posterUrl || opp.banner,
      type: opp.projectType || opp.type || "Casting Call",
      auditionDate: opp.applicationDeadline || opp.shootStartDate || "Open",
    }));

    // Filter out duplicates if my posts are already in public
    const allLiveItems = [...formattedMyPosts];
    formattedPublicPosts.forEach((p) => {
      if (!allLiveItems.some((item) => item.id === p.id)) {
        allLiveItems.push(p);
      }
    });

    const combined = allLiveItems;

    let result = combined;

    // Filter by specific subtabs
    if (activeTab === "Auditions") {
      result = combined.filter(
        (o) =>
          (o.type || "").toLowerCase().includes("audition") ||
          (o.projectType || "").toLowerCase().includes("film")
      );
    } else if (activeTab === "Casting Calls") {
      result = combined.filter(
        (o) =>
          (o.type || "").toLowerCase().includes("web series") ||
          (o.projectType || "").toLowerCase().includes("series")
      );
    } else if (activeTab === "Brand Collaborations") {
      result = combined.filter(
        (o) =>
          (o.type || "").toLowerCase().includes("commercial") ||
          (o.projectType || "").toLowerCase().includes("brand")
      );
    } else if (activeTab === "All Opportunities") {
      // For "All Opportunities": show pending direct targeted invitations prominently at the top!
      const pendingDirect = formattedDirectOpps.filter((d) => d.status === "PENDING");
      const otherDirect = formattedDirectOpps.filter((d) => d.status !== "PENDING");
      result = [...pendingDirect, ...combined, ...otherDirect];
    }

    // 1. Filter by Discipline (Acting, Singing, Dancing, Modeling, Crew)
    if (disciplineFilter !== "ALL") {
      result = result.filter((o) => (o.postType || "ACTING").toUpperCase() === disciplineFilter.toUpperCase());
    }

    // 2. Filter by Audition & Performance Language
    if (languageFilter !== "ALL") {
      const lq = languageFilter.toLowerCase().trim();
      result = result.filter((o) => (o.requiredLanguages || "").toLowerCase().includes(lq));
    }

    // 3. Filter by Shoot Location
    if (locationFilter !== "ALL") {
      const locQ = locationFilter.toLowerCase().trim();
      result = result.filter((o) => (o.location || "").toLowerCase().includes(locQ));
    }

    return result;
  };

  const displayedList = getFilteredOpportunities();

  const headerExtras = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {/* '+ Post Opportunity' Button in header */}
      <button
        type="button"
        onClick={() => setShowPostModal(true)}
        style={{
          background: "linear-gradient(135deg, #ee008f 0%, #7c3aed 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "10px",
          padding: "8px 16px",
          fontSize: "12.5px",
          fontWeight: "800",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(238, 0, 143, 0.3)",
          whiteSpace: "nowrap",
          transition: "transform 0.15s ease",
        }}
      >
        <Plus size={16} />
        <span>Post Opportunity</span>
      </button>

      <PagesButton className="db-header-filter-btn">
        <SlidersHorizontal size={16} />
        <span>Filters</span>
        <span className="db-header-filter-badge">2</span>
      </PagesButton>
    </div>
  );

  return (
    <AppLayout
      pageTitle="Opportunities"
      searchPlaceholder="Search opportunities..."
      headerExtras={headerExtras}
    >
      <div className="opp-page">
        {/* ─── Two-Column Layout ───────────── */}
        <div style={{ padding: "0" }}>
          <div className="opp-two-col" style={{ padding: "16px 0 0" }}>
            {/* ── Left Column ─────────────── */}
            <div className="opp-left">
              {/* ─── Hero ────────────────────────── */}
              <OpportunityHero />

              {/* ─── Tabs (With dynamic My Posted count) ────────── */}
              <OpportunityTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                myPostsCount={myOpps.length}
                directCount={directBookings.length}
              />

              {/* ─── Filters (Discipline, Languages, Locations) ─────────────────────── */}
              <OpportunityFilters
                disciplineFilter={disciplineFilter}
                onDisciplineChange={setDisciplineFilter}
                languageFilter={languageFilter}
                onLanguageChange={setLanguageFilter}
                availableLanguages={availableLanguages}
                locationFilter={locationFilter}
                onLocationChange={setLocationFilter}
                onClearFilters={() => {
                  setDisciplineFilter("ALL");
                  setLanguageFilter("ALL");
                  setLocationFilter("ALL");
                }}
              />

              {/* Results bar */}
              <div className="opp-results-bar">
                <span className="opp-results-found">
                  {displayedList.length} Opportunities{" "}
                  {activeTab === "My Posted Opportunities"
                    ? "Created by You"
                    : activeTab === "Specifically For You"
                    ? "Directly For You"
                    : "Found in Database"}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Segmented View Mode Switcher (Pill Toggle) */}
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#f1f5f9",
                    padding: "3px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0"
                  }}>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      title="List view"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5px 9px",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: viewMode === "list" ? "#ffffff" : "transparent",
                        color: viewMode === "list" ? "#0f172a" : "#64748b",
                        boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <List size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      title="Grid view"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5px 9px",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: viewMode === "grid" ? "#ffffff" : "transparent",
                        color: viewMode === "grid" ? "#0f172a" : "#64748b",
                        boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <LayoutGrid size={15} />
                    </button>
                  </div>

                  <PagesButton className="opp-sort-btn">
                    Sort by: Newest First <ChevronDown size={14} />
                  </PagesButton>
                </div>
              </div>

              {/* Cards (100% Dynamic Data from DB) */}
              <OpportunityCards
                items={displayedList}
                onOpenDetail={setSelectedOpp}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                viewMode={viewMode}
              />

              {/* Pagination */}
              <OpportunityPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={Math.max(1, Math.ceil(displayedList.length / 8))}
              />
            </div>

            {/* ── Right Column (100% Dynamic Widgets) ────────────── */}
            <div className="opp-right">
              <RecommendedOpportunities
                opportunities={dbPublicOpps}
                onOpenDetail={setSelectedOpp}
              />
              <ApplicationStatsWidget applications={myApplications} />
              <AlertsWidget
                opportunities={dbPublicOpps}
                applications={myApplications}
              />
              <BoostProfileCard />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Detail Modal (With Video Player & Real Audition Submission) ─── */}
      {selectedOpp && (
        <OpportunityDetailModal
          opp={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onUpdateBookingStatus={handleUpdateBookingStatus}
        />
      )}

      {/* ─── Post Opportunity Modal (With Video Upload) ────── */}
      {showPostModal && (
        <PostOpportunityModal
          onClose={() => setShowPostModal(false)}
          onCreated={(newOpp) => {
            loadOpportunities();
            setActiveTab("My Posted Opportunities");
          }}
        />
      )}
    </AppLayout>
  );
}
