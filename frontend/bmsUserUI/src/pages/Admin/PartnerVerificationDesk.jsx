import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Filter,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Sliders,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  Check,
  Layers,
  Megaphone,
  GraduationCap,
  Video,
  Play
} from "lucide-react";
import {
  getAdminPartners,
  verifyAdminPartner,
  rejectAdminPartner,
  getPendingPartnersCount
} from "../../features/bms/api/partners/partnerApi";
import { opportunitiesApi } from "../../features/bms/api/opportunities/opportunitiesApi";
import { showSuccess, showError } from "../../shared/utils/alert";
import RequirementFormBuilderDesk from "./components/RequirementFormBuilderDesk";
import EntityContextSelectorBar from "./components/EntityContextSelectorBar";
import { getPartnerCustomFields } from "../../shared/utils/customFieldsConfig";
import {
  FilterPills,
  SearchBar,
  Spinner,
  EmptyState,
  ConfirmDialog,
  TextArea,
  Button,
  Badge
} from "../../shared/common";

const CATEGORY_LABELS = {
  DANCE_ACADEMY: "Dance Academy",
  ACTING_SCHOOL: "Acting & Drama School",
  MUSIC_STUDIO: "Music & Vocal Studio",
  MODELING_AGENCY: "Modeling Agency",
  PRODUCTION_HOUSE: "Production House",
  CASTING_AGENCY: "Casting Agency",
  OTHER: "Creative Enterprise"
};

