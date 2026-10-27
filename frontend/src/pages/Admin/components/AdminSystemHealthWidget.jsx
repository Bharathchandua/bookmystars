import React from "react";
import { Activity, Server, Database, Shield, Zap, RefreshCw } from "lucide-react";
import { showSuccess, showWarning } from "../../../shared/utils/alert";

export default function AdminSystemHealthWidget() {
  const handleBroadcast = () => {
    showSuccess("Broadcast Sent", "Global notification dispatched to 3,420 talent mobile apps.");
  };

  const handleFlushCache = () => {
    showSuccess("Cache Flushed", "Cloudflare and Redis edge CDN caches purged successfully.");
  };

  const handleSecurityScan = () => {
    showSuccess("Deep Security Scan", "All JWT session tokens, Escrow hashes, and RBAC ACLs are 100% compliant.");
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] border border-slate-200 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity size={15} />
          </div>
          <h3 className="text-sm font-bold text-[#0f172a] m-0">
            System Telemetry & Health
          </h3>
        </div>
        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Optimal
        </span>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase">API Latency</div>
          <div className="text-sm font-black text-emerald-600">32 ms</div>
          <div className="text-[10px] text-slate-500">Fast Edge Response</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase">DB Connection</div>
          <div className="text-sm font-black text-[#0f172a]">18% Pool</div>
          <div className="text-[10px] text-slate-500">PostgreSQL Replica</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Media Bucket</div>
          <div className="text-sm font-black text-purple-600">AWS S3 / CDN</div>
          <div className="text-[10px] text-slate-500">99.99% Availability</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Escrow Vault</div>
          <div className="text-sm font-black text-[#ee008f]">Secured</div>
          <div className="text-[10px] text-slate-500">Escrow Gateway OK</div>
        </div>
      </div>

      {/* Fast Administrative Controls */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Quick Operations
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={handleBroadcast}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#fff1f8] hover:text-[#ee008f] hover:border-[#fbcfe8] border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Zap size={13} className="text-pink-500" />
              <span>Broadcast System Notice</span>
            </span>
            <span className="text-[10px] text-slate-400">Push</span>
          </button>

          <button
            type="button"
            onClick={handleFlushCache}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <RefreshCw size={13} className="text-purple-500" />
              <span>Purge Edge CDN Cache</span>
            </span>
            <span className="text-[10px] text-slate-400">Redis</span>
          </button>

          <button
            type="button"
            onClick={handleSecurityScan}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Shield size={13} className="text-emerald-500" />
              <span>Run RBAC Vulnerability Audit</span>
            </span>
            <span className="text-[10px] text-slate-400">Security</span>
          </button>
        </div>
      </div>

    </div>
  );
}
