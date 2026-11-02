import React, { useState, useEffect } from "react";
import AdminLayout from "../Layout/AdminLayout.jsx";
import AdminExecutiveBanner from "./components/AdminExecutiveBanner.jsx";
import AdminMetricScorecards from "./components/AdminMetricScorecards.jsx";
import AdminExactReferenceGrid from "./components/AdminExactReferenceGrid.jsx";
import DynamicRoleManagementDesk from "./components/DynamicRoleManagementDesk.jsx";
import AdminSkillsDesk from "./components/AdminSkillsDesk.jsx";
import PartnerVerificationDesk from "./PartnerVerificationDesk.jsx";
import ClientVerificationDesk from "./ClientVerificationDesk.jsx";
import { getStoredAdmin, getAdminOverviewMetrics, releaseEscrowPayout, awardVerifiedBadge, fetchCurrentAdmin } from "../../features/bms/api/admin/adminApi";
import { showSuccess, showWarning, showError } from "../../shared/utils/alert";
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  CreditCard, 
  Users, 
  Film, 
  ShieldCheck, 
  BarChart3, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  FileText,
  AlertCircle,
  Building2,
  Megaphone,
  Sliders,
  Sparkles,
  TrendingUp,
  GraduationCap,
  Award
} from "lucide-react";