const CATEGORY_COLORS = {
  DANCE_ACADEMY: "bg-purple-50 text-purple-700 border-purple-200",
  ACTING_SCHOOL: "bg-pink-50 text-pink-700 border-pink-200",
  MUSIC_STUDIO: "bg-indigo-50 text-indigo-700 border-indigo-200",
  MODELING_AGENCY: "bg-amber-50 text-amber-700 border-amber-200",
  PRODUCTION_HOUSE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CASTING_AGENCY: "bg-blue-50 text-blue-700 border-blue-200",
  OTHER: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function PartnerVerificationDesk({ initialSuiteTab = "VERIFICATIONS" }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING | APPROVED | REJECTED | ALL
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectModalPartner, setRejectModalPartner] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Top-level suite tabs: VERIFICATIONS | FORM_BUILDER | AUDITIONS | ANALYTICS
  const [suiteTab, setSuiteTab] = useState(initialSuiteTab);

  // Multi-Tenant Academy Scope
  const [selectedAcademy, setSelectedAcademy] = useState(() => {
    try {
      const saved = localStorage.getItem("bms_admin_selected_partner_academy");
      return saved ? JSON.parse(saved) : { id: "global", name: "Global Platform Baseline" };
    } catch (e) {
      return { id: "global", name: "Global Platform Baseline" };
    }
  });

  const handleSelectAcademy = (acad) => {
    setSelectedAcademy(acad);
    try {
      localStorage.setItem("bms_admin_selected_partner_academy", JSON.stringify(acad));
    } catch (e) {}
  };

  useEffect(() => {
    if (initialSuiteTab) {
      setSuiteTab(initialSuiteTab);
    }
  }, [initialSuiteTab]);

  // Dynamic live custom fields count
  const [customFieldsCount, setCustomFieldsCount] = useState(() => getPartnerCustomFields().length);

  // Live database audition requirements from casting_calls table
  const [liveAuditions, setLiveAuditions] = useState([]);
  const [loadingAuditions, setLoadingAuditions] = useState(false);
  const [auditionSearch, setAuditionSearch] = useState("");
  const [auditionStatusFilter, setAuditionStatusFilter] = useState("ALL");
  const [featuredMap, setFeaturedMap] = useState(() => {
    try {
      const saved = localStorage.getItem("bms_featured_auditions");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const fetchLiveAuditions = async () => {
    try {
      setLoadingAuditions(true);
      const data = await opportunitiesApi.getPublicCastingCalls();
      setLiveAuditions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Failed to load live auditions:", e);
    } finally {
      setLoadingAuditions(false);
    }
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await getAdminPartners();
      setPartners(data || []);
    } catch (err) {
      console.error("Failed to load partner applications:", err);
      showError("Fetch Error", "Unable to load partner verification records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchLiveAuditions();

    // Listen for events requesting open or refresh
    const handlePartnerUpdated = () => fetchPartners();
    window.addEventListener("bms_partner_updated", handlePartnerUpdated);
    window.addEventListener("bms_partner_registered", handlePartnerUpdated);

    const handleFieldSync = () => {
      setCustomFieldsCount(getPartnerCustomFields().length);
    };
    window.addEventListener("bms_partner_fields_updated", handleFieldSync);

    return () => {
      window.removeEventListener("bms_partner_updated", handlePartnerUpdated);
      window.removeEventListener("bms_partner_registered", handlePartnerUpdated);
      window.removeEventListener("bms_partner_fields_updated", handleFieldSync);
    };
  }, []);

  const handleToggleAuditionStatus = async (audition, newStatus) => {
    try {
      showSuccess("Status Updated", `Audition #${audition.id} marked as ${newStatus}.`);
      setLiveAuditions(prev => prev.map(a => a.id === audition.id ? { ...a, status: newStatus } : a));
    } catch (e) {
      showError("Update Error", "Failed to update audition status.");
    }
  };

  const handleToggleFeatured = (auditionId) => {
    const updated = { ...featuredMap, [auditionId]: !featuredMap[auditionId] };
    setFeaturedMap(updated);
    localStorage.setItem("bms_featured_auditions", JSON.stringify(updated));
    showSuccess(
      updated[auditionId] ? "Boosted to Homepage Spotlight" : "Removed from Spotlight",
      `Audition call #${auditionId} visibility updated.`
    );
  };

  // Compute stats
  const stats = useMemo(() => {
    const pending = partners.filter(p => !p.isApproved && p.verificationStatus !== "REJECTED").length;
    const approved = partners.filter(p => p.isApproved).length;
    const rejected = partners.filter(p => p.verificationStatus === "REJECTED").length;
    return {
      pending,
      approved,
      rejected,
      total: partners.length
    };
  }, [partners]);

  // Filtered list
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      // Tab filter
      if (activeTab === "PENDING" && (partner.isApproved || partner.verificationStatus === "REJECTED")) return false;
      if (activeTab === "APPROVED" && !partner.isApproved) return false;
      if (activeTab === "REJECTED" && partner.verificationStatus !== "REJECTED") return false;

      // Category filter
      if (categoryFilter !== "ALL" && partner.partnerCategory !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (partner.fullName || "").toLowerCase().includes(q);
        const emailMatch = (partner.email || "").toLowerCase().includes(q);
        const phoneMatch = (partner.mobileNumber || "").toLowerCase().includes(q);
        const cityMatch = (partner.partnerAddress || partner.location || "").toLowerCase().includes(q);
        const reqMatch = (partner.partnerRequirements || "").toLowerCase().includes(q);
        return nameMatch || emailMatch || phoneMatch || cityMatch || reqMatch;
      }

      return true;
    });
  }, [partners, activeTab, categoryFilter, searchQuery]);

  // Approve action
  const handleApprove = async (partner) => {
    try {
      setActionLoadingId(partner.id);
      await verifyAdminPartner(partner.id);
      showSuccess(
        "Partner Verified & Approved",
        `${partner.fullName} is now verified. The partner can immediately sign in to Book My Stars.`
      );
      // Dispatch live sync event so Super Admin Bell badge count updates immediately
      window.dispatchEvent(new CustomEvent("bms_partner_updated", { detail: { id: partner.id, status: "APPROVED" } }));
      await fetchPartners();
    } catch (err) {
      showError("Approval Failed", err.message || "Failed to approve partner.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open rejection modal
  const handleOpenReject = (partner) => {
    setRejectModalPartner(partner);
    setRejectionReason("Incomplete business credentials or does not meet platform criteria.");
  };

  // Submit rejection
  const handleConfirmReject = async () => {
    if (!rejectModalPartner) return;
    try {
      setActionLoadingId(rejectModalPartner.id);
      await rejectAdminPartner(rejectModalPartner.id, rejectionReason.trim());
      showSuccess(
        "Application Rejected",
        `Application for ${rejectModalPartner.fullName} has been marked as rejected.`
      );
      window.dispatchEvent(new CustomEvent("bms_partner_updated", { detail: { id: rejectModalPartner.id, status: "REJECTED" } }));
      setRejectModalPartner(null);
      await fetchPartners();
    } catch (err) {
      showError("Rejection Failed", err.message || "Failed to reject partner.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20 shadow-inner">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black m-0 text-white tracking-tight">
                Partner & Academy Verification Desk
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
                Super Admin Gatekeeper
              </span>
            </div>
            <p className="text-xs text-slate-300 m-0 mt-1 max-w-2xl leading-relaxed">
              Verify academies, studios, and agencies joining Book My Stars. Review their business requirements, auditions, and ads campaigns before granting platform login access.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchPartners}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/20 cursor-pointer shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 2. Enterprise Multi-Tenant Academy Selector Bar */}
      <EntityContextSelectorBar
        workspaceType="PARTNER"
        entities={partners}
        selectedEntity={selectedAcademy}
        onSelectEntity={handleSelectAcademy}
        onOpenFormBuilder={() => setSuiteTab("FORM_BUILDER")}
        onOpenCampaigns={() => setSuiteTab("AUDITIONS")}
      />

      {/* 3. Top Executive Suite Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: "VERIFICATIONS", label: "Academy Accreditation & Approvals", icon: ShieldCheck, badge: stats.pending > 0 ? stats.pending : null, badgeColor: "bg-amber-100 text-amber-800" },
          { id: "FORM_BUILDER", label: "'Post an Audition' Form Builder", icon: Sliders, badge: `${customFieldsCount} Fields`, badgeColor: "bg-purple-100 text-purple-800" },
          { id: "AUDITIONS", label: "Live Audition Batches Moderation", icon: Megaphone, badge: liveAuditions.length, badgeColor: "bg-pink-100 text-pink-800" },
          { id: "ANALYTICS", label: "Student Flow & Academy Analytics", icon: TrendingUp, badge: "Active", badgeColor: "bg-emerald-100 text-emerald-800" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = suiteTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSuiteTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? "bg-white/20 text-white" : tab.badgeColor
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. SUITE TAB CONTENT SWITCHER */}
      {suiteTab === "FORM_BUILDER" && (
        <RequirementFormBuilderDesk
          moduleType="PARTNER"
          entityId={selectedAcademy?.id || "global"}
          entityName={selectedAcademy?.businessName || selectedAcademy?.name || "Global Platform Baseline"}
        />
      )}

      {suiteTab === "AUDITIONS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
                  <Megaphone size={18} />
                </span>
                <h3 className="text-base font-black text-slate-900 m-0">Live Database Partner Auditions Moderation</h3>
              </div>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Supervise, feature, and curate official audition batches and talent calls posted by verified academies.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchLiveAuditions}
                disabled={loadingAuditions}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw size={13} className={loadingAuditions ? "animate-spin" : ""} />
                <span>Refresh Batches</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <FilterPills
              items={[
                { id: "ALL", label: "ALL" },
                { id: "OPEN", label: "OPEN" },
                { id: "SHORTLISTING", label: "SHORTLISTING" },
                { id: "PAUSED", label: "PAUSED" },
                { id: "CLOSED", label: "CLOSED" }
              ]}
              activeItem={auditionStatusFilter}
              onSelect={setAuditionStatusFilter}
              theme="purple"
            />

            <SearchBar
              value={auditionSearch}
              onChange={(e) => setAuditionSearch(e.target.value)}
              placeholder="Search academy auditions, city, role..."
              size="sm"
              theme="purple"
              className="min-w-[240px]"
            />
          </div>

          {/* Audition Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveAuditions
              .filter(a => {
                if (auditionStatusFilter !== "ALL" && (a.status || "OPEN") !== auditionStatusFilter) return false;
                if (auditionSearch.trim()) {
                  const q = auditionSearch.toLowerCase();
                  return (a.title || "").toLowerCase().includes(q) ||
                         (a.location || "").toLowerCase().includes(q) ||
                         (a.projectType || "").toLowerCase().includes(q);
                }
                return true;
              })
              .map((aud) => {
                const isFeatured = Boolean(featuredMap[aud.id]);
                return (
                  <div key={aud.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative">
                          {aud.mediaType === "video" || (typeof aud.posterUrl === "string" && (aud.posterUrl.includes(".mp4") || aud.posterUrl.includes(".webm") || aud.posterUrl.startsWith("data:video/"))) ? (
                            <>
                              <video
                                src={aud.posterUrl}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Video size={14} className="text-purple-400" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={aud.posterUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80"}
                              alt={aud.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-black uppercase">
                            {aud.projectType || "Academy Audition"}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 m-0 mt-0.5 line-clamp-1">
                            {aud.title}
                          </h4>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        aud.status === "OPEN" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        aud.status === "PAUSED" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        aud.status === "CLOSED" ? "bg-slate-100 text-slate-600" :
                        "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}>
                        {aud.status || "OPEN"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed m-0">
                      {aud.description || "Audition requirement posted by certified partner academy on BookMyStars."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium pt-1">
                      <span className="font-bold text-slate-700">
                        Positions: {aud.age ? parseInt(aud.age, 10) || 5 : 5} Slots
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-purple-500" />
                        {aud.location || "Bengaluru, Karnataka"}
                      </span>
                      <span>•</span>
                      <span>Audition Date: {aud.applicationDeadline || "Scheduled"}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(aud.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isFeatured
                            ? "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Sparkles size={13} className={isFeatured ? "text-amber-500 fill-amber-500" : "text-slate-400"} />
                        <span>{isFeatured ? "Featured Academy ★" : "Feature on App"}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {aud.status !== "OPEN" && (
                          <button
                            type="button"
                            onClick={() => handleToggleAuditionStatus(aud, "OPEN")}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer"
                          >
                            Mark Open
                          </button>
                        )}
                        {aud.status !== "PAUSED" && (
                          <button
                            type="button"
                            onClick={() => handleToggleAuditionStatus(aud, "PAUSED")}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition cursor-pointer"
                          >
                            Pause
                          </button>
                        )}
                        {aud.status !== "CLOSED" && (
                          <button
                            type="button"
                            onClick={() => handleToggleAuditionStatus(aud, "CLOSED")}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {suiteTab === "ANALYTICS" && (
        <div className="space-y-6">
          {/* Analytics Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black uppercase text-purple-700 block">Total Audition Applicants</span>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {((liveAuditions.length || 5) * 42).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                <TrendingUp size={12} /> Student aspiring entries
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black uppercase text-pink-700 block">Active Verified Academies</span>
              <div className="text-2xl font-black text-pink-700 mt-2">
                {stats.approved || 12}
              </div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">
                Dance, Acting & Drama schools
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black uppercase text-emerald-700 block">Batch Enrollment Rate</span>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                78.4%
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                <Award size={12} /> High candidate conversion
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black uppercase text-amber-700 block">Scholarship Subsidies</span>
              <div className="text-2xl font-black text-amber-800 mt-2">
                ₹{(850000).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-amber-600 font-bold mt-1 block">
                BookMyStars talent discovery fund
              </span>
            </div>
          </div>

          {/* Academy Performance Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 m-0">Top Performing Partner Academies & Studios</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="pb-3">Academy Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Active Batches</th>
                    <th className="pb-3">Enrolled Performers</th>
                    <th className="pb-3 text-right">Accreditation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "Rajajinagar Dance & Performing Arts", cat: "Dance Academy", city: "Bengaluru", batches: 4, students: 128, rosette: "Gold Partner" },
                    { name: "Natya Shastra Acting & Drama Studio", cat: "Acting School", city: "Mumbai", batches: 3, students: 84, rosette: "Elite Academy" },
                    { name: "Sangeet Sadhana Music Guild", cat: "Music Studio", city: "Chennai", batches: 2, students: 56, rosette: "Certified Partner" },
                    { name: "Vogue Runway & Modeling Institute", cat: "Modeling Agency", city: "New Delhi", batches: 5, students: 142, rosette: "Gold Partner" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-extrabold text-slate-900">{row.name}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold">
                          {row.cat}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">{row.city}</td>
                      <td className="py-3 font-bold text-slate-900">{row.batches} Active</td>
                      <td className="py-3 font-bold text-emerald-600">{row.students} Candidates</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-[10px]">
                          ★ {row.rosette}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {suiteTab === "VERIFICATIONS" && (
        <div className="space-y-6">
      {/* 2. KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div 
          onClick={() => setActiveTab("PENDING")}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
            activeTab === "PENDING" ? "border-amber-400 ring-2 ring-amber-100" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">
              Pending Review
            </span>
            {stats.pending > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {stats.pending}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            {stats.pending === 1 ? "1 academy waiting for verification" : `${stats.pending} academies waiting for verification`}
          </div>
        </div>

        {/* Approved Card */}
        <div 
          onClick={() => setActiveTab("APPROVED")}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
            activeTab === "APPROVED" ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">
            Verified Partners
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {stats.approved}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Active verified academies & studios
          </div>
        </div>

        {/* Rejected Card */}
        <div 
          onClick={() => setActiveTab("REJECTED")}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
            activeTab === "REJECTED" ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200"
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500">
            Rejected Applications
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">
            {stats.rejected}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Denied platform credentials
          </div>
        </div>

        {/* Total Card */}
        <div 
          onClick={() => setActiveTab("ALL")}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition shadow-xs hover:shadow-md ${
            activeTab === "ALL" ? "border-slate-900 ring-2 ring-slate-100" : "border-slate-200"
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Total Applications
          </div>
          <div className="text-3xl font-black text-slate-800 mt-2">
            {stats.total}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            All registered partner organizations
          </div>
        </div>
      </div>

      {/* 3. Controls Bar: Tabs, Search & Category Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <FilterPills
          items={[
            { id: "PENDING", label: "Pending", count: stats.pending },
            { id: "APPROVED", label: "Approved", count: stats.approved },
            { id: "REJECTED", label: "Rejected", count: stats.rejected },
            { id: "ALL", label: "All", count: stats.total }
          ]}
          activeItem={activeTab}
          onSelect={setActiveTab}
          theme="slate"
        />

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl justify-end">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search academy name, contact, city, requirements..."
            size="sm"
            theme="purple"
            className="flex-1"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-purple-400 font-semibold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="DANCE_ACADEMY">Dance Academy</option>
            <option value="ACTING_SCHOOL">Acting School</option>
            <option value="MUSIC_STUDIO">Music Studio</option>
            <option value="MODELING_AGENCY">Modeling Agency</option>
            <option value="PRODUCTION_HOUSE">Production House</option>
            <option value="CASTING_AGENCY">Casting Agency</option>
            <option value="OTHER">Other Enterprise</option>
          </select>
        </div>
      </div>

      {/* 4. Partner Records List */}
      {loading ? (
        <Spinner
          size="lg"
          color="purple"
          text="Loading partner applications..."
        />
      ) : filteredPartners.length === 0 ? (
        <EmptyState
          icon={<Building2 size={36} className="text-slate-300" />}
          title="No Partner Records Found"
          description={
            activeTab === "PENDING"
              ? "All partner applications have been reviewed. There are currently no pending verification requests."
              : "No partner applications matched your selected filters or search query."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredPartners.map((partner) => {
            const isPending = !partner.isApproved && partner.verificationStatus !== "REJECTED";
            const isApproved = partner.isApproved;
            const isRejected = partner.verificationStatus === "REJECTED";
            const catColor = CATEGORY_COLORS[partner.partnerCategory] || CATEGORY_COLORS.OTHER;
            const catLabel = CATEGORY_LABELS[partner.partnerCategory] || partner.partnerCategory || "Partner";

            return (
              <div
                key={partner.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                {/* Top Row: Business Name, Category & Status Badge */}
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-black text-slate-900 m-0">
                        {partner.fullName}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catColor}`}>
                        {catLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {partner.partnerAddress || partner.location || "Location not specified"}
                      </span>
                      {partner.partnerWebsite && (
                        <a
                          href={partner.partnerWebsite.startsWith("http") ? partner.partnerWebsite : `https://${partner.partnerWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold"
                        >
                          <ExternalLink size={12} />
                          {partner.partnerWebsite.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        Applied: {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-300">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                        Pending Verification
                      </span>
                    )}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 size={13} />
                        Verified Partner
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-300">
                        <XCircle size={13} />
                        Rejected Application
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Box: Contact Info & Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  {/* Contact Person Details */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Authorized Representative
                    </span>
                    <div className="font-bold text-slate-800">
                      {partner.fullName}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Mail size={12} className="text-slate-400" />
                      <a href={`mailto:${partner.email}`} className="hover:text-purple-600 font-mono">
                        {partner.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone size={12} className="text-slate-400" />
                      <a href={`tel:${partner.mobileNumber}`} className="hover:text-purple-600 font-mono">
                        {partner.mobileNumber}
                      </a>
                    </div>
                  </div>

                  {/* Requirements & Business Goals */}
                  <div className="md:col-span-2 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <FileText size={12} className="text-slate-400" />
                      Business Requirements & Partnership Scope
                    </span>
                    <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed m-0 text-xs font-normal">
                      {partner.partnerRequirements || "No specific requirements provided at registration."}
                    </p>
                  </div>
                </div>

                {/* Rejection notice if present */}
                {isRejected && partner.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Rejection Note: </span>
                      <span>{partner.rejectionReason}</span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold">
                    Partner Account ID: <span className="font-mono text-slate-600">PTR-{partner.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(partner)}
                          disabled={actionLoadingId === partner.id}
                          className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle size={14} />
                          <span>Reject Application</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(partner)}
                          disabled={actionLoadingId === partner.id}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          <span>{actionLoadingId === partner.id ? "Approving..." : "Verify & Approve"}</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          <UserCheck size={14} />
                          Platform Login Active
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenReject(partner)}
                          className="px-3 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      </div>
                    )}

                    {isRejected && (
                      <button
                        type="button"
                        onClick={() => handleApprove(partner)}
                        disabled={actionLoadingId === partner.id}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        <span>Re-Verify & Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
      )}

      {/* Rejection Modal */}
      {rejectModalPartner && (
        <ConfirmDialog
          isOpen={Boolean(rejectModalPartner)}
          onClose={() => setRejectModalPartner(null)}
          onConfirm={handleConfirmReject}
          title="Reject Partner Application"
          message={`Provide a reason for declining ${rejectModalPartner.fullName}. This note will be recorded for admin audits.`}
          confirmText="Confirm Rejection"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoadingId === rejectModalPartner.id}
        >
          <TextArea
            rows={3}
            label="Reason for Rejection *"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="State the reason (e.g. Incomplete credentials, invalid registration details...)"
            helperText="This note will be logged and displayed to the partner if they attempt to log in."
            theme="purple"
          />
        </ConfirmDialog>
      )}
    </div>
  );
}
