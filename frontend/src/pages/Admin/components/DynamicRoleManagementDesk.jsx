import React, { useState, useEffect } from "react";
import { 
  Shield, 
  Key, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Search, 
  Lock, 
  Sparkles, 
  DollarSign, 
  Film, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Sliders,
  ChevronDown,
  Package,
  FolderPlus,
  Filter,
  Layers,
  Tag,
  CheckCheck
} from "lucide-react";
import PagesButton from "../../common/PagesButton";
import { 
  getDynamicRoles, 
  fetchDynamicRoles,
  saveDynamicRole, 
  deleteDynamicRole, 
  getStaffMembers, 
  fetchStaffMembers,
  assignStaffRole, 
  addStaffMember, 
  removeStaffMember,
  updateStaffPassword,
  SYSTEM_MODULES,
  getPermissionLot,
  saveDynamicPermissionToLot,
  deleteDynamicPermissionFromLot
} from "../../../features/bms/api/admin/adminApi";
import { showSuccess, showError, showWarning, confirmDelete } from "../../../shared/utils/alert";

export default function DynamicRoleManagementDesk() {
  const [activeSubTab, setActiveSubTab] = useState("roles"); // "roles" | "staff" | "simulator"
  const [roles, setRoles] = useState(getDynamicRoles());
  const [staff, setStaff] = useState(getStaffMembers());
  const [searchQuery, setSearchQuery] = useState("");

  // Permission Lot state
  const [permissionLot, setPermissionLot] = useState(() => getPermissionLot());
  const [roleModalTab, setRoleModalTab] = useState("matrix"); // "matrix" | "lot"
  const [lotSearchQuery, setLotSearchQuery] = useState("");
  const [lotSelectedCategory, setLotSelectedCategory] = useState("ALL");
  const [showCreatePermModal, setShowCreatePermModal] = useState(false);
  const [newPermFormData, setNewPermFormData] = useState({
    name: "",
    code: "",
    moduleId: "castings",
    category: "Casting",
    description: "",
    autoAssignToRole: true
  });

  // Role Edit / Create Modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleFormData, setRoleFormData] = useState({
    id: "",
    name: "",
    description: "",
    color: "#ee008f",
    permissions: {}
  });

  // Staff Add Modal state with Login ID and Password
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    password: "Staff@123",
    department: "Casting Operations",
    roleId: "ROLE_CASTING_DIRECTOR"
  });

  // Reset Password Modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [targetStaff, setTargetStaff] = useState(null);
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [showResetPasswordVal, setShowResetPasswordVal] = useState(false);

  // Simulator state
  const [simulatedRoleId, setSimulatedRoleId] = useState("ROLE_CASTING_DIRECTOR");

  const refreshData = async () => {
    try {
      const [fetchedRoles, fetchedStaff] = await Promise.all([
        fetchDynamicRoles(),
        fetchStaffMembers()
      ]);
      if (fetchedRoles && Array.isArray(fetchedRoles) && fetchedRoles.length > 0) {
        setRoles(fetchedRoles);
      } else {
        setRoles(getDynamicRoles());
      }
      if (fetchedStaff && Array.isArray(fetchedStaff) && fetchedStaff.length > 0) {
        setStaff(fetchedStaff);
      } else {
        setStaff(getStaffMembers());
      }
    } catch {
      setRoles(getDynamicRoles());
      setStaff(getStaffMembers());
    }
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    const handleLotUpdate = () => setPermissionLot(getPermissionLot());
    window.addEventListener("bms_roles_updated", handleUpdate);
    window.addEventListener("bms_staff_updated", handleUpdate);
    window.addEventListener("bms_lot_updated", handleLotUpdate);
    return () => {
      window.removeEventListener("bms_roles_updated", handleUpdate);
      window.removeEventListener("bms_staff_updated", handleUpdate);
      window.removeEventListener("bms_lot_updated", handleLotUpdate);
    };
  }, []);

  // Open Create Role Modal
  const handleOpenCreateRole = () => {
    const initialPerms = {};
    SYSTEM_MODULES.forEach(m => {
      initialPerms[m.id] = { view: true, create: false, edit: false, delete: false, approve: false };
    });
    setEditingRole(null);
    setRoleFormData({
      id: `ROLE_${Date.now().toString().slice(-6)}`,
      name: "",
      description: "",
      color: "#ee008f",
      permissions: initialPerms
    });
    setRoleModalTab("matrix");
    setLotSearchQuery("");
    setLotSelectedCategory("ALL");
    setShowRoleModal(true);
  };

  // Open Edit Role Modal
  const handleOpenEditRole = (role) => {
    setEditingRole(role);
    setRoleFormData({
      id: role.id,
      name: role.name,
      description: role.description,
      color: role.color || "#ee008f",
      permissions: JSON.parse(JSON.stringify(role.permissions || {}))
    });
    setRoleModalTab("matrix");
    setLotSearchQuery("");
    setLotSelectedCategory("ALL");
    setShowRoleModal(true);
  };

  // Toggle permission in role form (standard action)
  const handleTogglePermission = (moduleId, action) => {
    setRoleFormData(prev => {
      const modPerms = prev.permissions[moduleId] || { view: false, create: false, edit: false, delete: false, approve: false };
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: {
            ...modPerms,
            [action]: !modPerms[action]
          }
        }
      };
    });
  };

  // Toggle specific permission picked from Lot
  const handleToggleLotPermission = (moduleId, code) => {
    setRoleFormData(prev => {
      const modPerms = prev.permissions[moduleId] || {};
      const currentVal = Boolean(modPerms[code]);
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: {
            ...modPerms,
            [code]: !currentVal
          }
        }
      };
    });
  };

  // Select all permissions in filtered lot
  const handleSelectAllFilteredLot = (items) => {
    setRoleFormData(prev => {
      const updated = { ...prev.permissions };
      items.forEach(item => {
        if (!updated[item.moduleId]) updated[item.moduleId] = {};
        updated[item.moduleId][item.code] = true;
      });
      return { ...prev, permissions: updated };
    });
    showSuccess("Permissions Picked", `Added all ${items.length} permissions to "${roleFormData.name || 'Current Role'}".`);
  };

  // Clear all permissions in filtered lot
  const handleClearAllFilteredLot = (items) => {
    setRoleFormData(prev => {
      const updated = { ...prev.permissions };
      items.forEach(item => {
        if (updated[item.moduleId]) {
          updated[item.moduleId][item.code] = false;
        }
      });
      return { ...prev, permissions: updated };
    });
    showWarning("Permissions Removed", `Cleared ${items.length} permissions from role.`);
  };

  // Create new dynamic permission in Lot
  const handleCreateDynamicPermission = (e) => {
    e.preventDefault();
    if (!newPermFormData.name.trim()) {
      showError("Validation Error", "Please provide a permission name.");
      return;
    }
    const slug = (newPermFormData.code || newPermFormData.name).trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const created = saveDynamicPermissionToLot({
      ...newPermFormData,
      code: slug
    });

    if (newPermFormData.autoAssignToRole) {
      setRoleFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [created.moduleId]: {
            ...(prev.permissions[created.moduleId] || {}),
            [created.code]: true
          }
        }
      }));
    }

    setPermissionLot(getPermissionLot());
    showSuccess(
      "Permission Created in Lot!",
      `"${created.name}" (${created.moduleId}.${created.code}) added to system lot and enabled for this role.`
    );
    setShowCreatePermModal(false);
    setNewPermFormData({
      name: "",
      code: "",
      moduleId: "castings",
      category: "Casting",
      description: "",
      autoAssignToRole: true
    });
  };

  // Delete custom dynamic permission from Lot
  const handleDeleteDynamicPermission = async (permId, permName) => {
    const ok = await confirmDelete(permName, `Are you sure you want to delete custom permission "${permName}" from the Lot?`);
    if (!ok) return;
    deleteDynamicPermissionFromLot(permId);
    setPermissionLot(getPermissionLot());
    showSuccess("Permission Deleted", `Custom permission "${permName}" has been removed from the lot.`);
  };

  // Save Role
  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleFormData.name.trim()) {
      showError("Validation Error", "Please provide a valid name for the custom role.");
      return;
    }
    try {
      await saveDynamicRole(roleFormData);
      showSuccess("Role Saved!", `Role "${roleFormData.name}" persisted to database with dynamic permissions.`);
      setShowRoleModal(false);
      await refreshData();
    } catch (err) {
      showError("Save Failed", err.message || "Could not save role.");
    }
  };

  // Delete Role
  const handleDeleteRole = async (roleId, roleName) => {
    try {
      await deleteDynamicRole(roleId);
      showSuccess("Role Deleted", `Custom role "${roleName}" has been removed from database.`);
      await refreshData();
    } catch (err) {
      showError("Action Prohibited", err.message);
    }
  };

  // Clone Role
  const handleCloneRole = async (role) => {
    const cloned = {
      ...role,
      id: `ROLE_${Date.now().toString().slice(-6)}`,
      name: `${role.name} (Copy)`,
      isSystem: false,
      userCount: 0
    };
    try {
      await saveDynamicRole(cloned);
      showSuccess("Role Cloned", `Created duplicate of "${role.name}". You can now customize its permissions.`);
      await refreshData();
    } catch (err) {
      showError("Clone Failed", err.message);
    }
  };

  // Assign Role to Staff Member dynamically
  const handleAssignRole = async (staffId, newRoleId) => {
    try {
      await assignStaffRole(staffId, newRoleId);
      const targetRole = roles.find(r => r.id === newRoleId);
      showSuccess("Role Reassigned!", `Staff member dynamically assigned to "${targetRole?.name || 'New Role'}".`);
      await refreshData();
    } catch (err) {
      showError("Reassignment Failed", err.message || "Failed to update role assignment.");
    }
  };

  // Generate random strong password
  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pass = "";
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Bms@${pass}`;
  };

  // Add new staff member with dynamic login credentials
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffFormData.name || !staffFormData.email) {
      showError("Validation Error", "Please provide staff member name and corporate email.");
      return;
    }
    const cleanEmail = staffFormData.email.trim().toLowerCase();
    const finalPassword = staffFormData.password.trim() || "Staff@123";

    try {
      const created = await addStaffMember({
        ...staffFormData,
        email: cleanEmail,
        password: finalPassword
      });

      showSuccess(
        "Admin Officer Authorized!",
        `${created.name} (${created.email}) added to database. Password: "${finalPassword}". You can now log into /admin/login using these credentials.`
      );
      setShowStaffModal(false);
      setStaffFormData({
        name: "",
        email: "",
        password: "Staff@123",
        department: "Casting Operations",
        roleId: "ROLE_CASTING_DIRECTOR"
      });
      await refreshData();
    } catch (err) {
      showError("Creation Failed", err.message || "Failed to create administrator account.");
    }
  };

  // Open Reset Password Modal
  const handleOpenResetModal = (member) => {
    setTargetStaff(member);
    setResetPasswordInput("");
    setShowResetPasswordVal(false);
    setShowResetModal(true);
  };

  // Execute Password Reset
  const handleExecuteResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordInput || resetPasswordInput.length < 6) {
      showError("Validation Error", "Password must be at least 6 characters long.");
      return;
    }
    try {
      await updateStaffPassword(targetStaff.id, resetPasswordInput);
      showSuccess(
        "Password Reset Complete!",
        `Login password for ${targetStaff.name} (${targetStaff.email}) changed to: "${resetPasswordInput}".`
      );
      setShowResetModal(false);
      setTargetStaff(null);
      setResetPasswordInput("");
      await refreshData();
    } catch (err) {
      showError("Reset Failed", err.message || "Could not update password.");
    }
  };

  // Delete Staff Member
  const handleRemoveStaff = async (member) => {
    if (member.id === 1 || member.id === "STF-001" || member.email === "admin@bookmystars.com") {
      showError("Action Prohibited", "The master Super Admin account cannot be removed.");
      return;
    }
    const ok = await confirmDelete(member.name, `Are you sure you want to remove administrator ${member.name} (${member.email})?`);
    if (!ok) return;
    try {
      await removeStaffMember(member.id);
      showSuccess("Staff Removed", `Administrator account for ${member.name} has been removed from database.`);
      await refreshData();
    } catch (err) {
      showError("Deletion Failed", err.message || "Could not delete staff member.");
    }
  };

  const simulatedRole = roles.find(r => r.id === simulatedRoleId) || roles[0];

  // Derived state for Permission Lot browsing & filtering inside Role Creation / Edit Modal
  const allLotCategories = ["ALL", ...Array.from(new Set((permissionLot || []).map(p => p.category || "General")))];

  const filteredLotItems = (permissionLot || []).filter(item => {
    const matchesCategory = lotSelectedCategory === "ALL" || item.category === lotSelectedCategory;
    const matchesSearch = !lotSearchQuery.trim() ||
      item.name?.toLowerCase().includes(lotSearchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(lotSearchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(lotSearchQuery.toLowerCase()) ||
      item.moduleId?.toLowerCase().includes(lotSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeLotCount = (permissionLot || []).filter(p => Boolean(roleFormData.permissions?.[p.moduleId]?.[p.code])).length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(15,23,42,0.03)] border border-slate-200 space-y-6">
      
      {/* ─── Top Control Strip ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#fff1f8] text-[#ee008f] flex items-center justify-center font-black">
              <Shield size={18} />
            </span>
            <h2 className="text-xl font-black text-[#0f172a] m-0 tracking-tight">
              Dynamic Role & Permission Governance
            </h2>
          </div>
          <p className="text-xs text-slate-500 m-0 mt-1">
            Super Admin capability: dynamically create custom roles, toggle granular module permissions, and reassign team staff.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateRole}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ee008f] to-[#7c3aed] text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:opacity-95 transition cursor-pointer flex items-center gap-2 border-none"
          >
            <Plus size={15} />
            <span>Create Custom Role</span>
          </button>

          <button
            type="button"
            onClick={() => setShowStaffModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 border-none shadow-sm"
          >
            <Users size={15} />
            <span>Assign New Staff</span>
          </button>
        </div>
      </div>

      {/* ─── Sub-Tab Navigation Bar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab("roles")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              activeSubTab === "roles"
                ? "bg-[#fff1f8] text-[#ee008f] border-[#fbcfe8] shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>🔐 Dynamic Roles ({roles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("staff")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              activeSubTab === "staff"
                ? "bg-[#fff1f8] text-[#ee008f] border-[#fbcfe8] shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>👥 Staff Role Assignments ({staff.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("simulator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
              activeSubTab === "simulator"
                ? "bg-[#f5f3ff] text-[#7c3aed] border-purple-200 shadow-xs"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>🧪 Live Access Simulator</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-60">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${activeSubTab}...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#ee008f]"
          />
          <Search size={14} className="text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

      </div>

      {/* ─── TAB 1: DYNAMIC ROLES & PERMISSION MATRICES ─── */}
      {activeSubTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles
            .filter(r => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((role) => {
              const permCount = Object.values(role.permissions || {}).reduce((acc, p) => {
                return acc + Object.values(p || {}).filter(Boolean).length;
              }, 0);

              return (
                <div 
                  key={role.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-[#fbfcfe] hover:bg-white hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: role.color || "#ee008f" }} 
                          />
                          <h3 className="text-base font-extrabold text-[#0f172a] m-0">
                            {role.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {role.isSystem ? (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                              System Default
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-[#fff1f8] text-[#ee008f] border border-[#fbcfe8] px-2 py-0.5 rounded">
                              Custom Role
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-slate-400">
                            {role.userCount || 0} Staff Assigned
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                        {permCount} Privileges
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 m-0 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Module Permission Quick Chips */}
                    <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                      {SYSTEM_MODULES.slice(0, 5).map(m => {
                        const hasView = role.permissions?.[m.id]?.view;
                        const hasEdit = role.permissions?.[m.id]?.edit || role.permissions?.[m.id]?.approve;
                        return (
                          <span 
                            key={m.id}
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                              hasEdit 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                : hasView 
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <span>{m.name.split(" ")[0]}</span>
                            <span>{hasEdit ? "✓" : (hasView ? "Read" : "-")}</span>
                          </span>
                        );
                      })}
                      {SYSTEM_MODULES.length > 5 && (
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-500">
                          +{SYSTEM_MODULES.length - 5} More
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRole(role)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#fff1f8] hover:text-[#ee008f] text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      <span>Edit Permissions</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCloneRole(role)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Clone Role Matrix"
                      >
                        <Copy size={14} />
                      </button>

                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Custom Role"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ─── TAB 2: STAFF & USER ROLE ASSIGNMENTS ─── */}
      {activeSubTab === "staff" && (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10.5px] font-black border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Officer</th>
                <th className="py-3 px-4">Login ID (Corporate Email)</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Dynamic Role Assigned</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff
                .filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((member) => {
                  const currentRole = roles.find(r => r.id === member.roleId) || roles[0];

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition">
                      {/* Name + Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80";
                            }}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-[#0f172a] text-xs whitespace-nowrap">
                              {member.name}
                            </div>
                            <div className="text-[10.5px] text-slate-400 font-mono">
                              {member.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Login ID (Email) */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold border border-slate-200">
                          <span>{member.email}</span>
                        </div>
                      </td>

                      {/* Password */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Lock size={11} className="text-slate-400" />
                          <span>{member.password ? member.password : "••••••••"}</span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {member.department}
                      </td>

                      {/* DYNAMIC ROLE SELECTOR DROPDOWN */}
                      <td className="py-3 px-4">
                        <div className="relative inline-block">
                          <select
                            value={member.roleId}
                            onChange={(e) => handleAssignRole(member.id, e.target.value)}
                            disabled={member.id === 1 || member.id === "STF-001" || member.email === "admin@bookmystars.com"} // Protect Master Super Admin
                            className="pl-3 pr-8 py-1.5 rounded-xl text-xs font-bold border transition appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ee008f]"
                            style={{
                              backgroundColor: `${currentRole.color}15`,
                              color: currentRole.color,
                              borderColor: `${currentRole.color}40`
                            }}
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.id} className="text-[#0f172a] bg-white font-medium">
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="absolute right-2.5 top-2.5 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/90 text-[11px] font-extrabold tracking-wide shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>{member.status || "ACTIVE"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenResetModal(member)}
                            className="px-2.5 py-1 text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                            title="Reset Login Password"
                          >
                            <KeyRound size={12} />
                            <span>Reset Key</span>
                          </button>

                          {(member.id !== 1 && member.id !== "STF-001" && member.email !== "admin@bookmystars.com") ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveStaff(member)}
                              className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-200"
                            >
                              Remove
                            </button>
                          ) : (
                            <span className="text-[10.5px] font-bold text-slate-400 italic px-1">Master</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── TAB 3: LIVE ROLE ACCESS SIMULATOR ─── */}
      {activeSubTab === "simulator" && (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-[#0f172a] m-0">
                Live Privilege & UI Inspector
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Simulate what a staff member assigned to this role can view, execute, or disburse.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Simulate Role:</span>
              <select
                value={simulatedRoleId}
                onChange={(e) => setSimulatedRoleId(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-[#0f172a] cursor-pointer focus:outline-none focus:border-[#ee008f]"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Simulated Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SYSTEM_MODULES.map(m => {
              const perms = simulatedRole?.permissions?.[m.id] || {};
              const hasView = perms.view;
              const hasApprove = perms.approve || perms.edit;
              const hasDelete = perms.delete;

              return (
                <div 
                  key={m.id}
                  className={`p-4 rounded-xl border bg-white ${
                    hasView ? "border-slate-200" : "border-slate-100 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[#0f172a] m-0">
                      {m.name}
                    </h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      hasView ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400"
                    }`}>
                      {hasView ? "VISIBLE" : "HIDDEN"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>View & Inspect:</span>
                      <span className={hasView ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                        {hasView ? "✓ Allowed" : "✕ Denied"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Approve / Signoff:</span>
                      <span className={hasApprove ? "text-emerald-600 font-bold" : "text-slate-400"}>
                        {hasApprove ? "✓ Allowed" : "✕ Restricted"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Delete / Revoke:</span>
                      <span className={hasDelete ? "text-rose-600 font-bold" : "text-slate-400"}>
                        {hasDelete ? "✓ Permitted" : "✕ Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── ROLE CREATION / EDIT MODAL ─── */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-pink-50 text-[#ee008f] flex items-center justify-center">
                  <Key size={16} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a] m-0">
                    {editingRole ? `Edit Role: ${editingRole.name}` : "Create New Custom Role"}
                  </h3>
                  <p className="text-xs text-slate-400 m-0">
                    Configure granular permissions dynamically across all 9 platform subsystems.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer border-none bg-transparent"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Role Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    placeholder="e.g. Senior Casting Director North"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Badge Color Accent
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {["#ee008f", "#7c3aed", "#059669", "#d97706", "#0284c7"].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setRoleFormData({ ...roleFormData, color })}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          roleFormData.color === color ? "scale-125 ring-2 ring-slate-800" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Role Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  placeholder="Outline responsibilities, audit duties, and scope of operations..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                />
              </div>

              {/* Dynamic Permissions Matrix & Lot Selector Strip */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-black text-slate-900 m-0">
                        Granular Module Permissions & Permission Lot
                      </label>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-100 text-[#ee008f]">
                        {activeLotCount} Active in Role
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 m-0 mt-0.5">
                      Pick from the system lot ({permissionLot.length} available), customize module checkboxes, or author new dynamic permissions.
                    </p>
                  </div>

                  {/* Switcher & Create Dynamic Perm Button */}
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-0.5 rounded-xl flex items-center gap-1 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setRoleModalTab("matrix")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-none ${
                          roleModalTab === "matrix"
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-500 hover:text-slate-800 bg-transparent"
                        }`}
                      >
                        <Layers size={13} />
                        <span>Matrix</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRoleModalTab("lot")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border-none ${
                          roleModalTab === "lot"
                            ? "bg-white text-[#ee008f] shadow-xs"
                            : "text-slate-500 hover:text-slate-800 bg-transparent"
                        }`}
                      >
                        <Package size={13} />
                        <span>Browse Lot ({permissionLot.length})</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCreatePermModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ee008f] to-[#7c3aed] text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center gap-1.5 border-none"
                      title="Create a new dynamic permission and add it to the system lot"
                    >
                      <Plus size={13} />
                      <span>+ Create Dynamic Permission</span>
                    </button>
                  </div>
                </div>

                {/* ─── VIEW 1: MATRIX VIEW ─── */}
                {roleModalTab === "matrix" && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black sticky top-0 border-b border-slate-200 z-10">
                        <tr>
                          <th className="py-2.5 px-3">Subsystem Module</th>
                          <th className="py-2.5 px-3 text-center">View</th>
                          <th className="py-2.5 px-3 text-center">Create</th>
                          <th className="py-2.5 px-3 text-center">Edit</th>
                          <th className="py-2.5 px-3 text-center">Approve</th>
                          <th className="py-2.5 px-3 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {SYSTEM_MODULES.map(m => {
                          const current = roleFormData.permissions?.[m.id] || {};

                          // Extra permissions from the Lot belonging to this module
                          const extraLotPerms = permissionLot.filter(
                            p => p.moduleId === m.id && !["view", "create", "edit", "approve", "delete"].includes(p.code)
                          );

                          return (
                            <tr key={m.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-[#0f172a]">{m.name}</div>
                                <div className="text-[10px] text-slate-400">{m.description}</div>

                                {/* Dynamic Lot Permissions for this module */}
                                {extraLotPerms.length > 0 && (
                                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                                      Lot Extras:
                                    </span>
                                    {extraLotPerms.map(extra => {
                                      const isExtraActive = Boolean(current[extra.code]);
                                      return (
                                        <button
                                          key={extra.id}
                                          type="button"
                                          onClick={() => handleToggleLotPermission(m.id, extra.code)}
                                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                                            isExtraActive
                                              ? "bg-pink-50 text-[#ee008f] border-pink-300 shadow-xs"
                                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                          }`}
                                          title={extra.description}
                                        >
                                          <span>{isExtraActive ? "✓" : "+"}</span>
                                          <span>{extra.name}</span>
                                        </button>
                                      );
                                    })}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setLotSelectedCategory(
                                          m.id === "castings" ? "Casting" :
                                          m.id === "talents" ? "Talents & KYC" :
                                          m.id === "escrow" ? "Escrow & Finance" :
                                          m.id === "media" ? "Media" :
                                          m.id === "bookings" ? "Bookings" :
                                          m.id === "disputes" ? "Disputes" :
                                          m.id === "roles" ? "RBAC & Staff" :
                                          m.id === "audit" ? "Security & Audit" :
                                          "System Settings"
                                        );
                                        setRoleModalTab("lot");
                                      }}
                                      className="text-[10px] text-purple-600 font-bold hover:underline cursor-pointer bg-transparent border-none ml-1"
                                    >
                                      + Pick more
                                    </button>
                                  </div>
                                )}
                              </td>

                              {["view", "create", "edit", "approve", "delete"].map(action => (
                                <td key={action} className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(current[action])}
                                    onChange={() => handleTogglePermission(m.id, action)}
                                    className="w-4 h-4 rounded text-[#ee008f] focus:ring-[#ee008f] cursor-pointer"
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ─── VIEW 2: COMPREHENSIVE PERMISSION LOT BROWSER ─── */}
                {roleModalTab === "lot" && (
                  <div className="space-y-3">
                    
                    {/* Lot Search & Category Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={lotSearchQuery}
                          onChange={(e) => setLotSearchQuery(e.target.value)}
                          placeholder="Search in permission lot (e.g. approve, disburse, kyc, export, watermark)..."
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#ee008f]"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {allLotCategories.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setLotSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap cursor-pointer border transition ${
                              lotSelectedCategory === cat
                                ? "bg-[#0f172a] text-white border-[#0f172a]"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bulk Action Strip */}
                    <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-slate-500 font-semibold text-[11px]">
                        Showing <strong className="text-slate-900">{filteredLotItems.length}</strong> permissions in lot &bull;{" "}
                        <strong className="text-[#ee008f]">
                          {filteredLotItems.filter(p => Boolean(roleFormData.permissions?.[p.moduleId]?.[p.code])).length}
                        </strong> active in this role
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectAllFilteredLot(filteredLotItems)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 cursor-pointer transition flex items-center gap-1"
                        >
                          <CheckCheck size={12} />
                          <span>Select All in View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearAllFilteredLot(filteredLotItems)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200 cursor-pointer transition"
                        >
                          Clear All in View
                        </button>
                      </div>
                    </div>

                    {/* Cards Grid of Available Permissions in Lot */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto p-1">
                      {filteredLotItems.map(item => {
                        const isPicked = Boolean(roleFormData.permissions?.[item.moduleId]?.[item.code]);

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-2xl border transition text-left flex flex-col justify-between gap-2 ${
                              isPicked
                                ? "bg-pink-50/40 border-pink-200 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {item.category} &bull; {item.moduleId}
                                </span>

                                {item.isCustom && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                                      CUSTOM DYNAMIC
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDynamicPermission(item.id, item.name)}
                                      className="p-1 text-slate-400 hover:text-rose-600 bg-transparent border-none cursor-pointer"
                                      title="Remove from Lot"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="font-extrabold text-xs text-[#0f172a]">
                                {item.name}
                              </div>
                              <div className="font-mono text-[10px] text-slate-400">
                                {item.moduleId}.{item.code}
                              </div>
                              <p className="text-[11px] text-slate-500 m-0 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleLotPermission(item.moduleId, item.code)}
                              className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                                isPicked
                                  ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-pink-300 hover:text-[#ee008f]"
                              }`}
                            >
                              {isPicked ? (
                                <>
                                  <Check size={12} />
                                  <span>✓ Picked in Role (Click to Remove)</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={12} />
                                  <span>+ Pick to Role</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ee008f] to-[#7c3aed] text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:opacity-95 transition cursor-pointer border-none"
                >
                  Save Role Permissions
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ─── ADD STAFF MEMBER MODAL ─── */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0f172a] m-0">
                Assign New Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer border-none bg-transparent"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5">
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  placeholder="e.g. Shalini Roy"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Login ID (Corporate Email)
                </label>
                <input
                  type="email"
                  required
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  placeholder="shalini.roy@bookmystars.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Staff member will enter this email on the Admin Login page
                </span>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Login Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newP = generateRandomPassword();
                      setStaffFormData({ ...staffFormData, password: newP });
                      setShowStaffPassword(true);
                    }}
                    className="text-[10.5px] font-bold text-[#ee008f] hover:underline cursor-pointer border-none bg-transparent flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showStaffPassword ? "text" : "password"}
                    required
                    value={staffFormData.password}
                    onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                    placeholder="Enter password (e.g. Staff@123)"
                    className="w-full pl-3 pr-10 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer border-none bg-transparent p-0"
                  >
                    {showStaffPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Department
                </label>
                <select
                  value={staffFormData.department}
                  onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800"
                >
                  <option value="Casting Operations">Casting Operations</option>
                  <option value="Trust & Safety">Trust & Safety</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="KYC Compliance">KYC Compliance</option>
                  <option value="Executive Management">Executive Management</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assigned Dynamic Role
                </label>
                <select
                  value={staffFormData.roleId}
                  onChange={(e) => setStaffFormData({ ...staffFormData, roleId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-[#ee008f]"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id} className="text-slate-800 font-medium">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Login capability alert note */}
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-[11px] leading-relaxed flex items-start gap-2">
                <ShieldCheck size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Portal Access Enabled:</strong> Once assigned, this admin officer can sign in at <code>/admin/login</code> using the email and password above, inheriting their assigned role permissions.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ee008f] to-[#7c3aed] text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:opacity-95 transition cursor-pointer border-none"
                >
                  Create & Authorize Admin
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ─── RESET STAFF PASSWORD MODAL ─── */}
      {showResetModal && targetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                  <KeyRound size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a] m-0">
                    Reset Admin Password
                  </h3>
                  <p className="text-[11px] text-slate-400 m-0">
                    Update login credentials for {targetStaff.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowResetModal(false); setTargetStaff(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer border-none bg-transparent"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExecuteResetPassword} className="space-y-4">
              
              {/* Target Staff Summary Card */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={targetStaff.avatar}
                  alt={targetStaff.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="flex-1">
                  <div className="font-extrabold text-[#0f172a] text-xs">
                    {targetStaff.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {targetStaff.email}
                  </div>
                  <div className="text-[10px] font-bold text-[#ee008f] mt-0.5">
                    Role: {roles.find(r => r.id === targetStaff.roleId)?.name || targetStaff.roleId}
                  </div>
                </div>
              </div>

              {/* New Password Input Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    New Login Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newP = generateRandomPassword();
                      setResetPasswordInput(newP);
                      setShowResetPasswordVal(true);
                    }}
                    className="text-[11px] font-bold text-[#ee008f] hover:underline cursor-pointer border-none bg-transparent flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Auto-Generate
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showResetPasswordVal ? "text" : "password"}
                    required
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                    placeholder="Enter new strong password (min. 6 chars)"
                    className="w-full pl-3 pr-10 py-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f] text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordVal(!showResetPasswordVal)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer border-none bg-transparent p-0"
                  >
                    {showResetPasswordVal ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-1 m-0">
                  Staff member can immediately use this new password at <code className="text-[#ee008f]">/admin/login</code>
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowResetModal(false); setTargetStaff(null); }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-amber-500/25 hover:opacity-95 transition cursor-pointer border-none flex items-center gap-1.5"
                >
                  <KeyRound size={14} /> Update Password
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ─── CREATE DYNAMIC PERMISSION IN LOT MODAL ─── */}
      {showCreatePermModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-pink-50 text-[#ee008f] flex items-center justify-center font-black">
                  <Plus size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a] m-0">
                    Add Dynamic Permission to Lot
                  </h3>
                  <p className="text-[11px] text-slate-400 m-0">
                    Create a custom permission that will join the system Lot and can be assigned to any role.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePermModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition cursor-pointer border-none bg-transparent"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDynamicPermission} className="space-y-4">
              
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Permission Display Name
                </label>
                <input
                  type="text"
                  required
                  value={newPermFormData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
                    setNewPermFormData({ ...newPermFormData, name: val, code: autoSlug });
                  }}
                  placeholder="e.g. Instant VIP Audition Fast-Track"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Permission Code / Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={newPermFormData.code}
                    onChange={(e) => setNewPermFormData({ ...newPermFormData, code: e.target.value })}
                    placeholder="e.g. fast_track_approval"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Module
                  </label>
                  <select
                    value={newPermFormData.moduleId}
                    onChange={(e) => {
                      const mod = SYSTEM_MODULES.find(m => m.id === e.target.value);
                      setNewPermFormData({ 
                        ...newPermFormData, 
                        moduleId: e.target.value,
                        category: mod?.name || "General"
                      });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800"
                  >
                    {SYSTEM_MODULES.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={newPermFormData.category}
                  onChange={(e) => setNewPermFormData({ ...newPermFormData, category: e.target.value })}
                  placeholder="e.g. Casting, Escrow & Finance, VIP Perks"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Clearance Description
                </label>
                <textarea
                  rows={2}
                  value={newPermFormData.description}
                  onChange={(e) => setNewPermFormData({ ...newPermFormData, description: e.target.value })}
                  placeholder="Describe what authority or action this dynamic permission grants..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#ee008f]"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-pink-50/50 rounded-xl border border-pink-100">
                <input
                  type="checkbox"
                  id="autoAssignCheck"
                  checked={newPermFormData.autoAssignToRole}
                  onChange={(e) => setNewPermFormData({ ...newPermFormData, autoAssignToRole: e.target.checked })}
                  className="w-4 h-4 rounded text-[#ee008f] focus:ring-[#ee008f] cursor-pointer"
                />
                <label htmlFor="autoAssignCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Immediately assign this permission to active role ({roleFormData.name || "Draft Role"})
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreatePermModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ee008f] to-[#7c3aed] text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:opacity-95 transition cursor-pointer border-none flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add to Lot & Apply
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