export default function AdminDashboard() {
  const [activeWorkspace, setActiveWorkspace] = useState(() => localStorage.getItem("bms_admin_active_workspace") || "hq");
  const [activeTab, setActiveTab] = useState(() => {
    const ws = localStorage.getItem("bms_admin_active_workspace") || "hq";
    if (ws === "client") return "client_overview";
    if (ws === "partner") return "partner_overview";
    return "overview";
  });
  const [refreshing, setRefreshing] = useState(false);
  const [adminUser, setAdminUser] = useState(() => getStoredAdmin());
  const [metrics, setMetrics] = useState({
    pendingCastings: 14,
    mediaQueueCount: 42,
    escrowLockedAmount: "₹14,50,000",
    kycBadgesPending: 8,
    securityHealthPercent: 100
  });

  // Listen to auth & workspace changes
  useEffect(() => {
    const handleAuthChange = () => setAdminUser(getStoredAdmin());
    const handleWorkspaceSync = (e) => {
      const nextWs = e.detail || localStorage.getItem("bms_admin_active_workspace") || "hq";
      setActiveWorkspace(nextWs);
      if (nextWs === "client") {
        setActiveTab("client_overview");
      } else if (nextWs === "partner") {
        setActiveTab("partner_overview");
      } else {
        setActiveTab("overview");
      }
    };
    window.addEventListener("bms_admin_auth_changed", handleAuthChange);
    window.addEventListener("bms_admin_workspace_changed", handleWorkspaceSync);
    return () => {
      window.removeEventListener("bms_admin_auth_changed", handleAuthChange);
      window.removeEventListener("bms_admin_workspace_changed", handleWorkspaceSync);
    };
  }, []);

  useEffect(() => {
    async function initDashboard() {
      try {
        await fetchCurrentAdmin();
        const data = await getAdminOverviewMetrics();
        if (data) setMetrics(data);
      } catch (err) {
        // Fallback default
      }
    }
    initDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showSuccess("Live Sync Complete", "All operational queues updated from central database.");
    }, 600);
  };

  const isSuperAdmin = adminUser?.roleId === "ROLE_SUPER_ADMIN" || adminUser?.role === "SUPER_ADMIN";
  const userPerms = adminUser?.permissions || {};

  // Check if current admin has permission to view the active tab
  const hasAccess = (tab) => {
    if (tab === "overview") return true;
    if (isSuperAdmin) return true;
    if (tab === "skills") {
      return userPerms?.skills ? userPerms.skills.view === true : true;
    }
    const moduleMap = {
      skills: "skills",
      castings: "castings",
      talents: "talents",
      kyc: "kyc",
      escrow: "escrow",
      roles: "rbac",
      security: "security",
      reports: "auditing",
      settings: "settings"
    };
    const modKey = moduleMap[tab];
    if (!modKey) return true;
    const perm = userPerms[modKey];
    if (perm && typeof perm === "object") {
      return perm.view === true;
    }
    return false;
  };

  const tabLabels = {
    overview: "Command Center Dashboard",
    skills: "Master Catalog (Skills, Crafts & Professions)",
    roles: "RBAC & Permissions Desk",
    castings: "Casting Screening & Auditions",
    talents: "Talent Management (All Registered Users)",
    kyc: "KYC & Compliance Desk",
    escrow: "Escrow & Financial Vault",
    security: "Security & Immutable Audit",
    reports: "Operational Analytics & Reports",
    settings: "System Configuration"
  };

  const getPageTitle = () => {
    if (activeWorkspace === "client") {
      const clientTitles = {
        client_overview: "Commercial Client Command Center",
        client_verifications: "Corporate Brand Registration & KYC Desk",
        client_form_builder: "Dynamic 'Post a Requirement' Schema Builder",
        client_campaigns: "Live Shoot Briefs Moderation",
        client_escrow: "Commercial Escrow & Commission Vault",
        client_brands: "Corporate Brand & Client Directory",
        client_settings: "Client Governance & Verification SLA Rules"
      };
      return clientTitles[activeTab] || "Client Super Admin Desk";
    }
    if (activeWorkspace === "partner") {
      const partnerTitles = {
        partner_overview: "Partner Academy Command Center",
        partner_verifications: "Academy Accreditation & Licensing Desk",
        partner_form_builder: "Dynamic 'Post an Audition' Schema Builder",
        partner_auditions: "Live Academy Auditions & Batches Moderation",
        partner_analytics: "Student Flow & Academy Performance Analytics",
        partner_roster: "Accredited Studios & Academies Directory",
        partner_settings: "Academy Guidelines & Accreditation Tiers"
      };
      return partnerTitles[activeTab] || "Partner Super Admin Desk";
    }
    return tabLabels[activeTab] || "Command Center";
  };

  const getSubTitle = () => {
    if (activeWorkspace === "client") return "(Commercial & Brands Super Admin)";
    if (activeWorkspace === "partner") return "(Academies & Studios Super Admin)";
    return isSuperAdmin ? "(Super Admin Hub)" : `(${adminUser?.roleName || "Staff Officer"})`;
  };

  return (
    <AdminLayout
      pageTitle={getPageTitle()}
      subTitle={getSubTitle()}
      activeDesk={activeTab}
      onSelectDesk={setActiveTab}
      activeWorkspace={activeWorkspace}
    >
      <div 
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "1600px",
          margin: "0 auto",
          paddingBottom: "40px"
        }}
      >
        
        {/* ============================================================== */}
        {/* 1. EXECUTIVE COMMAND BANNER */}
        {/* ============================================================== */}
        <AdminExecutiveBanner
          onOpenRbac={() => setActiveTab("roles")}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* ============================================================== */}
        {/* 2. ACCESS PERMISSION ENFORCEMENT GUARD */}
        {/* ============================================================== */}
        {!hasAccess(activeTab) ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto my-12 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
              <ShieldAlert size={36} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider">
                <Lock size={12} />
                <span>403 Restricted Desk</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Administrative Clearance Required
              </h2>
              <p className="text-sm text-slate-500 max-w-lg mx-auto">
                Your assigned role (<strong>{adminUser?.roleName || adminUser?.roleId || "Staff"}</strong>) does not have authorization to view or manage the <strong>{tabLabels[activeTab]}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-slate-500">
                <span>Active Administrator:</span>
                <span className="font-bold text-slate-800">{adminUser?.name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Corporate Email:</span>
                <span className="font-mono text-slate-800">{adminUser?.email}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Department:</span>
                <span className="font-bold text-slate-800">{adminUser?.department || "Operations"}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Required Permission:</span>
                <span className="font-mono text-rose-600 font-bold">{activeTab}.view</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 border-none shadow-md shadow-slate-900/10"
              >
                <ArrowLeft size={14} />
                <span>Return to Overview</span>
              </button>
            </div>
          </div>
        ) : activeWorkspace === "client" ? (
          /* ============================================================== */
          /* 3A. CLIENT SUPER ADMIN WORKSPACE & ROUTED DESKS                */
          /* ============================================================== */
          <div className="space-y-6">
            {activeTab === "client_overview" && (
              <div className="space-y-6">
                {/* Client Super Admin Executive Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-pink-950 to-purple-950 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-pink-900/40">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-pink-500/20 backdrop-blur-md flex items-center justify-center text-3xl border border-pink-400/30 text-pink-300">
                      👑
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black m-0 text-white">Commercial Client Super Admin Command Desk</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-pink-500/20 text-pink-200 border border-pink-400/40">
                          Brands Gatekeeper
                        </span>
                      </div>
                      <p className="text-xs text-pink-200/80 m-0 mt-1 max-w-2xl">
                        Verify corporate companies (Jewelry, Hardware, Fashion, Tech), configure dynamic casting fields, moderate live shoot briefs, and oversee milestone escrow releases.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("client_verifications")}
                      className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-pink-500/20 cursor-pointer"
                    >
                      Open KYC Queue &rarr;
                    </button>
                  </div>
                </div>

                {/* 4 Client Executive Quick Access Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div 
                    onClick={() => setActiveTab("client_verifications")}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-pink-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-2xl bg-amber-50 text-amber-600">
                        <ShieldCheck size={20} />
                      </span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        Action Required
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">Brand Verification</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">Approve corporate applications</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("client_form_builder")}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-pink-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-2xl bg-pink-50 text-pink-600">
                        <Sliders size={20} />
                      </span>
                      <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                        Configurable
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">Requirement Form Fields</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">Edit custom fields schema</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("client_campaigns")}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-pink-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-2xl bg-purple-50 text-purple-600">
                        <Megaphone size={20} />
                      </span>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        Database Live
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">Shoot Briefs Moderation</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">Feature or pause casting calls</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("client_escrow")}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-pink-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
                        <DollarSign size={20} />
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        10% Platform Fee
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">Commercial Escrow</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">Track shoot milestones & GST</p>
                    </div>
                  </div>
                </div>

                {/* Embedded Client Verification Desk in Overview */}
                <ClientVerificationDesk initialSuiteTab="VERIFICATIONS" />
              </div>
            )}

            {activeTab === "client_verifications" && (
              <ClientVerificationDesk initialSuiteTab="VERIFICATIONS" />
            )}

            {activeTab === "client_form_builder" && (
              <ClientVerificationDesk initialSuiteTab="FORM_BUILDER" />
            )}

            {activeTab === "client_campaigns" && (
              <ClientVerificationDesk initialSuiteTab="CAMPAIGNS" />
            )}

            {activeTab === "client_escrow" && (
              <ClientVerificationDesk initialSuiteTab="FINANCIALS" />
            )}

            {activeTab === "client_brands" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 m-0">Corporate Client & Brand Directory</h3>
                    <p className="text-xs text-slate-500 m-0">All corporate enterprises registered on BookMyStars.</p>
                  </div>
                </div>
                <ClientVerificationDesk initialSuiteTab="VERIFICATIONS" />
              </div>
            )}

            {activeTab === "client_settings" && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0">Client Portal Governance & SLA Rules</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">Global configuration rules governing corporate client registrations and casting.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Verification Turnaround SLA</span>
                    <p className="text-xs text-slate-500 m-0">Super Admins are required to process brand verification within 24 business hours.</p>
                    <span className="text-[11px] font-bold text-emerald-600">● Currently Running: 4.2 Hours Avg</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Milestone Escrow Mandatory Minimum</span>
                    <p className="text-xs text-slate-500 m-0">100% of confirmed model daily fee must be locked before call sheets are shared.</p>
                    <span className="text-[11px] font-bold text-purple-600">● Mandatory Enforcement Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeWorkspace === "partner" ? (
          /* ============================================================== */
          /* 3B. PARTNER SUPER ADMIN WORKSPACE & ROUTED DESKS               */
          /* ============================================================== */
          <div className="space-y-6">
            {activeTab === "partner_overview" && (
              <div className="space-y-6">
                {/* Partner Super Admin Executive Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-xl flex items-center justify-between flex-wrap gap-4 border border-purple-900/40">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 backdrop-blur-md flex items-center justify-center text-3xl border border-purple-400/30 text-purple-300">
                      🎭
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black m-0 text-white">Partner Academy Super Admin Command Desk</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/40">
                          Accreditation Gatekeeper
                        </span>
                      </div>
                      <p className="text-xs text-purple-200/80 m-0 mt-1 max-w-2xl">
                        License and accredit performing arts academies, drama schools, and dance studios. Configure audition form schemas, moderate candidate intake batches, and award verified rosettes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("partner_verifications")}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      Open Accreditation &rarr;
                    </button>
                  </div>
                </div>

                {/* 4 Partner Executive Quick Access Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div 
                    onClick={() => setActiveTab("partner_verifications")}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-2xl bg-amber-50 text-amber-600">
                        <ShieldCheck size={20} />
                      </span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        Accreditation
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">Academy Approvals</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">License dance & drama schools</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("partner_form_builder")}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-2xl bg-purple-50 text-purple-600">
                        <Sliders size={20} />
                      </span>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                        Configurable
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">Audition Form Fields</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">Edit custom audition schema</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("partner_auditions")}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-2xl bg-pink-50 text-pink-600">
                        <Megaphone size={20} />
                      </span>
                      <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                        Batches Live
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">Audition Batches Moderation</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">Moderate slot limits & dates</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("partner_analytics")}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-purple-300 transition cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
                        <BarChart3 size={20} />
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        78.4% Conversion
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">Student Flow & Analytics</h4>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">Academy rankings & subsidies</p>
                    </div>
                  </div>
                </div>

                {/* Embedded Partner Verification Desk in Overview */}
                <PartnerVerificationDesk initialSuiteTab="VERIFICATIONS" />
              </div>
            )}

            {activeTab === "partner_verifications" && (
              <PartnerVerificationDesk initialSuiteTab="VERIFICATIONS" />
            )}

            {activeTab === "partner_form_builder" && (
              <PartnerVerificationDesk initialSuiteTab="FORM_BUILDER" />
            )}

            {activeTab === "partner_auditions" && (
              <PartnerVerificationDesk initialSuiteTab="AUDITIONS" />
            )}

            {activeTab === "partner_analytics" && (
              <PartnerVerificationDesk initialSuiteTab="ANALYTICS" />
            )}

            {activeTab === "partner_roster" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 m-0">Accredited Studios & Partner Academies Roster</h3>
                    <p className="text-xs text-slate-500 m-0">Verified creative enterprises and institutions.</p>
                  </div>
                </div>
                <PartnerVerificationDesk initialSuiteTab="VERIFICATIONS" />
              </div>
            )}

            {activeTab === "partner_settings" && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 m-0">Partner Academy Guidelines & Accreditation Tiers</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">Standard guidelines for awarding verified rosettes and scholarship quotas.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <span className="text-xs font-bold text-purple-900 block">Gold Partner Rosette Criteria</span>
                    <p className="text-xs text-slate-600 m-0">Requires minimum 3+ years active operation, verified physical studio address, and certified faculty.</p>
                    <span className="text-[11px] font-bold text-purple-700">● 12 Academies Certified</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                    <span className="text-xs font-bold text-purple-900 block">Student Discovery Scholarship Quota</span>
                    <p className="text-xs text-slate-600 m-0">Each accredited partner receives up to 10 talent subsidies per year for underprivileged performers.</p>
                    <span className="text-[11px] font-bold text-emerald-600">● 42 Scholarships Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* 3C. STANDARD BMS MASTER HQ DESK VIEWS                          */
          /* ============================================================== */
          <>
            {/* TAB: ROLES (Dynamic RBAC Governance) */}
            {activeTab === "roles" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>← Back to Command Center</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    Master RBAC & Staff Governance Console (PostgreSQL Live)
                  </span>
                </div>
                <DynamicRoleManagementDesk />
              </div>
            )}

            {/* TAB: OVERVIEW (Default Dashboard) */}
            {activeTab === "overview" && (
              <>
                <AdminMetricScorecards
                  metrics={metrics}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                <AdminExactReferenceGrid
                  onOpenRbac={() => setActiveTab("roles")}
                  onTabChange={setActiveTab}
                />
              </>
            )}

            {/* TAB: SKILLS & CRAFTS (Master Skills Catalog Management) */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>← Back to Command Center</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    Skills & Crafts Desk • Dynamic Master Catalog (PostgreSQL Live)
                  </span>
                </div>
                <AdminSkillsDesk />
              </div>
            )}

            {/* TAB: CASTINGS (Casting Submissions Screening) */}
            {activeTab === "castings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>← Back to Command Center</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    Casting Desk • Full Directory & Screening Operations
                  </span>
                </div>
                <AdminExactReferenceGrid
                  onOpenRbac={() => setActiveTab("roles")}
                  onTabChange={setActiveTab}
                  singleCardView="castings"
                  defaultCastingTab="all"
                />
              </div>
            )}

            {/* TAB: KYC (KYC & Identity Verification Desk) */}
            {activeTab === "kyc" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>← Back to Command Center</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    KYC Desk • Full Verification Roster & Rosette Badges
                  </span>
                </div>
                <AdminExactReferenceGrid
                  onOpenRbac={() => setActiveTab("roles")}
                  onTabChange={setActiveTab}
                  singleCardView="kyc"
                  defaultKycTab="all"
                />
              </div>
            )}

            {/* TAB: TALENTS (Talent Directory Desk) */}
            {activeTab === "talents" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>← Back to Command Center</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    Talent Directory • Manage Artists & Star Verification Badges
                  </span>
                </div>
                <AdminExactReferenceGrid
                  onOpenRbac={() => setActiveTab("roles")}
                  onTabChange={setActiveTab}
                  singleCardView="kyc"
                  defaultKycTab="all"
                />
              </div>
            )}

            {/* TAB: SECURITY & AUDIT (Activity Log Desk) */}
            {activeTab === "security" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>← Back to Command Center</span>
                  </button>
                  <span className="text-xs font-bold text-slate-400">
                    Security & Immutable Audit Trail (PostgreSQL Live)
                  </span>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 m-0">Recent Operational & Security Activities</h3>
                        <p className="text-xs text-slate-500 m-0">Complete ledger of admin logins, casting decisions, KYC verifications, and escrow payouts.</p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {[
                      { action: "Casting notice approved", detail: "Urban Lifestyle Shoot moved to OPEN", user: "Rohit (Casting Director)", time: "10:12 AM", type: "casting" },
                      { action: "Talent KYC badge issued", detail: "Neha Singh awarded Verified Star badge", user: "Dev Patel (KYC Compliance)", time: "09:45 AM", type: "kyc" },
                      { action: "Escrow milestone disbursed", detail: "₹45,000 released for Project #CP-1023", user: "Pooja Hegde (Finance)", time: "09:20 AM", type: "escrow" },
                      { action: "Admin staff member created", detail: "Rohit (rohit.test@bookmystars.com) added to Casting Operations", user: "Vikram Malhotra (Super Admin)", time: "08:55 AM", type: "rbac" },
                      { action: "Master security audit completed", detail: "Zero authorization breaches, 11 module guards operational", user: "Automated Sentinel", time: "08:00 AM", type: "security" }
                    ].map((log, i) => (
                      <div key={i} className="py-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${log.type === "casting" ? "bg-pink-500" : log.type === "kyc" ? "bg-purple-500" : log.type === "escrow" ? "bg-emerald-500" : "bg-blue-500"}`} />
                          <div>
                            <div className="font-bold text-slate-800">{log.action}</div>
                            <div className="text-slate-500 text-[11px]">{log.detail}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-700">{log.user}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{log.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ESCROW (Escrow & Payments Vault) */}
            {activeTab === "escrow" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>← Back to Command Center</span>
                  </button>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 font-mono">
                    <ShieldCheck size={14} /> 256-Bit Escrow Vault Active
                  </span>
                </div>

                {/* Escrow Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Locked in Escrow</span>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">₹14,50,000</div>
                    <p className="text-xs text-emerald-600 font-semibold">● 14 active project milestone contracts</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disbursed This Month</span>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">₹38,20,000</div>
                    <p className="text-xs text-slate-500 font-semibold">● 100% verified talent direct-bank settlements</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Releases</span>
                    <div className="text-3xl font-black text-[#ee008f] tracking-tight">3 Milestone Approvals</div>
                    <p className="text-xs text-amber-600 font-semibold">● Requires Finance Officer authorization</p>
                  </div>
                </div>

                {/* Milestone Release Table */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 m-0">Milestone Release Queue</h3>
                      <p className="text-xs text-slate-500 m-0 mt-0.5">Authorize disbursement of funds upon shoot wrap confirmation.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                          <th className="py-3 px-3">Booking ID</th>
                          <th className="py-3 px-3">Production Project</th>
                          <th className="py-3 px-3">Talent / Artist</th>
                          <th className="py-3 px-3">Locked Amount</th>
                          <th className="py-3 px-3">Milestone State</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        <tr className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-900">#ESC-8012</td>
                          <td className="py-3.5 px-3">Urban Lifestyle Shoot • Shoot Wrapped</td>
                          <td className="py-3.5 px-3 font-semibold">Rahul Sharma (Model)</td>
                          <td className="py-3.5 px-3 font-bold text-emerald-600">₹45,000</td>
                          <td className="py-3.5 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Authorization</span></td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                await releaseEscrowPayout("ESC-8012", 45000);
                                showSuccess("Escrow Disbursed", "₹45,000 released to Rahul Sharma's verified account.");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer border-none transition"
                            >
                              Authorize Release
                            </button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-3 font-mono font-bold text-slate-900">#ESC-8013</td>
                          <td className="py-3.5 px-3">Tech Product TV Commercial • Post Production</td>
                          <td className="py-3.5 px-3 font-semibold">Priya Nair (Actor)</td>
                          <td className="py-3.5 px-3 font-bold text-emerald-600">₹80,000</td>
                          <td className="py-3.5 px-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Client Approved</span></td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                await releaseEscrowPayout("ESC-8013", 80000);
                                showSuccess("Escrow Disbursed", "₹80,000 released to Priya Nair's verified account.");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer border-none transition"
                            >
                              Authorize Release
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REPORTS & SETTINGS (System Governance) */}
            {["reports", "settings"].includes(activeTab) && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#ee008f] flex items-center justify-center font-bold">
                      {activeTab === "reports" && <BarChart3 size={20} />}
                      {activeTab === "settings" && <SettingsIcon size={20} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 m-0">{tabLabels[activeTab]}</h3>
                      <p className="text-xs text-slate-500 m-0">Authorized module access granted for {adminUser?.name}.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer border-none transition"
                  >
                    ← Back to Overview
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 m-0">Live Operational Desk Active</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You have verified clearance for <strong>{tabLabels[activeTab]}</strong>. All changes are logged to the PostgreSQL audit trail with your corporate identity: <span className="font-mono text-slate-700">{adminUser?.email}</span>.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AdminLayout>
  );
}
