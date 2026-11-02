import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  GraduationCap,
  ChevronDown,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Globe,
  Sliders,
  Filter,
  Layers,
  X,
  ExternalLink,
  ShieldCheck,
  Plus
} from "lucide-react";

export default function EntityContextSelectorBar({
  workspaceType = "CLIENT", // "CLIENT" | "PARTNER"
  entities = [],
  selectedEntity = null,
  onSelectEntity,
  onOpenFormBuilder,
  onOpenCampaigns
}) {
  const isClient = workspaceType === "CLIENT";
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isGlobal = !selectedEntity || selectedEntity.id === "global";

  // Filter entities by name or industry
  const filteredEntities = (entities || []).filter((item) => {
    const q = searchQuery.toLowerCase();
    const name = (item.companyName || item.businessName || item.fullName || "").toLowerCase();
    const ind = (item.industry || item.category || "").toLowerCase();
    return name.includes(q) || ind.includes(q);
  });

  const activeEntityName = isGlobal
    ? (isClient ? "All Corporate Brands (Global Platform Baseline)" : "All Accredited Academies (Global Baseline)")
    : (selectedEntity.companyName || selectedEntity.businessName || selectedEntity.fullName || "Selected Entity");

  const activeEntityIndustry = isGlobal
    ? (isClient ? "Cross-Industry Schema" : "All Arts & Crafts")
    : (selectedEntity.industry || selectedEntity.category || (isClient ? "Corporate Brand" : "Performing Arts Academy"));

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Side: Brand Context Pill & Selector Dropdown */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* Visual Avatar / Icon Badge */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 font-black shadow-xs ${
              isGlobal
                ? "bg-slate-100 text-slate-700 border border-slate-200"
                : isClient
                ? "bg-gradient-to-tr from-pink-600 to-purple-600 text-white shadow-pink-500/20"
                : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-500/20"
            }`}
          >
            {isGlobal ? (
              <Globe size={22} className="text-slate-600" />
            ) : isClient ? (
              "🏢"
            ) : (
              "🎭"
            )}
          </div>

          {/* Context Details with Interactive Dropdown Trigger */}
          <div className="relative min-w-0 flex-1" ref={dropdownRef}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {isClient ? "Operating Brand Context" : "Operating Academy Context"}
              </span>
              {isGlobal ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                  Global Baseline
                </span>
              ) : (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    selectedEntity.verificationStatus === "APPROVED" || selectedEntity.isApproved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <CheckCircle2 size={10} />
                  <span>{selectedEntity.verificationStatus || "Active"}</span>
                </span>
              )}
            </div>

            {/* Dropdown Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-left w-full group cursor-pointer focus:outline-none"
            >
              <div className="truncate">
                <span className="font-extrabold text-base text-slate-900 group-hover:text-pink-600 transition block truncate">
                  {activeEntityName}
                </span>
                <span className="text-xs text-slate-500 font-medium block truncate">
                  {activeEntityIndustry} {selectedEntity?.city ? `• ${selectedEntity.city}` : ""}
                </span>
              </div>
              <div className="p-1 rounded-lg bg-slate-100 group-hover:bg-pink-50 text-slate-500 group-hover:text-pink-600 transition shrink-0 ml-1">
                <ChevronDown size={16} />
              </div>
            </button>

            {/* Floating Dropdown Menu */}
            {isOpen && (
              <div className="absolute left-0 mt-2 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                {/* Search Bar inside Dropdown */}
                <div className="relative px-2 pt-1">
                  <Search size={14} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${isClient ? "brand or company" : "academy or studio"}...`}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white"
                    autoFocus
                  />
                </div>

                {/* Option 1: Global Baseline */}
                <div className="border-b border-slate-100 pb-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectEntity({ id: "global", name: "Global Platform Baseline" });
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                      isGlobal
                        ? "bg-slate-900 text-white font-bold"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={16} className={isGlobal ? "text-pink-400" : "text-slate-400"} />
                      <div>
                        <div className="font-bold">
                          {isClient ? "All Brands (Global Default Schema)" : "All Academies (Global Default Schema)"}
                        </div>
                        <div className={`text-[10px] ${isGlobal ? "text-slate-300" : "text-slate-400"}`}>
                          Applies as baseline for all post requirements
                        </div>
                      </div>
                    </div>
                    {isGlobal && <CheckCircle2 size={14} className="text-pink-400" />}
                  </button>
                </div>

                {/* Individual Companies / Academies List */}
                <div className="max-h-60 overflow-y-auto px-1 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    {isClient ? "Registered Corporate Brands" : "Accredited Academies"} ({filteredEntities.length})
                  </div>

                  {filteredEntities.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No matching {isClient ? "companies" : "academies"} found.
                    </div>
                  ) : (
                    filteredEntities.map((ent) => {
                      const isSelected = selectedEntity?.id === ent.id;
                      const entName = ent.companyName || ent.businessName || ent.fullName;
                      const entCategory = ent.industry || ent.category || (isClient ? "Brand" : "Academy");

                      return (
                        <button
                          key={ent.id}
                          type="button"
                          onClick={() => {
                            onSelectEntity(ent);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                            isSelected
                              ? isClient
                                ? "bg-pink-50 text-pink-900 border border-pink-200 font-bold"
                                : "bg-purple-50 text-purple-900 border border-purple-200 font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                              {(entName || "E").charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-slate-900 truncate">
                                {entName}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {entCategory} {ent.city ? `• ${ent.city}` : ""}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 ml-2">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                ent.verificationStatus === "APPROVED" || ent.isApproved
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {ent.verificationStatus || (ent.isApproved ? "Approved" : "Pending")}
                            </span>
                            {isSelected && (
                              <CheckCircle2
                                size={14}
                                className={isClient ? "text-pink-600" : "text-purple-600"}
                              />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action Pills for the Selected Context */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Quick Jump to Form Builder */}
          {onOpenFormBuilder && (
            <button
              type="button"
              onClick={onOpenFormBuilder}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isClient
                  ? "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
              }`}
              title="Edit Post Requirement Custom Fields Schema for this context"
            >
              <Sliders size={13} />
              <span>
                {isGlobal ? "Edit Global Schema" : `Edit ${activeEntityName.split(" ")[0]} Schema`}
              </span>
            </button>
          )}

          {/* Quick Jump to Live Shoot Briefs / Auditions */}
          {onOpenCampaigns && (
            <button
              type="button"
              onClick={onOpenCampaigns}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer border border-slate-200"
              title="View live campaigns or auditions for this context"
            >
              <Layers size={13} />
              <span>
                {isGlobal
                  ? (isClient ? "All Live Briefs" : "All Auditions")
                  : (isClient ? "Company Briefs" : "Academy Batches")}
              </span>
            </button>
          )}

          {/* If a specific company is selected, show 'Reset to Global' pill */}
          {!isGlobal && (
            <button
              type="button"
              onClick={() => onSelectEntity({ id: "global", name: "Global Platform Baseline" })}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Return to Global Baseline (All Brands)"
            >
              <X size={12} />
              <span>Reset Context</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
