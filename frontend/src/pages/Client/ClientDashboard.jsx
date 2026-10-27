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
  UserCheck,
  Gem,
  Wrench,
  Shirt,
  Cpu,
  Clapperboard,
  Sparkles,
  Video,
  Share2,
  Download,
  Star
} from "lucide-react";
import { getStoredUser, logoutUser } from "../../features/bms/api/auth/authApi";
import { showSuccess } from "../../shared/utils/alert";

const SAMPLE_TALENTS = [
  {
    id: 101,
    name: "Rhea Sharma",
    category: "High-Fashion & Jewelry Model",
    experience: "5+ Years",
    location: "Mumbai",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    tags: ["Bridal Jewelry", "Editorial", "Runway", "Commercials"]
  },
  {
    id: 102,
    name: "Vikram Malhotra",
    category: "Commercial Actor & Brand Presenter",
    experience: "7+ Years",
    location: "Bengaluru",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    tags: ["Product Demos", "Hardware Ads", "TV Commercials", "Voiceover"]
  },
  {
    id: 103,
    name: "Aanya Verma",
    category: "Glamour & Lifestyle Model",
    experience: "4 Years",
    location: "New Delhi",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    tags: ["Jewelry Shoots", "Ethnic Wear", "Digital Ads"]
  },
  {
    id: 104,
    name: "Karan Singhal",
    category: "Character Actor & Narrator",
    experience: "6 Years",
    location: "Mumbai",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    tags: ["Machinery Demos", "Corporate Promos", "Storytelling"]
  }
];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || {});
  const [activeTab, setActiveTab] = useState("CAMPAIGNS"); // CAMPAIGNS | TALENT | PRODUCTION
  const [showPostReqModal, setShowPostReqModal] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [talentSearch, setTalentSearch] = useState("");
  const [talentCategoryFilter, setTalentCategoryFilter] = useState("ALL");

  const [campaignsList, setCampaignsList] = useState(() => {
    const saved = localStorage.getItem("bms_client_campaigns");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 1,
        title: "Diwali Festive Gold & Diamond Jewelry Video Commercial",
        industry: "Jewelry & Luxury",
        scope: "4 Female Models, 2 Male Actors • 4K Video Ad & Billboard Shoot",
        description: "High-gloss festive commercial showcasing our signature diamond necklaces and bridal temple gold jewelry. Ad running across OTT networks and national billboards.",
        status: "Production In Progress",
        stage: "Shooting & Color Grading",
        impressions: "420,000",
        clicks: "18,400",
        applicantsCount: 26,
        createdAt: "2026-10-18"
      },
      {
        id: 2,
        title: "Smart Power Tools Line • Social Media Demonstration Ads",
        industry: "Hardware & Manufacturing",
        scope: "2 Product Presenters, 1 Voiceover Artist",
        description: "Engaging 45-second product demonstration videos explaining safety and torque features for our cordless drill range. Multi-channel YouTube & Instagram ad blitz.",
        status: "Casting & Shortlisting",
        stage: "Applicant Screen Tests",
        impressions: "95,000",
        clicks: "4,200",
        applicantsCount: 14,
        createdAt: "2026-10-23"
      }
    ];
  });

  const [newCampaign, setNewCampaign] = useState({
    title: "",
    industry: "Jewelry & Luxury",
    scope: "",
    description: "",
    targetDate: ""
  });

  useEffect(() => {
    const u = getStoredUser();
    if (u) setCurrentUser(u);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/signin");
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newCampaign.title.trim() || !newCampaign.description.trim()) return;

    const created = {
      id: Date.now(),
      title: newCampaign.title.trim(),
      industry: newCampaign.industry,
      scope: newCampaign.scope.trim() || "Commercial Ad Project",
      description: newCampaign.description.trim(),
      status: "Submitted to Ad Production",
      stage: "Brief Review & Scripting",
      impressions: "0",
      clicks: "0",
      applicantsCount: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };

    const updated = [created, ...campaignsList];
    setCampaignsList(updated);
    localStorage.setItem("bms_client_campaigns", JSON.stringify(updated));

    setShowPostReqModal(false);
    setNewCampaign({
      title: "",
      industry: "Jewelry & Luxury",
      scope: "",
      description: "",
      targetDate: ""
    });

    showSuccess("Campaign Created", "Your ad brief and artist requirement have been posted to BookMyStars production operations!");
  };

  const toggleShortlist = (id) => {
    if (shortlistedIds.includes(id)) {
      setShortlistedIds(shortlistedIds.filter(x => x !== id));
      showSuccess("Shortlist Updated", "Artist removed from campaign shortlist.");
    } else {
      setShortlistedIds([...shortlistedIds, id]);
      showSuccess("Artist Shortlisted", "Artist added to your active commercial campaign shortlist!");
    }
  };

  const brandName = currentUser?.fullName || "Tanishq Fine Jewelry & Diamonds";
  const brandEmail = currentUser?.email || "brand@tanishq-jewels.com";
  const brandIndustry = currentUser?.customProfession || "Commercial Client Brand";

  const filteredTalents = SAMPLE_TALENTS.filter(t => {
    if (talentCategoryFilter !== "ALL" && !t.tags.some(tag => tag.toLowerCase().includes(talentCategoryFilter.toLowerCase()))) {
      return false;
    }
    if (talentSearch.trim()) {
      const q = talentSearch.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.location.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* 1. TOP CORPORATE HEADER BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">{brandName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-200">
                  Verified Client
                </span>
              </div>
              <div className="text-[11px] text-slate-500">{brandEmail}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPostReqModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs font-black shadow-sm transition cursor-pointer"
            >
              <Plus size={15} /> Commission New Ad / Casting
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition cursor-pointer"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CLIENT WORKSPACE BODY */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* HERO BANNER: Corporate Overview */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-pink-500/20 text-pink-300 border border-pink-400/30 mb-3">
              <Sparkles size={13} /> Commercial Client Operations Portal
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white m-0">
              Welcome back, {brandName}
            </h1>
            <p className="text-sm text-purple-200/80 mt-2 leading-relaxed">
              Manage your commercial advertisement campaigns, commission high-gloss video productions (script, shoot, edit & VFX), and discover top verified models, actors, and brand presenters for your product promotions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
            <div>
              <div className="text-[11px] font-black uppercase text-pink-300">Live Ad Campaigns</div>
              <div className="text-2xl font-black mt-1 text-white">{campaignsList.length} Active</div>
            </div>
            <div>
              <div className="text-[11px] font-black uppercase text-pink-300">Total Ad Impressions</div>
              <div className="text-2xl font-black mt-1 text-pink-400">515,000+</div>
            </div>
            <div>
              <div className="text-[11px] font-black uppercase text-pink-300">Audition Applicants</div>
              <div className="text-2xl font-black mt-1 text-white">40 Artists</div>
            </div>
            <div>
              <div className="text-[11px] font-black uppercase text-pink-300">Shortlisted Talents</div>
              <div className="text-2xl font-black mt-1 text-emerald-400">{shortlistedIds.length} Shortlisted</div>
            </div>
          </div>
        </div>

        {/* 3. FOUR-STEP WORKFLOW GUIDE */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <Clapperboard size={18} className="text-pink-600" /> How Your Commercial Workflow Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center mb-2">
                01
              </div>
              <h3 className="text-xs font-black text-slate-900 m-0">Submit Ad Brief</h3>
              <p className="text-[11.5px] text-slate-500 mt-1 leading-normal">
                Define your brand campaign goals (e.g. festive jewelry video, power tool demo) and required artists.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center mb-2">
                02
              </div>
              <h3 className="text-xs font-black text-slate-900 m-0">Artist Discovery & Casting</h3>
              <p className="text-[11.5px] text-slate-500 mt-1 leading-normal">
                Search verified talent roster, review lookbooks, or receive audition screen tests directly.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center mb-2">
                03
              </div>
              <h3 className="text-xs font-black text-slate-900 m-0">Commercial Production</h3>
              <p className="text-[11.5px] text-slate-500 mt-1 leading-normal">
                BookMyStars handles studio shoot, 4K camera gear, lighting, color grading, sound, and VFX.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center mb-2">
                04
              </div>
              <h3 className="text-xs font-black text-slate-900 m-0">Multi-Channel Release</h3>
              <p className="text-[11.5px] text-slate-500 mt-1 leading-normal">
                Your ad is distributed across OTT platforms, YouTube, social channels, and media networks.
              </p>
            </div>
          </div>
        </div>

        {/* 4. MAIN INTERACTIVE TABS */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("CAMPAIGNS")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === "CAMPAIGNS"
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Megaphone size={14} /> Commercial Ad Campaigns ({campaignsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("TALENT")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === "TALENT"
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users size={14} /> Artist & Model Discovery ({SAMPLE_TALENTS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PRODUCTION")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              activeTab === "PRODUCTION"
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Video size={14} /> Production & Publishing Pipeline
          </button>
        </div>

        {/* TAB 1: CAMPAIGNS LIST */}
        {activeTab === "CAMPAIGNS" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 m-0">Your Active Commercial Briefs</h3>
              <button
                type="button"
                onClick={() => setShowPostReqModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                <Plus size={14} /> Post Another Brief
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {campaignsList.map((c) => (
                <div
                  key={c.id}
                  className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-50 text-pink-800 border border-pink-200">
                        {c.industry}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Clock size={12} /> {c.status}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 m-0">{c.title}</h4>
                    <div className="text-xs font-bold text-purple-700 mt-1">{c.scope}</div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.description}</p>

                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div>
                        <span className="font-extrabold text-slate-900">Current Phase:</span> {c.stage}
                      </div>
                      <div className="font-mono text-slate-500">{c.createdAt}</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Impressions</span>
                        <span className="font-black text-slate-800">{c.impressions}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicants</span>
                        <span className="font-black text-pink-600">{c.applicantsCount} Artists</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("TALENT")}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                    >
                      Review Auditions &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: TALENT DISCOVERY */}
        {activeTab === "TALENT" && (
          <div className="space-y-6">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                {["ALL", "Jewelry", "Hardware", "Commercials"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTalentCategoryFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      talentCategoryFilter === f
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f === "ALL" ? "All Talent" : f}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search artist name, category, or city..."
                  value={talentSearch}
                  onChange={(e) => setTalentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredTalents.map((t) => {
                const isShortlisted = shortlistedIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-56 w-full relative overflow-hidden bg-slate-100">
                        <img
                          src={t.image}
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-lg text-xs font-black text-slate-900 flex items-center gap-1">
                          <Star size={12} className="text-amber-500 fill-amber-500" /> {t.rating}
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="text-base font-black text-slate-900 m-0">{t.name}</h4>
                        <div className="text-xs text-purple-700 font-bold mt-0.5">{t.category}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{t.location} • {t.experience} Experience</div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {t.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        type="button"
                        onClick={() => toggleShortlist(t.id)}
                        className={`w-full py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          isShortlisted
                            ? "bg-emerald-600 text-white"
                            : "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-xs"
                        }`}
                      >
                        {isShortlisted ? (
                          <>
                            <CheckCircle2 size={14} /> Shortlisted
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Shortlist for Campaign
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTION PIPELINE */}
        {activeTab === "PRODUCTION" && (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 m-0">Live Ad Production Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1">
                Real-time milestone tracking of your commercial filming, editing, and ad distribution.
              </p>
            </div>

            <div className="space-y-6">
              {campaignsList.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 m-0">{c.title}</h4>
                      <span className="text-xs text-slate-500">{c.scope}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800">
                      {c.status}
                    </span>
                  </div>

                  {/* 5-Step Progress Bar */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {[
                      { step: "Briefing", done: true },
                      { step: "Casting Call", done: true },
                      { step: "Film Shoot", done: true },
                      { step: "Post & VFX", done: c.status.includes("Progress") },
                      { step: "Ad Release", done: false }
                    ].map((st, i) => (
                      <div key={i} className="text-center">
                        <div className={`h-2 rounded-full mb-1.5 ${st.done ? "bg-gradient-to-r from-pink-600 to-purple-600" : "bg-slate-200"}`} />
                        <span className={`text-[11px] font-bold ${st.done ? "text-slate-900" : "text-slate-400"}`}>
                          {st.step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* CREATE CAMPAIGN MODAL */}
      {showPostReqModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 m-0">Commission Brand Ad / Casting Brief</h3>
            <p className="text-xs text-slate-500 mt-1">
              Submit your project brief to BookMyStars. Our production team will align artist auditions and shoot schedules.
            </p>

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Gold Jewelry Video Commercial / Hardware Drill Demo"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
                  <select
                    value={newCampaign.industry}
                    onChange={(e) => setNewCampaign({ ...newCampaign, industry: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Jewelry & Luxury">Jewelry & Luxury</option>
                    <option value="Hardware & Manufacturing">Hardware & Manufacturing</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Tech & Electronics">Tech & Electronics</option>
                    <option value="FMCG & Consumer Goods">FMCG & Consumer Goods</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Corporate Brand">Corporate Brand</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Artists Scope</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Models, 2 Actors"
                    value={newCampaign.scope}
                    onChange={(e) => setNewCampaign({ ...newCampaign, scope: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Ad Brief & Look Requirements *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your product, commercial story, look preferences, and channels for ad distribution..."
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 resize-vertical"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPostReqModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                >
                  Submit Brief to Production
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
