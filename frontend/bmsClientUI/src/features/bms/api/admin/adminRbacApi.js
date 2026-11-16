import apiClient from "../../../../shared/services/axiosConfig";

/**
 * =========================================================================
 * DYNAMIC RBAC (ROLE-BASED ACCESS CONTROL) SYSTEM API
 * Manages dynamic roles, granular module permissions, and permission lot.
 * =========================================================================
 */

export const SYSTEM_MODULES = [
  { id: "talents", name: "Talent Profiles & KYC", description: "Manage actor/model profiles, verify government KYC documents." },
  { id: "castings", name: "Casting & Auditions", description: "Screen, approve, and publish casting calls to the live talent feed." },
  { id: "media", name: "Media Moderation", description: "Review photos, showreels, audio tracks, and watermark assets." },
  { id: "bookings", name: "Shoot Bookings & Contracts", description: "Oversee shoot schedules, contracts, and booking agreements." },
  { id: "escrow", name: "Escrow Financial Vault", description: "Hold project budgets, authorize release of milestone payouts." },
  { id: "disputes", name: "Disputes & Support Desk", description: "Arbitrate disputes between filmmakers and talents, handle tickets." },
  { id: "roles", name: "Role-Based Access Control (RBAC)", description: "Dynamically create custom roles, assign permissions and staff." },
  { id: "audit", name: "Audit Trail & Security Logs", description: "Inspect immutable activity logs, IP tracking, and tamper trails." },
  { id: "settings", name: "Global System Settings", description: "Platform maintenance, edge cache, API keys, and notification engines." }
];

