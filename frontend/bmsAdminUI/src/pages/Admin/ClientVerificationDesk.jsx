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
  Gem,
  Wrench,
  Shirt,
  Cpu,
  ShoppingBag,
  Home,
  Car,
  Briefcase,
  Megaphone,
  UserCheck,
  Sliders,
  DollarSign,
  TrendingUp,
  Sparkles,
  Eye,
  Award,
  Layers,
  Check,
  Lock,
  Pause,
  Play,
  Video
} from "lucide-react";
import {
  getAdminClients,
  verifyAdminClient,
  rejectAdminClient,
  getPendingClientsCount
} from "../../features/bms/api/clients/clientApi";
import { opportunitiesApi } from "../../features/bms/api/opportunities/opportunitiesApi";
import { showSuccess, showError } from "../../shared/utils/alert";
import RequirementFormBuilderDesk from "./components/RequirementFormBuilderDesk";
import EntityContextSelectorBar from "./components/EntityContextSelectorBar";
import { FilterPills, SearchBar, ConfirmDialog, Button, Badge, TextArea } from "../../shared/common";
import { getClientCustomFields } from "../../shared/utils/customFieldsConfig";

const INDUSTRY_LABELS = {
  JEWELRY_LUXURY: "Jewelry & Luxury",
  HARDWARE_MANUFACTURING: "Hardware & Tools",
  FASHION_APPAREL: "Fashion & Apparel",
  TECH_ELECTRONICS: "Tech & Electronics",
  FMCG_CONSUMER_GOODS: "FMCG & Consumer Goods",
  REAL_ESTATE: "Real Estate & Architecture",
  AUTOMOBILE: "Automobile & EV",
  OTHER: "Corporate Brand"
};

const INDUSTRY_COLORS = {
  JEWELRY_LUXURY: "bg-amber-50 text-amber-800 border-amber-200",
  HARDWARE_MANUFACTURING: "bg-blue-50 text-blue-800 border-blue-200",
  FASHION_APPAREL: "bg-pink-50 text-pink-800 border-pink-200",
  TECH_ELECTRONICS: "bg-cyan-50 text-cyan-800 border-cyan-200",
  FMCG_CONSUMER_GOODS: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REAL_ESTATE: "bg-purple-50 text-purple-800 border-purple-200",
  AUTOMOBILE: "bg-rose-50 text-rose-800 border-rose-200",
  OTHER: "bg-slate-50 text-slate-800 border-slate-200"
};

const INDUSTRY_ICONS = {
  JEWELRY_LUXURY: <Gem size={15} />,
  HARDWARE_MANUFACTURING: <Wrench size={15} />,
  FASHION_APPAREL: <Shirt size={15} />,
  TECH_ELECTRONICS: <Cpu size={15} />,
  FMCG_CONSUMER_GOODS: <ShoppingBag size={15} />,
  REAL_ESTATE: <Home size={15} />,
  AUTOMOBILE: <Car size={15} />,
  OTHER: <Briefcase size={15} />
};

