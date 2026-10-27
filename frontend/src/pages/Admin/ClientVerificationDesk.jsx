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
  UserCheck
} from "lucide-react";
import {
  getAdminClients,
  verifyAdminClient,
  rejectAdminClient,
  getPendingClientsCount
} from "../../features/bms/api/clients/clientApi";
import { showSuccess, showError } from "../../shared/utils/alert";

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

export default function ClientVerificationDesk() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING | APPROVED | REJECTED | ALL
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [rejectModalClient, setRejectModalClient] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

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

    const handleClientUpdated = () => fetchClients();
    window.addEventListener("bms_client_updated", handleClientUpdated);
    window.addEventListener("bms_client_registered", handleClientUpdated);
    return () => {
      window.removeEventListener("bms_client_updated", handleClientUpdated);
      window.removeEventListener("bms_client_registered", handleClientUpdated);
    };
  }, []);

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
        <div className="flex items-center gap-2">
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => {
            const count = tab === "PENDING" ? stats.pending : tab === "APPROVED" ? stats.approved : tab === "REJECTED" ? stats.rejected : stats.total;
            const isCurrent = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isCurrent ? "bg-white/20 text-white" : "bg-white text-slate-700"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

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
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search brand, contact, city, or requirement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-500 focus:bg-white transition"
            />
          </div>
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

      {/* Reject Modal */}
      {rejectModalClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <XCircle size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 m-0">Decline Brand Registration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide a reason for declining <strong>{rejectModalClient.companyName}</strong>. This note will be recorded for admin audits.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Unverified corporate credentials, duplicate application, or outside service scope..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-rose-500 focus:bg-white transition"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectModalClient(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoadingId === rejectModalClient.id}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer disabled:opacity-50"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
