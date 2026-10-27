import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Megaphone,
  CheckCircle2,
  Plus,
  Clock,
  Eye,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  UserCheck
} from "lucide-react";
import { getStoredUser, logoutUser } from "../../features/bms/api/auth/authApi";
import { showSuccess } from "../../shared/utils/alert";

export default function PartnerDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || {});
  const [showPostReqModal, setShowPostReqModal] = useState(false);
  const [requirementsList, setRequirementsList] = useState(() => {
    const saved = localStorage.getItem("bms_partner_requirements");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 1,
        title: "20 Professional Dancers Recruitment Call",
        category: "Dance Academy",
        batch: "Summer Intake Batch 2026",
        description: "Recruiting 20 intermediate and advanced contemporary dancers for our Mumbai studio batch. Targeted digital ads active across Maharashtra.",
        positionsNeeded: 20,
        status: "Active Ad Campaign",
        impressions: 14250,
        clicks: 842,
        applicantsCount: 38,
        createdAt: "2026-10-20"
      },
      {
        id: 2,
        title: "Lead Choreographer & 6 Acrobatic Breakers",
        category: "Dance Academy",
        batch: "National Championship Showcase",
        description: "Seeking 1 lead choreographer with international experience and 6 acrobatic breakers for national competition showcase.",
        positionsNeeded: 7,
        status: "Review with Marketing",
        impressions: 6180,
        clicks: 310,
        applicantsCount: 14,
        createdAt: "2026-10-24"
      }
    ];
  });

  const [newReq, setNewReq] = useState({
    title: "",
    category: "Dance Academy",
    batch: "",
    positionsNeeded: 10,
    description: "",
    auditionDate: ""
  });

  useEffect(() => {
    const u = getStoredUser();
    if (u) setCurrentUser(u);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/signin");
  };

  const handleCreateRequirement = (e) => {
    e.preventDefault();
    if (!newReq.title.trim() || !newReq.description.trim()) return;

    const created = {
      id: Date.now(),
      title: newReq.title.trim(),
      category: newReq.category,
      batch: newReq.batch.trim() || "Immediate Requirement",
      description: newReq.description.trim(),
      positionsNeeded: Number(newReq.positionsNeeded) || 1,
      status: "Submitted to Ad Operations",
      impressions: 0,
      clicks: 0,
      applicantsCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };

    const updated = [created, ...requirementsList];
    setRequirementsList(updated);
    localStorage.setItem("bms_partner_requirements", JSON.stringify(updated));
    setShowPostReqModal(false);
    setNewReq({
      title: "",
      category: "Dance Academy",
      batch: "",
      positionsNeeded: 10,
      description: "",
      auditionDate: ""
    });
    showSuccess("Requirement Published", "Your talent requirement has been logged and queued for BookMyStars ad promotion.");
  };

  const partnerName = currentUser?.fullName || "Academy Partner";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* 1. Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              ★
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base text-slate-900 m-0 tracking-tight">
                  {partnerName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={11} />
                  Super Admin Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 m-0">Official BMS Partner Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 hidden sm:inline-block">
              {currentUser.email || "partner@bookmystars.com"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* 2. "WHAT TO DO & HOW TO DO IT" GUIDE SECTION */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500/30 text-pink-200 border border-pink-400/40">
                Partner Operations Guide
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white m-0 mt-2 tracking-tight">
                What To Do & How To Partner With BookMyStars
              </h2>
            </div>
            <span className="text-xs text-purple-200 font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
              Official 4-Step Operational Flow
            </span>
          </div>

          <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed m-0">
            Welcome to your verified Partner Portal. As a verified academy partner, you can specify your requirements, request targeted ad campaigns, and recruit vetted talents directly from our platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="text-pink-400 font-black text-xs tracking-wider">STEP 01</div>
              <h3 className="font-black text-sm text-white m-0">Post Your Requirements</h3>
              <p className="text-xs text-slate-300 m-0 leading-relaxed">
                Specify number of performers, dance or acting discipline, intake batch dates, and age criteria.
              </p>
            </div>
            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="text-purple-400 font-black text-xs tracking-wider">STEP 02</div>
              <h3 className="font-black text-sm text-white m-0">BookMyStars Runs Ads</h3>
              <p className="text-xs text-slate-300 m-0 leading-relaxed">
                Our creative marketing team deploys targeted banner spots and notification blasts to 50,000+ artists.
              </p>
            </div>
            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="text-emerald-400 font-black text-xs tracking-wider">STEP 03</div>
              <h3 className="font-black text-sm text-white m-0">Review Applications</h3>
              <p className="text-xs text-slate-300 m-0 leading-relaxed">
                Pre-screened candidates apply directly to your desk with portfolios, media reels, and contact details.
              </p>
            </div>
            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
              <div className="text-amber-400 font-black text-xs tracking-wider">STEP 04</div>
              <h3 className="font-black text-sm text-white m-0">Admit & Scale</h3>
              <p className="text-xs text-slate-300 m-0 leading-relaxed">
                Shortlist top performers, schedule studio callbacks, and finalize your academy intake seamlessly.
              </p>
            </div>
          </div>
        </div>

        {/* 3. REQUIREMENTS & ADS CAMPAIGNS DESK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Requirements List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 m-0 tracking-tight">
                  My Academy Requirements & Ad Campaigns
                </h2>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Track requirements being promoted by BookMyStars marketing team
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPostReqModal(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus size={15} />
                <span>Post Requirement</span>
              </button>
            </div>

            {requirementsList.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3.5"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {req.category}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Batch: {req.batch}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 m-0 mt-1">
                      {req.title}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    req.status.includes("Active")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-purple-50 text-purple-700 border-purple-200"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${req.status.includes("Active") ? "bg-emerald-500 animate-pulse" : "bg-purple-500"}`}></span>
                    {req.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 m-0">
                  {req.description}
                </p>

                <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Targeted Ad Reach</div>
                    <div className="text-base font-black text-slate-900 mt-0.5">
                      {req.impressions > 0 ? req.impressions.toLocaleString() : "Launching"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Audition Clicks</div>
                    <div className="text-base font-black text-purple-600 mt-0.5">
                      {req.clicks > 0 ? req.clicks.toLocaleString() : "Tracking"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Received Applicants</div>
                    <div className="text-base font-black text-pink-600 mt-0.5">
                      {req.applicantsCount} Applied
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Intake Target: <strong>{req.positionsNeeded} Talents</strong></span>
                  <button
                    type="button"
                    onClick={() => showSuccess("Applicants Desk", `Opening application queue for ${req.title}`)}
                    className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Candidate Applications</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Col: Dedicated BMS Manager & Ad Support */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-100 to-purple-100 text-purple-700 font-black flex items-center justify-center text-sm border border-purple-200">
                  BMS
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 m-0">Dedicated Partner Officer</h3>
                  <p className="text-xs text-slate-500 m-0">BookMyStars Operations Desk</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed m-0">
                Your academy is assigned a dedicated Account Officer to customize your ad reach, schedule audition spaces, and filter applicant rosters.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400" />
                  <span className="font-mono">+91 22 4589 1200</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" />
                  <span className="font-mono">partners@bookmystars.com</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showSuccess("Support Notified", "Your Account Manager has been notified and will contact you via WhatsApp.")}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Request Custom Ad Campaign &rarr;
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-tr from-pink-50 to-purple-50 border border-pink-200/80 space-y-3">
              <div className="flex items-center gap-2 text-pink-700 font-black text-xs uppercase tracking-wider">
                <Award size={15} />
                <span>Verified Academy Seal</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 m-0">
                Super Admin Gatekeeper Status
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed m-0">
                Your academy carries verified partner accreditation. Performers across India can apply to your calls with zero barrier to entry.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Post Requirement Modal */}
      {showPostReqModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-black text-slate-900 m-0">Post New Academy Requirement</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">Define your intake needs for BookMyStars to run targeted ads</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPostReqModal(false)}
                className="text-slate-400 hover:text-slate-700 font-black text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={newReq.title}
                  onChange={(e) => setNewReq({ ...newReq, title: e.target.value })}
                  placeholder="e.g. Summer Batch Contemporary Dancers Recruitment"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discipline</label>
                  <select
                    value={newReq.category}
                    onChange={(e) => setNewReq({ ...newReq, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option>Dance Academy</option>
                    <option>Acting School</option>
                    <option>Music Studio</option>
                    <option>Modeling Agency</option>
                    <option>Production House</option>
                    <option>Other Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Positions Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newReq.positionsNeeded}
                    onChange={(e) => setNewReq({ ...newReq, positionsNeeded: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intake Batch / Project Name</label>
                <input
                  type="text"
                  value={newReq.batch}
                  onChange={(e) => setNewReq({ ...newReq, batch: e.target.value })}
                  placeholder="e.g. Batch July 2026 / Feature Showcase"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Scope & Ad Brief *</label>
                <textarea
                  rows={3}
                  required
                  value={newReq.description}
                  onChange={(e) => setNewReq({ ...newReq, description: e.target.value })}
                  placeholder="Describe talent criteria, dance/acting style, audition location, age group..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPostReqModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Publish & Request BMS Ads
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
