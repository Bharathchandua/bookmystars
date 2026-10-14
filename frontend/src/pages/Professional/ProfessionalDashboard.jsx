/* ── ProfessionalDashboard.jsx ──────────────────────────────────
   Main Dashboard portal for Professionals (Casting Directors,
   Agencies, Production Houses). Includes KPI stat counters,
   Talents discovery tab, Casting Calls, Applications, and Profile.
   ────────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import { 
  Users, Megaphone, UserCheck, Sparkles, Building2, 
  BarChart3, RefreshCw, Briefcase, Plus 
} from "lucide-react";
import { getProfessionalStats, getStoredUser } from "../../services/api";
import TalentsTab from "./TalentsTab";
import CastingCallsTab from "./CastingCallsTab";
import ApplicantsReviewTab from "./ApplicantsReviewTab";
import AgencyProfileTab from "./AgencyProfileTab";
import AppLayout from "../Layout/AppLayout.jsx";
import "./professional.css";

export default function ProfessionalDashboard() {
  const storedUser = getStoredUser();
  const [activeTab, setActiveTab] = useState("talents");
  const [stats, setStats] = useState({
    totalCastingCalls: 0,
    activeCastingCalls: 0,
    totalApplicationsReceived: 0,
    shortlistedCandidates: 0,
    totalTalentsAvailable: 0,
  });
  const [selectedCastingIdForReview, setSelectedCastingIdForReview] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await getProfessionalStats();
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load professional stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSelectCastingForReview = (castingId) => {
    setSelectedCastingIdForReview(castingId);
    setActiveTab("applicants");
  };

  return (
    <AppLayout pageTitle="Professional Workspace" subTitle="Casting & Talent Management Portal">
      <div className="pro-dash-container">
        {/* Dashboard Header Banner */}
        <div className="pro-dash-banner">
          <div className="pro-dash-banner-left">
            <div className="pro-banner-badge">
              <Briefcase size={13} /> Professional Workspace
            </div>
            <h1>
              Welcome back, {storedUser?.fullName || "Director"}
            </h1>
            <p>
              Discover verified actors, models, and performers with live shoot availability, publish casting calls, and recruit top talents directly.
            </p>
          </div>

          <div className="pro-banner-actions">
            <button
              type="button"
              onClick={loadStats}
              className="pro-banner-btn-refresh"
              title="Refresh dashboard metrics"
            >
              <RefreshCw size={14} className={isLoadingStats ? "spin" : ""} />
              Refresh Metrics
            </button>
          </div>
        </div>

        {/* KPI Metric Cards Grid */}
        <div className="pro-kpi-grid">
          <div className="pro-kpi-card" onClick={() => setActiveTab("castings")}>
            <div className="pro-kpi-card-header">
              <span className="pro-kpi-card-label">Active Castings</span>
              <div className="pro-kpi-icon-badge pro-kpi-icon-badge--blue">
                <Megaphone size={20} />
              </div>
            </div>
            <div className="pro-kpi-card-value">{stats.activeCastingCalls}</div>
            <div className="pro-kpi-card-hint">{stats.totalCastingCalls} total audition calls posted</div>
          </div>

          <div className="pro-kpi-card" onClick={() => setActiveTab("applicants")}>
            <div className="pro-kpi-card-header">
              <span className="pro-kpi-card-label">Applications</span>
              <div className="pro-kpi-icon-badge pro-kpi-icon-badge--amber">
                <Users size={20} />
              </div>
            </div>
            <div className="pro-kpi-card-value">{stats.totalApplicationsReceived}</div>
            <div className="pro-kpi-card-hint">Audition candidate submissions</div>
          </div>

          <div className="pro-kpi-card" onClick={() => setActiveTab("applicants")}>
            <div className="pro-kpi-card-header">
              <span className="pro-kpi-card-label">Shortlisted</span>
              <div className="pro-kpi-icon-badge pro-kpi-icon-badge--green">
                <UserCheck size={20} />
              </div>
            </div>
            <div className="pro-kpi-card-value">{stats.shortlistedCandidates}</div>
            <div className="pro-kpi-card-hint">Candidates in active screening</div>
          </div>

          <div className="pro-kpi-card" onClick={() => setActiveTab("talents")}>
            <div className="pro-kpi-card-header">
              <span className="pro-kpi-card-label">Talent Pool</span>
              <div className="pro-kpi-icon-badge pro-kpi-icon-badge--purple">
                <Sparkles size={20} />
              </div>
            </div>
            <div className="pro-kpi-card-value">{stats.totalTalentsAvailable}</div>
            <div className="pro-kpi-card-hint">Verified registered talents in directory</div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="pro-tabs-bar">
          <button
            type="button"
            onClick={() => setActiveTab("talents")}
            className={`pro-tab-btn ${activeTab === "talents" ? "pro-tab-btn--active" : ""}`}
          >
            <Sparkles size={16} /> Talents Directory ({stats.totalTalentsAvailable})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("castings")}
            className={`pro-tab-btn ${activeTab === "castings" ? "pro-tab-btn--active" : ""}`}
          >
            <Megaphone size={16} /> Casting Calls ({stats.totalCastingCalls})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("applicants")}
            className={`pro-tab-btn ${activeTab === "applicants" ? "pro-tab-btn--active" : ""}`}
          >
            <Users size={16} /> Applications Review ({stats.totalApplicationsReceived})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pro-tab-btn ${activeTab === "profile" ? "pro-tab-btn--active" : ""}`}
          >
            <Building2 size={16} /> Agency Profile
          </button>
        </div>

      {/* Main Tab Panels */}
      <div>
        {activeTab === "talents" && <TalentsTab />}

        {activeTab === "castings" && (
          <CastingCallsTab onSelectCastingForReview={handleSelectCastingForReview} />
        )}

        {activeTab === "applicants" && (
          <ApplicantsReviewTab initialCastingId={selectedCastingIdForReview} />
        )}

        {activeTab === "profile" && <AgencyProfileTab />}
      </div>
    </div>
    </AppLayout>
  );
}