export const DEFAULT_PERMISSION_LOT = [
  // ─── 1. CASTING & AUDITIONS ───
  { id: "castings_view", code: "view", moduleId: "castings", name: "View Casting Notices", category: "Casting", description: "Browse casting calls, briefs, and studio submissions." },
  { id: "castings_create", code: "create", moduleId: "castings", name: "Post Casting Notice", category: "Casting", description: "Create and publish new studio casting calls." },
  { id: "castings_edit", code: "edit", moduleId: "castings", name: "Edit Casting Requirements", category: "Casting", description: "Alter role criteria, shoot dates, and compensation." },
  { id: "castings_delete", code: "delete", moduleId: "castings", name: "Delete Casting Call", category: "Casting", description: "Unpublish or purge casting notices from feed." },
  { id: "castings_approve", code: "approve", moduleId: "castings", name: "Approve Studio Submissions", category: "Casting", description: "Review and approve studio casting calls for public display." },
  { id: "castings_publish", code: "publish", moduleId: "castings", name: "Push Live to Talents", category: "Casting", description: "Push approved castings directly to talent mobile feeds." },
  { id: "castings_archive", code: "archive", moduleId: "castings", name: "Archive Wrapped Audition", category: "Casting", description: "Close audition submissions and archive dossiers." },

  // ─── 2. TALENTS & KYC ───
  { id: "talents_view", code: "view", moduleId: "talents", name: "View Talent Dossiers", category: "Talents & KYC", description: "Access full actor/model dossiers, stats, and reels." },
  { id: "talents_create", code: "create", moduleId: "talents", name: "Create Talent Profile", category: "Talents & KYC", description: "Manually onboard represented talents or celebrities." },
  { id: "talents_edit", code: "edit", moduleId: "talents", name: "Edit Talent Credentials", category: "Talents & KYC", description: "Update measurements, craft categories, and agency links." },
  { id: "talents_delete", code: "delete", moduleId: "talents", name: "Suspend Talent Profile", category: "Talents & KYC", description: "Deactivate or blackball flagged talent accounts." },
  { id: "talents_verify_kyc", code: "verify_kyc", moduleId: "talents", name: "Verify Government KYC", category: "Talents & KYC", description: "Inspect Aadhaar/Passport and award verified blue rosette badge." },
  { id: "talents_export", code: "export", moduleId: "talents", name: "Export Talent Roster", category: "Talents & KYC", description: "Download CSV/Excel data sheets of audition candidates." },
  { id: "talents_feature", code: "feature", moduleId: "talents", name: "Feature in Spotlight", category: "Talents & KYC", description: "Promote talent to the homepage spotlight section." },

  // ─── 3. MEDIA MODERATION ───
  { id: "media_view", code: "view", moduleId: "media", name: "View Media Stream", category: "Media", description: "Inspect submitted headshots, showreels, and audio tracks." },
  { id: "media_create", code: "create", moduleId: "media", name: "Upload Official Media", category: "Media", description: "Upload agency promos, trailers, and press kit photos." },
  { id: "media_edit", code: "edit", moduleId: "media", name: "Edit Media Tags", category: "Media", description: "Modify genres, crafts, and credit metadata." },
  { id: "media_approve", code: "approve", moduleId: "media", name: "Approve Media Assets", category: "Media", description: "Permit user-uploaded media to go public." },
  { id: "media_delete", code: "delete", moduleId: "media", name: "Purge Inappropriate Media", category: "Media", description: "Delete copyright-infringing or inappropriate media." },
  { id: "media_watermark", code: "watermark", moduleId: "media", name: "Enforce Digital Watermark", category: "Media", description: "Apply anti-theft digital imprint to portfolio assets." },

  // ─── 4. SHOOT BOOKINGS & CONTRACTS ───
  { id: "bookings_view", code: "view", moduleId: "bookings", name: "View Shoot Contracts", category: "Bookings", description: "Inspect call sheets, dates, and signed artist contracts." },
  { id: "bookings_create", code: "create", moduleId: "bookings", name: "Draft Booking Contract", category: "Bookings", description: "Formally issue contract between production and talent." },
  { id: "bookings_edit", code: "edit", moduleId: "bookings", name: "Reschedule Call Sheet", category: "Bookings", description: "Modify shoot timetable, venue, or terms." },
  { id: "bookings_approve", code: "approve", moduleId: "bookings", name: "Signoff Milestone Contract", category: "Bookings", description: "Approve milestone deliverables and wrap completion." },
  { id: "bookings_cancel", code: "cancel", moduleId: "bookings", name: "Cancel Booking Agreement", category: "Bookings", description: "Terminate contract under mutual or breach clauses." },

  // ─── 5. ESCROW FINANCIAL VAULT ───
  { id: "escrow_view", code: "view", moduleId: "escrow", name: "View Escrow Vault", category: "Escrow & Finance", description: "Inspect locked project budgets and transaction ledgers." },
  { id: "escrow_create", code: "create", moduleId: "escrow", name: "Lock Project Escrow", category: "Escrow & Finance", description: "Accept client advance and secure milestone escrow." },
  { id: "escrow_edit", code: "edit", moduleId: "escrow", name: "Adjust Milestone Escrow", category: "Escrow & Finance", description: "Modify escrow allocation for extra shoot days." },
  { id: "escrow_delete", code: "delete", moduleId: "escrow", name: "Void Escrow Order", category: "Escrow & Finance", description: "Void unfulfilled payment intents and invoices." },
  { id: "escrow_approve", code: "approve", moduleId: "escrow", name: "Approve Payment Ledger", category: "Escrow & Finance", description: "Approve financial audit clearances." },
  { id: "escrow_disburse_funds", code: "disburse_funds", moduleId: "escrow", name: "Disburse Milestone Payout", category: "Escrow & Finance", description: "Authorize wire transfer of shoot fees to talent bank account." },
  { id: "escrow_freeze_escrow", code: "freeze_escrow", moduleId: "escrow", name: "Freeze Escrow Vault", category: "Escrow & Finance", description: "Place escrow hold in event of breach or client dispute." },
  { id: "escrow_refund", code: "refund", moduleId: "escrow", name: "Authorize Client Refund", category: "Escrow & Finance", description: "Disburse unspent escrow balances back to production client." },
  { id: "escrow_tax_reports", code: "tax_reports", moduleId: "escrow", name: "Export GST & TDS Ledgers", category: "Escrow & Finance", description: "Generate accounting audit and taxation records." },

  // ─── 6. DISPUTES & SUPPORT ───
  { id: "disputes_view", code: "view", moduleId: "disputes", name: "View Dispute Dossiers", category: "Disputes", description: "Read conflict claims between production houses and artists." },
  { id: "disputes_create", code: "create", moduleId: "disputes", name: "Open Investigation Ticket", category: "Disputes", description: "Flag contract discrepancies or missed call sheet times." },
  { id: "disputes_edit", code: "edit", moduleId: "disputes", name: "Add Evidence & Depositions", category: "Disputes", description: "Upload chats, call sheets, and proof of work." },
  { id: "disputes_approve", code: "approve", moduleId: "disputes", name: "Issue Arbitration Verdict", category: "Disputes", description: "Deliver binding resolution on disputed milestone disbursements." },

  // ─── 7. ROLE-BASED ACCESS CONTROL (RBAC) ───
  { id: "roles_view", code: "view", moduleId: "roles", name: "View RBAC Matrix", category: "RBAC & Staff", description: "Inspect system roles, permission scopes, and staff roster." },
  { id: "roles_create", code: "create", moduleId: "roles", name: "Create Custom Dynamic Role", category: "RBAC & Staff", description: "Author new administrative roles with customized privileges." },
  { id: "roles_edit", code: "edit", moduleId: "roles", name: "Modify Role Permissions", category: "RBAC & Staff", description: "Update permission matrices of existing dynamic roles." },
  { id: "roles_delete", code: "delete", moduleId: "roles", name: "Delete Dynamic Role", category: "RBAC & Staff", description: "Remove obsolete dynamic roles." },
  { id: "roles_manage_staff", code: "manage_staff", moduleId: "roles", name: "Provision Admin Accounts", category: "RBAC & Staff", description: "Create staff members with corporate login email and password." },
  { id: "roles_reset_password", code: "reset_password", moduleId: "roles", name: "Reset Staff Password", category: "RBAC & Staff", description: "Override and reissue administrative login credentials." },

  // ─── 8. SECURITY & AUDIT ───
  { id: "audit_view", code: "view", moduleId: "audit", name: "Inspect Immutable Audit Trail", category: "Security & Audit", description: "Examine security footprint, IP tracking, and timestamped actions." },
  { id: "audit_export", code: "export", moduleId: "audit", name: "Export Tamper Trail Logs", category: "Security & Audit", description: "Download encrypted logs for legal or compliance review." },

  // ─── 9. SYSTEM SETTINGS ───
  { id: "settings_view", code: "view", moduleId: "settings", name: "View System Health", category: "System Settings", description: "Monitor database connections, latency, and edge cache." },
  { id: "settings_edit", code: "edit", moduleId: "settings", name: "Modify System Config", category: "System Settings", description: "Toggle maintenance mode, manage API keys, and notification engines." },
  { id: "settings_broadcast", code: "broadcast", moduleId: "settings", name: "Platform Broadcast Notification", category: "System Settings", description: "Dispatch critical system announcements to all users." }
];

