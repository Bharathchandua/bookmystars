import PagesButton from "../common/PagesButton";
import { useState } from "react";
import AppLayout               from "../Layout/AppLayout.jsx";
import "./opportunities.css";
import "./opportunities-mobile.css";


import OpportunityHero         from "./OpportunityHero.jsx";
import OpportunityTabs         from "./OpportunityTabs.jsx";
import OpportunityFilters      from "./OpportunityFilters.jsx";
import OpportunityCards        from "./OpportunityCards.jsx";
import OpportunityDetailModal  from "./OpportunityDetailModal.jsx";
import OpportunityPagination   from "./OpportunityPagination.jsx";
import RecommendedOpportunities from "./RecommendedOpportunities.jsx";
import ApplicationStatsWidget  from "./ApplicationStatsWidget.jsx";
import AlertsWidget            from "./AlertsWidget.jsx";
import BoostProfileCard        from "./BoostProfileCard.jsx";import { ChevronDown, SlidersHorizontal } from "lucide-react";

export default function Opportunities() {
  const [activeTab,    setActiveTab]    = useState("All Opportunities");
  const [selectedOpp,  setSelectedOpp]  = useState(null);
  const [currentPage,  setCurrentPage]  = useState(1);

  const headerExtras = (
    <PagesButton className="db-header-filter-btn">
      <SlidersHorizontal size={16} />
      <span>Filters</span>
      <span className="db-header-filter-badge">2</span>
    </PagesButton>
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

              {/* ─── Tabs ────────────────────────── */}
              <OpportunityTabs activeTab={activeTab} setActiveTab={setActiveTab} />

              {/* ─── Filters ─────────────────────── */}
              <OpportunityFilters />

              {/* Results bar */}
              <div className="opp-results-bar">
                <span className="opp-results-found">128 Opportunities Found</span>
                <PagesButton className="opp-sort-btn">
                  Sort by: Newest First <ChevronDown size={14} />
                </PagesButton>
              </div>

              {/* Cards */}
              <OpportunityCards onOpenDetail={setSelectedOpp} />

              {/* Pagination */}
              <OpportunityPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={16}
              />
            </div>

            {/* ── Right Column ────────────── */}
            <div className="opp-right">
              <RecommendedOpportunities />
              <ApplicationStatsWidget />
              <AlertsWidget />
              <BoostProfileCard />
            </div>

          </div>
        </div>

      </div>

      {/* ─── Detail Modal ────────────────── */}
      {selectedOpp && (
        <OpportunityDetailModal
          opp={selectedOpp}
          onClose={() => setSelectedOpp(null)}
        />
      )}
    </AppLayout>
  );
}