export default function ClientVerificationDesk({ initialSuiteTab = "VERIFICATIONS" }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING | APPROVED | REJECTED | ALL
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectModalClient, setRejectModalClient] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Top-level suite tabs: VERIFICATIONS | FORM_BUILDER | CAMPAIGNS | FINANCIALS
  const [suiteTab, setSuiteTab] = useState(initialSuiteTab);

  // Multi-Tenant Company Scope
  const [selectedCompany, setSelectedCompany] = useState(() => {
    try {
      const saved = localStorage.getItem("bms_admin_selected_client_company");
      return saved ? JSON.parse(saved) : { id: "global", name: "Global Platform Baseline" };
    } catch (e) {
      return { id: "global", name: "Global Platform Baseline" };
    }
  });

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    try {
      localStorage.setItem("bms_admin_selected_client_company", JSON.stringify(comp));
    } catch (e) {}
  };

  useEffect(() => {
    if (initialSuiteTab) {
      setSuiteTab(initialSuiteTab);
    }
  }, [initialSuiteTab]);

  // Dynamic live custom fields count
  const [customFieldsCount, setCustomFieldsCount] = useState(() => getClientCustomFields().length);

  // Live database shoot briefs from casting_calls table
  const [liveBriefs, setLiveBriefs] = useState([]);
  const [loadingBriefs, setLoadingBriefs] = useState(false);
  const [briefSearch, setBriefSearch] = useState("");
  const [briefStatusFilter, setBriefStatusFilter] = useState("ALL");
  const [featuredMap, setFeaturedMap] = useState(() => {
    try {
      const saved = localStorage.getItem("bms_featured_briefs");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const fetchLiveBriefs = async () => {
    try {
      setLoadingBriefs(true);
      const data = await opportunitiesApi.getPublicCastingCalls();
      setLiveBriefs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Failed to load live casting calls:", e);
    } finally {
      setLoadingBriefs(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getAdminClients();
      setClients(data || []);
    } catch (err) {
      console.error("Failed to load client applications:", err);
      showError("Fetch Error", "Unable to load client verification records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchLiveBriefs();

    const handleClientUpdated = () => fetchClients();
    window.addEventListener("bms_client_updated", handleClientUpdated);
    window.addEventListener("bms_client_registered", handleClientUpdated);

    const handleFieldSync = () => {
      setCustomFieldsCount(getClientCustomFields().length);
    };
    window.addEventListener("bms_client_fields_updated", handleFieldSync);

    return () => {
      window.removeEventListener("bms_client_updated", handleClientUpdated);
      window.removeEventListener("bms_client_registered", handleClientUpdated);
      window.removeEventListener("bms_client_fields_updated", handleFieldSync);
    };
  }, []);

  const handleToggleBriefStatus = async (brief, newStatus) => {
    try {
      showSuccess("Status Updated", `Campaign #${brief.id} marked as ${newStatus}.`);
      setLiveBriefs(prev => prev.map(b => b.id === brief.id ? { ...b, status: newStatus } : b));
    } catch (e) {
      showError("Update Error", "Failed to update campaign status.");
    }
  };

  const handleToggleFeatured = (briefId) => {
    const updated = { ...featuredMap, [briefId]: !featuredMap[briefId] };
    setFeaturedMap(updated);
    localStorage.setItem("bms_featured_briefs", JSON.stringify(updated));
    showSuccess(
      updated[briefId] ? "Boosted to Homepage Spotlight" : "Removed from Spotlight",
      `Campaign brief #${briefId} visibility updated.`
    );
  };

  const stats = useMemo(() => {
    const pending = clients.filter(c => !c.isApproved && c.verificationStatus !== "REJECTED").length;
    const approved = clients.filter(c => c.isApproved).length;
    const rejected = clients.filter(c => c.verificationStatus === "REJECTED").length;
    return {
      pending,
      approved,
      rejected,
      total: clients.length
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Tab filter
      if (activeTab === "PENDING") {
        if (client.isApproved || client.verificationStatus === "REJECTED") return false;
      } else if (activeTab === "APPROVED") {
        if (!client.isApproved) return false;
      } else if (activeTab === "REJECTED") {
        if (client.verificationStatus !== "REJECTED") return false;
      }

      // Industry filter
      if (industryFilter !== "ALL" && client.industry !== industryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (client.companyName || "").toLowerCase();
        const contact = (client.contactPersonName || "").toLowerCase();
        const email = (client.email || "").toLowerCase();
        const city = (client.location || "").toLowerCase();
        const req = (client.requirements || "").toLowerCase();
        return name.includes(q) || contact.includes(q) || email.includes(q) || city.includes(q) || req.includes(q);
      }

      return true;
    });
  }, [clients, activeTab, industryFilter, searchQuery]);

  const handleApprove = async (client) => {
    try {
      setActionLoadingId(client.id);
      await verifyAdminClient(client.id);
      showSuccess("Brand Approved", `${client.companyName} has been verified! They can now log in to the Client Portal.`);
      window.dispatchEvent(new Event("bms_client_updated"));
      await fetchClients();
    } catch (err) {
      showError("Approval Failed", err.message || "Failed to approve client brand.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalClient) return;
    try {
      setActionLoadingId(rejectModalClient.id);
      await rejectAdminClient(rejectModalClient.id, rejectionReason);
      showSuccess("Application Rejected", `${rejectModalClient.companyName} application has been rejected.`);
      setRejectModalClient(null);
      setRejectionReason("");
      window.dispatchEvent(new Event("bms_client_updated"));
      await fetchClients();
    } catch (err) {
      showError("Rejection Failed", err.message || "Failed to reject client brand.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-pink-950 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-purple-900/40">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/20 backdrop-blur-md flex items-center justify-center text-3xl border border-pink-400/30 text-pink-300">
            🏢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black m-0 text-white">Client Brands & Commercial Directory Desk</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-200 border border-pink-400/40">
                Super Admin Gatekeeper
              </span>
            </div>
            <p className="text-xs text-pink-200/80 m-0 mt-1 max-w-2xl">
              Verify commercial companies (Jewelry, Hardware, Fashion, etc.) seeking artist casting and ad production services before they can access the Client Workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchClients}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Desk
          </button>
        </div>
      </div>

      {/* 2. Enterprise Multi-Tenant Brand Selector Bar */}
      <EntityContextSelectorBar
        workspaceType="CLIENT"
        entities={clients}
        selectedEntity={selectedCompany}
        onSelectEntity={handleSelectCompany}
        onOpenFormBuilder={() => setSuiteTab("FORM_BUILDER")}
        onOpenCampaigns={() => setSuiteTab("CAMPAIGNS")}
      />

      {/* 3. Top Executive Suite Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        {[
          { id: "VERIFICATIONS", label: "Registration & KYC Approvals", icon: ShieldCheck, badge: stats.pending > 0 ? stats.pending : null, badgeColor: "bg-amber-100 text-amber-800" },
          { id: "FORM_BUILDER", label: "'Post a Requirement' Form Builder", icon: Sliders, badge: `${customFieldsCount} Fields`, badgeColor: "bg-pink-100 text-pink-800" },
          { id: "CAMPAIGNS", label: "Live Shoot Briefs Moderation", icon: Megaphone, badge: liveBriefs.length, badgeColor: "bg-purple-100 text-purple-800" },
          { id: "FINANCIALS", label: "Commercial Analytics & Escrow", icon: DollarSign, badge: "Active", badgeColor: "bg-emerald-100 text-emerald-800" }
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
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20"
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
          moduleType="CLIENT"
          entityId={selectedCompany?.id || "global"}
          entityName={selectedCompany?.companyName || selectedCompany?.name || "Global Platform Baseline"}
        />
      )}

      {suiteTab === "CAMPAIGNS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
                  <Megaphone size={18} />
                </span>
                <h3 className="text-base font-black text-slate-900 m-0">Live Database Commercial Briefs Moderation</h3>
              </div>
              <p className="text-xs text-slate-500 m-0 mt-1">
                Moderate, pause, or feature casting calls and shoot briefs posted by clients across India.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchLiveBriefs}
                disabled={loadingBriefs}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw size={13} className={loadingBriefs ? "animate-spin" : ""} />
                <span>Refresh Briefs</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <FilterPills
              items={[
                { id: "ALL", label: "ALL" },
                { id: "OPEN", label: "OPEN" },
                { id: "UNDER_REVIEW", label: "UNDER REVIEW" },
                { id: "PAUSED", label: "PAUSED" },
                { id: "CLOSED", label: "CLOSED" }
              ]}
              activeItem={briefStatusFilter}
              onSelect={setBriefStatusFilter}
              theme="purple"
            />

            <SearchBar
              value={briefSearch}
              onChange={(e) => setBriefSearch(e.target.value)}
              placeholder="Search by title, location or industry..."
              size="sm"
              theme="purple"
              className="min-w-[240px]"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveBriefs
              .filter(b => {
                if (briefStatusFilter !== "ALL" && (b.status || "OPEN") !== briefStatusFilter) return false;
                if (briefSearch.trim()) {
                  const q = briefSearch.toLowerCase();
                  return (b.title || "").toLowerCase().includes(q) ||
                         (b.location || "").toLowerCase().includes(q) ||
                         (b.projectType || "").toLowerCase().includes(q);
                }
                return true;
              })
              .map((brief) => {
                const isFeatured = Boolean(featuredMap[brief.id]);
                return (
                  <div key={brief.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative">
                          {brief.mediaType === "video" || (typeof brief.posterUrl === "string" && (brief.posterUrl.includes(".mp4") || brief.posterUrl.includes(".webm") || brief.posterUrl.startsWith("data:video/"))) ? (
                            <>
                              <video
                                src={brief.posterUrl}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Video size={14} className="text-pink-400" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={brief.posterUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=300&q=80"}
                              alt={brief.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-black uppercase">
                            {brief.projectType || "Commercial Shoot"}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 m-0 mt-0.5 line-clamp-1">
                            {brief.title}
                          </h4>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        brief.status === "OPEN" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        brief.status === "PAUSED" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        brief.status === "CLOSED" ? "bg-slate-100 text-slate-600" :
                        "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}>
                        {brief.status || "OPEN"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed m-0">
                      {brief.description || "Commercial brief registered on BookMyStars client portal."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium pt-1">
                      <span className="font-bold text-slate-700">
                        Budget: ₹{Number(brief.budget || 45000).toLocaleString("en-IN")}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-pink-500" />
                        {brief.location || "Mumbai, India"}
                      </span>
                      <span>•</span>
                      <span>Deadline: {brief.applicationDeadline || "Open"}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(brief.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isFeatured
                            ? "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Sparkles size={13} className={isFeatured ? "text-amber-500 fill-amber-500" : "text-slate-400"} />
                        <span>{isFeatured ? "Featured Spotlight ★" : "Feature Brief"}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {brief.status !== "OPEN" && (
                          <button
                            type="button"
                            onClick={() => handleToggleBriefStatus(brief, "OPEN")}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition cursor-pointer"
                          >
                            Mark Open
                          </button>
                        )}
                        {brief.status !== "PAUSED" && (
                          <button
                            type="button"
                            onClick={() => handleToggleBriefStatus(brief, "PAUSED")}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition cursor-pointer"
                          >
                            Pause
                          </button>
                        )}
                        {brief.status !== "CLOSED" && (
                          <button
                            type="button"
                            onClick={() => handleToggleBriefStatus(brief, "CLOSED")}
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

      {suiteTab === "FINANCIALS" && (
        <div className="space-y-6">
          {/* Financial Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black uppercase text-purple-700 block">Total Campaign Volume</span>
              <div className="text-2xl font-black text-slate-900 mt-2">
                ₹{((liveBriefs.length || 6) * 125000).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                <TrendingUp size={12} /> Active commercial budgets
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black uppercase text-pink-700 block">Platform Commission (10%)</span>
              <div className="text-2xl font-black text-pink-700 mt-2">
                ₹{((liveBriefs.length || 6) * 12500).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-slate-500 font-bold mt-1 block">
                Standard platform service fee
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black uppercase text-emerald-700 block">Escrow Funds Secured</span>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                ₹{((liveBriefs.length || 6) * 85000).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
                <ShieldCheck size={12} /> Milestone protection active
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black uppercase text-amber-700 block">Active Talent Payouts</span>
              <div className="text-2xl font-black text-amber-800 mt-2">
                ₹{((liveBriefs.length || 6) * 40000).toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-amber-600 font-bold mt-1 block">
                Disbursed post shoot wrap
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 m-0">Commercial Milestone & Escrow Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="pb-3">Client Brand</th>
                    <th className="pb-3">Campaign Project</th>
                    <th className="pb-3">Escrow Status</th>
                    <th className="pb-3">Budget</th>
                    <th className="pb-3">BMS Commission</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { client: "Tanishq Fine Jewelry", proj: "Diwali Festive Diamond Shoot", status: "ESCROW LOCKED", budget: "₹4,50,000", comm: "₹45,000" },
                    { client: "Apex Tool Systems", proj: "Industrial Product Commercial", status: "CALL SHEET ACTIVE", budget: "₹2,20,000", comm: "₹22,000" },
                    { client: "FabIndia Handloom", proj: "Ethnic Festive Catalog", status: "RELEASED TO TALENT", budget: "₹1,80,000", comm: "₹18,000" },
                    { client: "Titan Eyeplus", proj: "4K Digital Ad Campaign", status: "ESCROW LOCKED", budget: "₹3,10,000", comm: "₹31,000" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-extrabold text-slate-900">{row.client}</td>
                      <td className="py-3 text-slate-600">{row.proj}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          row.status.includes("LOCKED") ? "bg-emerald-50 text-emerald-700" :
                          row.status.includes("ACTIVE") ? "bg-purple-50 text-purple-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-900">{row.budget}</td>
                      <td className="py-3 font-bold text-pink-600">{row.comm}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => showSuccess("Invoice Generated", `GST Invoice downloaded for ${row.client}.`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 font-bold text-[11px] transition cursor-pointer"
                        >
                          GST Invoice
                        </button>
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
      {/* 2. Top Metric Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div 
          onClick={() => setActiveTab("PENDING")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "PENDING"
              ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40 shadow-md"
              : "bg-white border-slate-200 hover:border-amber-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">Pending Review</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-amber-900 mt-2">{stats.pending}</div>
          <div className="text-[11px] font-bold text-amber-600 mt-1 flex items-center gap-1">
            <Clock size={12} /> Awaiting Super Admin review
          </div>
        </div>

        {/* Approved Card */}
        <div 
          onClick={() => setActiveTab("APPROVED")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "APPROVED"
              ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/40 shadow-md"
              : "bg-white border-slate-200 hover:border-emerald-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Verified Brands</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-900 mt-2">{stats.approved}</div>
          <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <ShieldCheck size={12} /> Active & granted client login
          </div>
        </div>

        {/* Rejected Card */}
        <div 
          onClick={() => setActiveTab("REJECTED")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "REJECTED"
              ? "bg-rose-50/70 border-rose-300 ring-2 ring-rose-400/40 shadow-md"
              : "bg-white border-slate-200 hover:border-rose-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">Declined Applications</span>
            <XCircle size={16} className="text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-900 mt-2">{stats.rejected}</div>
          <div className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> Denied access / invalid details
          </div>
        </div>

        {/* Total Card */}
        <div 
          onClick={() => setActiveTab("ALL")}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === "ALL"
              ? "bg-purple-50/70 border-purple-300 ring-2 ring-purple-400/40 shadow-md"
              : "bg-white border-slate-200 hover:border-purple-200 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700">Total Brand Clients</span>
            <Building2 size={16} className="text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.total}</div>
          <div className="text-[11px] font-bold text-purple-600 mt-1 flex items-center gap-1">
            <Megaphone size={12} /> Commercial brands directory
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        {/* Left Tabs */}
        <FilterPills
          items={[
            { id: "PENDING", label: "PENDING", count: stats.pending },
            { id: "APPROVED", label: "APPROVED", count: stats.approved },
            { id: "REJECTED", label: "REJECTED", count: stats.rejected },
            { id: "ALL", label: "ALL", count: stats.total }
          ]}
          activeItem={activeTab}
          onSelect={setActiveTab}
          theme="slate"
        />

        {/* Right Search & Industry Filter */}
        <div className="flex items-center gap-3 flex-1 sm:flex-initial justify-end">
          {/* Industry Filter Dropdown */}
          <div className="relative">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition appearance-none"
            >
              <option value="ALL">All Industries</option>
              {Object.entries(INDUSTRY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Search Box */}
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand, contact, city, or requirement..."
            size="sm"
            theme="purple"
            className="min-w-[240px]"
          />
        </div>
      </div>

      {/* 4. Client Brand Cards Grid */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <RefreshCw size={28} className="animate-spin text-purple-600 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-700">Loading client brand applications...</div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} />
          </div>
          <div className="text-base font-black text-slate-800">No Client Brand Records Found</div>
          <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === "PENDING"
              ? "There are currently no client brand registrations awaiting verification."
              : "No records match your selected industry or search query."}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredClients.map((client) => {
            const indLabel = INDUSTRY_LABELS[client.industry] || client.industry || "Corporate Brand";
            const indColor = INDUSTRY_COLORS[client.industry] || "bg-slate-50 text-slate-800 border-slate-200";
            const indIcon = INDUSTRY_ICONS[client.industry] || <Briefcase size={15} />;
            const isPending = !client.isApproved && client.verificationStatus !== "REJECTED";
            const isApproved = client.isApproved;
            const isRejected = client.verificationStatus === "REJECTED";

            return (
              <div
                key={client.id}
                className="p-6 bg-white rounded-3xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Industry badge & Verification Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${indColor}`}>
                      {indIcon} {indLabel}
                    </span>

                    {isApproved && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Approved Client
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock size={12} /> Pending Verification
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <XCircle size={12} /> Declined
                      </span>
                    )}
                  </div>

                  {/* Company Name */}
                  <h3 className="text-lg font-black text-slate-900 m-0 tracking-tight">
                    {client.companyName}
                  </h3>

                  {/* Representative / Contact details */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <UserCheck size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="font-bold text-slate-800 truncate">{client.contactPersonName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{client.location || "Location not set"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail size={14} className="text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${client.email}`} className="text-pink-600 font-bold hover:underline truncate">
                        {client.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{client.mobileNumber}</span>
                    </div>
                  </div>

                  {/* Website if present */}
                  {client.websiteUrl && (
                    <div className="mt-2 text-xs flex items-center gap-1.5">
                      <ExternalLink size={13} className="text-purple-500" />
                      <a
                        href={client.websiteUrl.startsWith("http") ? client.websiteUrl : `https://${client.websiteUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-bold hover:underline truncate"
                      >
                        {client.websiteUrl}
                      </a>
                    </div>
                  )}

                  {/* Primary Requirement Box */}
                  <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                      <Megaphone size={12} className="text-pink-600" /> Ad & Artist Requirement
                    </div>
                    <p className="text-xs text-slate-700 m-0 leading-relaxed font-medium">
                      {client.requirements || "No specific requirement note provided."}
                    </p>
                  </div>

                  {/* Rejection note if rejected */}
                  {isRejected && client.rejectionReason && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                      <strong>Decline Reason:</strong> {client.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[11px] text-slate-400 font-bold">
                    ID #{client.id}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Approve button */}
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleApprove(client)}
                        disabled={actionLoadingId === client.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} /> Approve Brand
                      </button>
                    )}

                    {/* Reject button */}
                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => {
                          setRejectModalClient(client);
                          setRejectionReason("");
                        }}
                        disabled={actionLoadingId === client.id}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}

                    {/* If already approved, show verified indicator */}
                    {isApproved && (
                      <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                        <ShieldCheck size={16} /> Verified Active Account
                      </span>
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

      {/* Reject Modal */}
      {rejectModalClient && (
        <ConfirmDialog
          isOpen={Boolean(rejectModalClient)}
          onClose={() => setRejectModalClient(null)}
          onConfirm={handleConfirmReject}
          title="Decline Brand Registration"
          message={`Provide a reason for declining ${rejectModalClient.companyName}. This note will be recorded for admin audits.`}
          confirmText="Confirm Decline"
          cancelText="Cancel"
          variant="danger"
          loading={actionLoadingId === rejectModalClient.id}
        >
          <TextArea
            rows={3}
            label="Reason / Note *"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Unverified corporate credentials, duplicate application, or outside service scope..."
            theme="purple"
          />
        </ConfirmDialog>
      )}
    </div>
  );
}
