import React, { useState } from "react";
import { X, Lock, Shield, Check, Save } from "lucide-react";
import { showSuccess } from "../../../shared/utils/alert";

export default function AdminRbacModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState("SUPER_ADMIN");

  const [permissions, setPermissions] = useState({
    "Talents & Profiles": { view: true, create: true, edit: true, delete: true },
    "Auditions & Castings": { view: true, create: true, edit: true, delete: true },
    "Media Moderation": { view: true, create: true, edit: true, delete: true },
    "Shoot Bookings": { view: true, create: true, edit: true, delete: false },
    "Escrow Financials": { view: true, create: true, edit: true, delete: false },
    "Disputes & Support": { view: true, create: true, edit: true, delete: true },
    "Audit Trail & Logs": { view: true, create: false, edit: false, delete: false },
    "RBAC Roles & Access": { view: true, create: true, edit: true, delete: true },
    "System Settings": { view: true, create: true, edit: true, delete: true },
  });

  const togglePermission = (module, act) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [act]: !prev[module][act]
      }
    }));
  };

  const handleSave = () => {
    showSuccess("RBAC Updated", `Permissions saved for role: ${selectedRole}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7c3aed] flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] m-0">
                RBAC Access Control Matrix
              </h3>
              <p className="text-xs text-slate-400 m-0">
                Configure module-level read, write, and approval privileges.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex items-center gap-2 pb-2">
          {["SUPER_ADMIN", "CONTENT_MODERATOR", "FINANCE_OFFICER", "CASTING_SCOUT"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedRole === role
                  ? "bg-[#fff1f8] text-[#ee008f] border-[#fbcfe8]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {role.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black sticky top-0 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3 text-center">View</th>
                <th className="py-2.5 px-3 text-center">Create</th>
                <th className="py-2.5 px-3 text-center">Edit / Approve</th>
                <th className="py-2.5 px-3 text-center">Delete / Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(permissions).map(([module, perms]) => (
                <tr key={module} className="hover:bg-slate-50/60 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {module}
                  </td>
                  {["view", "create", "edit", "delete"].map((act) => (
                    <td key={act} className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={perms[act]}
                        onChange={() => togglePermission(module, act)}
                        className="rounded text-[#ee008f] focus:ring-[#ee008f] cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ee008f] to-[#7c3aed] text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 border-none"
          >
            <Save size={14} />
            <span>Save Role Permissions</span>
          </button>
        </div>

      </div>
    </div>
  );
}
