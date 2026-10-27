import React, { useState } from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  IndianRupee, 
  Film, 
  Check, 
  X, 
  Eye, 
  ExternalLink, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  FileText,
  DollarSign
} from "lucide-react";
import PagesButton from "../../common/PagesButton";
import { showSuccess, showWarning, showError } from "../../../shared/utils/alert";

export default function AdminOperationsDesk({ 
  activeTab = "castings", 
  onTabChange 
}) {
  const [searchFilter, setSearchFilter] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // Local state for live interactive demonstration
  const [castings, setCastings] = useState([
    {
      id: "OPP-9402",
      title: "Feature Film - Lead Male Protagonist (Action/Drama)",
      productionHouse: "Dharma Productions & Leo Media",
      director: "Karan Malhotra",
      budget: "₹4,50,000",
      escrowLocked: true,
      shootDates: "15 Jun - 28 Jun 2026",
      location: "Mumbai & London",
      submittedTime: "14 mins ago",
      urgent: true,
      status: "PENDING"
    },
    {
      id: "OPP-9403",
      title: "Pan-India Web Series - Supporting Antagonist",
      productionHouse: "Excel Entertainment",
      director: "Farhan Akhtar",
      budget: "₹2,80,000",
      escrowLocked: true,
      shootDates: "02 Jul - 18 Jul 2026",
      location: "Hyderabad Studio",
      submittedTime: "45 mins ago",
      urgent: false,
      status: "PENDING"
    },
    {
      id: "OPP-9404",
      title: "Commercial TVC - Primary Brand Ambassador",
      productionHouse: "Ogilvy & Red Chillies Ads",
      director: "Pooja Shetty",
      budget: "₹3,50,000",
      escrowLocked: true,
      shootDates: "22 Jun 2026 (1 Day)",
      location: "Bangalore",
      submittedTime: "2 hours ago",
      urgent: true,
      status: "PENDING"
    },
    {
      id: "OPP-9405",
      title: "Music Video - Classical Dance Lead",
      productionHouse: "T-Series Music Works",
      director: "Remo D'Souza",
      budget: "₹1,20,000",
      escrowLocked: true,
      shootDates: "10 Jul 2026",
      location: "Goa Beachfront",
      submittedTime: "4 hours ago",
      urgent: false,
      status: "PENDING"
    }
  ]);

  const [kycQueue, setKycQueue] = useState([
    {
      id: "KYC-301",
      name: "Rohan Varma",
      craft: "Actor • Theatre & Screen",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
      docType: "Aadhaar Card (UIDAI)",
      docNumber: "•••• •••• 8912",
      city: "Mumbai, Maharashtra",
      submitted: "28 mins ago",
      status: "PENDING"
    },
    {
      id: "KYC-302",
      name: "Ananya Sen",
      craft: "Fashion Model & Influencer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      docType: "Indian Passport",
      docNumber: "Z•••••41",
      city: "Kolkata, West Bengal",
      submitted: "1 hour ago",
      status: "PENDING"
    },
    {
      id: "KYC-303",
      name: "Kabir Khan",
      craft: "Playback Singer & Composer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      docType: "CINTAA Cine Artists Guild ID",
      docNumber: "CINTAA-9942",
      city: "Delhi NCR",
      submitted: "3 hours ago",
      status: "PENDING"
    }
  ]);

  const [escrowReleases, setEscrowReleases] = useState([
    {
      id: "ESC-8812",
      project: "Web Series 'Mirage' - Ep 1-4 Complete",
      productionHouse: "Netflix India & Dharma",
      talentName: "Vikrant Massey",
      amount: "₹2,50,000",
      milestone: "Shoot Wrap Signed by Director",
      bankAccount: "HDFC Bank •••• 4019",
      status: "AWAITING_RELEASE"
    },
    {
      id: "ESC-8813",
      project: "Fashion Lookbook Spring 2026",
      productionHouse: "Vogue India & Lakme",
      talentName: "Mira Rajput",
      amount: "₹1,25,000",
      milestone: "Final Retouched Assets Delivered",
      bankAccount: "ICICI Bank •••• 9102",
      status: "AWAITING_RELEASE"
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: "LOG-5510",
      event: "Super Admin Screen Approval",
      details: "Notice 'Feature Film - Lead Male' published to talent marketplace.",
      actor: "Vikram Malhotra (Super Admin)",
      ip: "103.21.12.84",
      time: "Just now"
    },
    {
      id: "LOG-5509",
      event: "Escrow Deposit Verified",
      details: "Dharma Productions locked ₹4,50,000 in escrow vault for OPP-9402.",
      actor: "Automated Banking Gateway",
      ip: "System Cluster",
      time: "12 mins ago"
    },
    {
      id: "LOG-5508",
      event: "KYC Document Submitted",
      details: "Talent Rohan Varma submitted Aadhaar verification documents.",
      actor: "Rohan Varma",
      ip: "49.36.128.14",
      time: "28 mins ago"
    },
    {
      id: "LOG-5507",
      event: "RBAC Matrix Verified",
      details: "Routine security audit across all 11 feature modules completed successfully.",
      actor: "Security Daemon",
      ip: "Internal VPC",
      time: "1 hour ago"
    }
  ]);

  // Actions
  const handleApproveCasting = (id, title) => {
    setCastings(prev => prev.map(c => c.id === id ? { ...c, status: "APPROVED" } : c));
    showSuccess("Casting Approved!", `"${title}" is now LIVE on the public talent auditions feed.`);
    // Add to audit log
    setAuditLogs(prev => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        event: "Casting Approved",
        details: `Approved notice ${id} ("${title}")`,
        actor: "Vikram Malhotra (Super Admin)",
        ip: "103.21.12.84",
        time: "Just now"
      },
      ...prev
    ]);
  };

  const handleRejectCasting = (id, title) => {
    setCastings(prev => prev.map(c => c.id === id ? { ...c, status: "REJECTED" } : c));
    showWarning("Casting Rejected", `"${title}" has been flagged and returned to production house.`);
  };

  const handleVerifyKyc = (id, name) => {
    setKycQueue(prev => prev.map(k => k.id === id ? { ...k, status: "VERIFIED" } : k));
    showSuccess("KYC Badge Awarded!", `Blue Verified Rosette badge granted to ${name}.`);
  };

  const handleDisburseEscrow = (id, talent, amount) => {
    setEscrowReleases(prev => prev.map(e => e.id === id ? { ...e, status: "DISBURSED" } : e));
    showSuccess("Funds Disbursed!", `Payment of ${amount} released to ${talent}'s bank account.`);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] border border-slate-200">
      
      {/* Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        
        {/* Desk Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            type="button"
            onClick={() => onTabChange("castings")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeTab === "castings"
                ? "bg-[#fff1f8] text-[#ee008f] border-[#fbcfe8] shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Sparkles size={14} className={activeTab === "castings" ? "text-[#ee008f]" : "text-slate-400"} />
            <span>Casting Approvals</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === "castings" ? "bg-[#ee008f] text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {castings.filter(c => c.status === "PENDING").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("kyc")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeTab === "kyc"
                ? "bg-[#fff1f8] text-[#ee008f] border-[#fbcfe8] shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck size={14} className={activeTab === "kyc" ? "text-[#ee008f]" : "text-slate-400"} />
            <span>Talent KYC & Badges</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === "kyc" ? "bg-[#ee008f] text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {kycQueue.filter(k => k.status === "PENDING").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("escrow")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeTab === "escrow"
                ? "bg-[#ecfdf5] text-emerald-700 border-emerald-200 shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <DollarSign size={14} className={activeTab === "escrow" ? "text-emerald-600" : "text-slate-400"} />
            <span>Escrow Releases</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === "escrow" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {escrowReleases.filter(e => e.status === "AWAITING_RELEASE").length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("audit")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeTab === "audit"
                ? "bg-[#f0f9ff] text-blue-700 border-blue-200 shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <FileText size={14} className={activeTab === "audit" ? "text-blue-600" : "text-slate-400"} />
            <span>Audit Trail</span>
          </button>

        </div>

        {/* Search & Filter Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ee008f]"
          />
          <Search size={14} className="text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

      </div>

      {/* Desk Body Content */}
      <div className="pt-5 space-y-4">
        
        {/* ============================================================ */}
        {/* TAB 1: CASTING APPROVALS QUEUE */}
        {/* ============================================================ */}
        {activeTab === "castings" && (
          <div className="space-y-3.5">
            {castings
              .filter(c => !searchFilter || c.title.toLowerCase().includes(searchFilter.toLowerCase()) || c.productionHouse.toLowerCase().includes(searchFilter.toLowerCase()))
              .map((c) => (
                <div 
                  key={c.id} 
                  className={`p-4 rounded-2xl border transition-all duration-200 ${
                    c.status === "APPROVED"
                      ? "bg-emerald-50/40 border-emerald-200"
                      : c.status === "REJECTED"
                      ? "bg-rose-50/40 border-rose-200 opacity-60"
                      : "bg-[#fbfcfe] hover:bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Info */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {c.id}
                        </span>
                        {c.urgent && c.status === "PENDING" && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Urgent Review
                          </span>
                        )}
                        {c.status === "APPROVED" && (
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            ✓ Published Live
                          </span>
                        )}
                        {c.status === "REJECTED" && (
                          <span className="text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                            ✕ Rejected
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          Submitted {c.submittedTime}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#0f172a] m-0">
                        {c.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        <span>🎬 <strong>{c.productionHouse}</strong> ({c.director})</span>
                        <span>📍 {c.location}</span>
                        <span>📅 {c.shootDates}</span>
                      </div>
                    </div>

                    {/* Right: Budget + Escrow Badge + Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      
                      <div className="text-right pr-2">
                        <div className="text-sm font-black text-[#0f172a]">
                          {c.budget}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 justify-end">
                          <CheckCircle2 size={11} /> Escrow Verified
                        </div>
                      </div>

                      {c.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveCasting(c.id, c.title)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 border-none"
                          >
                            <Check size={14} />
                            <span>Approve & Publish</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectCasting(c.id, c.title)}
                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-slate-400 italic">
                          Action completed
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TALENT KYC & BADGES */}
        {/* ============================================================ */}
        {activeTab === "kyc" && (
          <div className="space-y-3.5">
            {kycQueue.map((k) => (
              <div 
                key={k.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  k.status === "VERIFIED"
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-[#fbfcfe] hover:bg-white border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={k.avatar}
                      alt={k.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-[#0f172a] m-0">
                          {k.name}
                        </h4>
                        {k.status === "VERIFIED" ? (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            ✓ Blue Rosette Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-pink-50 text-[#ee008f] border border-pink-200 px-2 py-0.5 rounded-full">
                            Identity Pending
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {k.craft} &bull; {k.city}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Submitted: <strong>{k.docType}</strong> ({k.docNumber}) &bull; {k.submitted}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {k.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleVerifyKyc(k.id, k.name)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ee008f] to-[#7c3aed] text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 border-none"
                        >
                          <ShieldCheck size={14} />
                          <span>Award Verified Rosette</span>
                        </button>

                        <button
                          type="button"
                          className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                        >
                          Inspect Document
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Verified by Vikram M.
                      </span>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ESCROW MILESTONE RELEASES */}
        {/* ============================================================ */}
        {activeTab === "escrow" && (
          <div className="space-y-3.5">
            {escrowReleases.map((e) => (
              <div 
                key={e.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  e.status === "DISBURSED"
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-[#fbfcfe] hover:bg-white border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {e.id}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        🔒 Locked in Vault
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0f172a] m-0">
                      {e.project}
                    </h4>

                    <div className="text-xs text-slate-500 font-medium">
                      Payee: <strong>{e.talentName}</strong> &bull; Client: {e.productionHouse}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Milestone: {e.milestone} &bull; Target: {e.bankAccount}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-[#0f172a]">
                        {e.amount}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        100% Milestone Escrow
                      </div>
                    </div>

                    {e.status === "AWAITING_RELEASE" ? (
                      <button
                        type="button"
                        onClick={() => handleDisburseEscrow(e.id, e.talentName, e.amount)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/25 hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 border-none"
                      >
                        <DollarSign size={14} />
                        <span>Authorize Release</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Funds Disbursed to Bank
                      </span>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: AUDIT TRAIL */}
        {/* ============================================================ */}
        {activeTab === "audit" && (
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#ee008f]">
                      {log.id}
                    </span>
                    <strong className="text-xs font-bold text-[#0f172a]">
                      {log.event}
                    </strong>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      IP: {log.ip}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    {log.details}
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Actor: {log.actor} &bull; {log.time}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 shrink-0">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