export const getPermissionLot = () => {
  const custom = localStorage.getItem("bms_dynamic_permission_lot");
  let customList = [];
  if (custom) {
    try {
      customList = JSON.parse(custom);
    } catch {
      customList = [];
    }
  }
  return [...DEFAULT_PERMISSION_LOT, ...customList];
};

export const saveDynamicPermissionToLot = (permData) => {
  const slug = (permData.code || permData.name || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const newPerm = {
    id: permData.id || `custom_perm_${Date.now()}`,
    code: slug,
    moduleId: permData.moduleId || "settings",
    name: permData.name.trim(),
    category: permData.category || "Custom Dynamic",
    description: permData.description || "Custom dynamic permission created by Super Admin.",
    isCustom: true
  };

  const stored = localStorage.getItem("bms_dynamic_permission_lot");
  let customList = stored ? JSON.parse(stored) : [];
  customList = customList.filter(p => p.id !== newPerm.id && p.code !== newPerm.code);
  customList.push(newPerm);

  localStorage.setItem("bms_dynamic_permission_lot", JSON.stringify(customList));
  window.dispatchEvent(new Event("bms_lot_updated"));
  return newPerm;
};

export const deleteDynamicPermissionFromLot = (permId) => {
  const stored = localStorage.getItem("bms_dynamic_permission_lot");
  if (!stored) return;
  let customList = JSON.parse(stored);
  customList = customList.filter(p => p.id !== permId);
  localStorage.setItem("bms_dynamic_permission_lot", JSON.stringify(customList));
  window.dispatchEvent(new Event("bms_lot_updated"));
};

export const DEFAULT_ROLES = [
  {
    id: "ROLE_SUPER_ADMIN",
    name: "Super Admin",
    description: "Supreme administrative privileges with full authority across all subsystems.",
    color: "#ee008f",
    isSystem: true,
    userCount: 1,
    permissions: {
      talents: { view: true, create: true, edit: true, delete: true, approve: true },
      castings: { view: true, create: true, edit: true, delete: true, approve: true },
      media: { view: true, create: true, edit: true, delete: true, approve: true },
      bookings: { view: true, create: true, edit: true, delete: true, approve: true },
      escrow: { view: true, create: true, edit: true, delete: true, approve: true },
      disputes: { view: true, create: true, edit: true, delete: true, approve: true },
      roles: { view: true, create: true, edit: true, delete: true, approve: true },
      audit: { view: true, create: false, edit: false, delete: false, export: true },
      settings: { view: true, create: true, edit: true, delete: true, approve: true }
    }
  },
  {
    id: "ROLE_CASTING_DIRECTOR",
    name: "Casting & Auditions Lead",
    description: "Reviews incoming notices from studios, verifies legitimacy, and approves casting calls.",
    color: "#7c3aed",
    isSystem: false,
    userCount: 1,
    permissions: {
      talents: { view: true, create: false, edit: true, delete: false, approve: true },
      castings: { view: true, create: true, edit: true, delete: false, approve: true },
      media: { view: true, create: false, edit: true, delete: false, approve: false },
      bookings: { view: true, create: true, edit: true, delete: false, approve: true },
      escrow: { view: true, create: false, edit: false, delete: false, approve: false },
      disputes: { view: true, create: true, edit: true, delete: false, approve: false },
      roles: { view: false, create: false, edit: false, delete: false, approve: false },
      audit: { view: true, create: false, edit: false, delete: false, export: false },
      settings: { view: false, create: false, edit: false, delete: false, approve: false }
    }
  },
  {
    id: "ROLE_CONTENT_MODERATOR",
    name: "Media & KYC Reviewer",
    description: "Moderates headshots, portfolios, and validates government KYC identity proofs.",
    color: "#059669",
    isSystem: false,
    userCount: 2,
    permissions: {
      talents: { view: true, create: false, edit: true, delete: false, approve: true },
      castings: { view: true, create: false, edit: false, delete: false, approve: false },
      media: { view: true, create: false, edit: true, delete: true, approve: true },
      bookings: { view: false, create: false, edit: false, delete: false, approve: false },
      escrow: { view: false, create: false, edit: false, delete: false, approve: false },
      disputes: { view: true, create: false, edit: true, delete: false, approve: false },
      roles: { view: false, create: false, edit: false, delete: false, approve: false },
      audit: { view: false, create: false, edit: false, delete: false, export: false },
      settings: { view: false, create: false, edit: false, delete: false, approve: false }
    }
  },
  {
    id: "ROLE_FINANCE_OFFICER",
    name: "Escrow & Financial Controller",
    description: "Audits project milestones and authorizes release of escrow payments to talent bank accounts.",
    color: "#d97706",
    isSystem: false,
    userCount: 1,
    permissions: {
      talents: { view: true, create: false, edit: false, delete: false, approve: false },
      castings: { view: true, create: false, edit: false, delete: false, approve: false },
      media: { view: false, create: false, edit: false, delete: false, approve: false },
      bookings: { view: true, create: false, edit: true, delete: false, approve: false },
      escrow: { view: true, create: true, edit: true, delete: false, approve: true },
      disputes: { view: true, create: false, edit: true, delete: false, approve: true },
      roles: { view: false, create: false, edit: false, delete: false, approve: false },
      audit: { view: true, create: false, edit: false, delete: false, export: true },
      settings: { view: false, create: false, edit: false, delete: false, approve: false }
    }
  }
];

export const getDynamicRoles = () => {
  const stored = localStorage.getItem("bms_dynamic_roles");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ROLES;
    }
  }
  return DEFAULT_ROLES;
};

