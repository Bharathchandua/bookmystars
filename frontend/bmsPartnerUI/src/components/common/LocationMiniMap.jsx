import React, { useState } from "react";
import { MapPin, Maximize2, ExternalLink, X, Copy, Check, Navigation } from "lucide-react";

export default function LocationMiniMap({
  address = "Rajajinagar, Bengaluru, Karnataka",
  locationName = "Studio / Branch Address",
  theme = "pink" // "pink" | "purple" | "blue"
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanAddress = address || "Bengaluru, Karnataka";
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(cleanAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanAddress)}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const themeClasses = {
    pink: {
      pin: "text-pink-600",
      accent: "from-pink-600 to-rose-600",
      border: "hover:border-pink-300",
      pill: "bg-pink-50 text-pink-700 border-pink-200"
    },
    purple: {
      pin: "text-purple-600",
      accent: "from-purple-600 to-indigo-600",
      border: "hover:border-purple-300",
      pill: "bg-purple-50 text-purple-700 border-purple-200"
    },
    blue: {
      pin: "text-blue-600",
      accent: "from-blue-600 to-cyan-600",
      border: "hover:border-blue-300",
      pill: "bg-blue-50 text-blue-700 border-blue-200"
    }
  }[theme] || {
    pin: "text-pink-600",
    accent: "from-pink-600 to-rose-600",
    border: "hover:border-pink-300",
    pill: "bg-pink-50 text-pink-700 border-pink-200"
  };

  return (
    <div className="mt-2.5">
      {/* Mini Map Card Trigger */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`relative w-full h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer group transition-all duration-200 ${themeClasses.border} hover:shadow-md`}
        title="Click to view interactive full address map"
      >
        {/* Real Embedded Map preview (pointer-events-none so click bubbles to card) */}
        <iframe
          title="Studio Mini Map Preview"
          src={mapEmbedUrl}
          className="w-full h-full border-0 pointer-events-none opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          loading="lazy"
        />

        {/* Floating gradient badge overlay */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs border border-slate-200/80 shadow-xs flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-800">
          <MapPin size={12} className={themeClasses.pin} />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">{cleanAddress}</span>
        </div>

        {/* Floating Expand Button */}
        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-950 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md transition-all group-hover:scale-105">
          <Maximize2 size={11} />
          <span>Click to view map</span>
        </div>
      </div>

      {/* Expanded Interactive Map Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr ${themeClasses.accent} text-white shrink-0 shadow-xs`}>
                  <Navigation size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 m-0 tracking-tight truncate">
                    {locationName}
                  </h3>
                  <p className="text-xs text-slate-500 m-0 truncate">
                    Interactive Live Address & Location Map
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
                aria-label="Close Map"
              >
                <X size={16} />
              </button>
            </div>

            {/* Interactive Map Iframe */}
            <div className="relative w-full h-80 sm:h-96 bg-slate-100">
              <iframe
                title="Full Studio Location Map"
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                loading="eager"
                allowFullScreen
              />
            </div>

            {/* Modal Footer with Address Info & Actions */}
            <div className="p-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Confirmed Physical Address
                </div>
                <div className="text-xs font-bold text-slate-800 mt-0.5 break-words">
                  {cleanAddress}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy Address"}</span>
                </button>

                <a
                  href={externalMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r ${themeClasses.accent} text-white text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow transition`}
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