export const fetchDynamicRoles = async () => {
  try {
    const res = await apiClient.get("/admin/roles");
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem("bms_dynamic_roles", JSON.stringify(res.data));
      window.dispatchEvent(new Event("bms_roles_updated"));
      return res.data;
    }
  } catch (err) {
    // If unauthenticated or backend unreachable, fall back to cache
  }
  return getDynamicRoles();
};

export const saveDynamicRole = async (roleData) => {
  try {
    const res = await apiClient.post("/admin/roles", roleData);
    if (res.data) {
      await fetchDynamicRoles();
      return res.data;
    }
  } catch (err) {
    console.warn("Backend saveDynamicRole fallback:", err);
  }
  const current = getDynamicRoles();
  const exists = current.findIndex(r => r.id === roleData.id);
  let updated;
  if (exists >= 0) {
    updated = current.map(r => r.id === roleData.id ? { ...r, ...roleData } : r);
  } else {
    const newRole = {
      ...roleData,
      id: roleData.id || `ROLE_CUSTOM_${Date.now().toString().slice(-6)}`,
      userCount: 0,
      isSystem: false
    };
    updated = [...current, newRole];
  }
  localStorage.setItem("bms_dynamic_roles", JSON.stringify(updated));
  window.dispatchEvent(new Event("bms_roles_updated"));
  return updated;
};

export const deleteDynamicRole = async (roleId) => {
  try {
    await apiClient.delete(`/admin/roles/${roleId}`);
    await fetchDynamicRoles();
    return;
  } catch (err) {
    console.warn("Backend deleteDynamicRole fallback:", err);
  }
  const current = getDynamicRoles();
  const target = current.find(r => r.id === roleId);
  if (target?.isSystem) {
    throw new Error("System default roles cannot be deleted!");
  }
  const updated = current.filter(r => r.id !== roleId);
  localStorage.setItem("bms_dynamic_roles", JSON.stringify(updated));
  window.dispatchEvent(new Event("bms_roles_updated"));
  return updated;
};
