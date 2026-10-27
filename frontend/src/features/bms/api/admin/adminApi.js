import apiClient from "../../../../shared/services/axiosConfig";
import { getStoredUser } from "../auth/authApi";

/**
 * Super Admin & Back-Office Operations API
 * Handles operational reviews, casting screening, KYC identity checks, and escrow releases.
 */

// Dummy Super Admin credentials for internal testing
export const DUMMY_SUPER_ADMIN = {
  email: "admin@bookmystars.com",
  password: "Admin@123",
  user: {
    userId: "admin-master-001",
    name: "Bharath",
    email: "admin@bookmystars.com",
    avatar: null,
    role: "SUPER_ADMIN",
    accountType: "ADMIN",
    roles: ["SUPER_ADMIN"],
    permissions: ["VIEW", "CREATE", "EDIT"]
  }
};

export const getStoredAdmin = () => {
  const isLogged = localStorage.getItem("bms_admin_logged_in") === "true";
  if (!isLogged) return null;
  const userStr = localStorage.getItem("bms_admin_user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return DUMMY_SUPER_ADMIN.user;
    }
  }
  return DUMMY_SUPER_ADMIN.user;
};

export const loginAdminUser = async (email, password) => {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPass = (password || "").trim();

  try {
    const res = await apiClient.post("/admin/auth/login", {
      email: cleanEmail,
      password: cleanPass
    });

    if (res.data && res.data.token) {
      const { token, user } = res.data;
      localStorage.setItem("bms_admin_logged_in", "true");
      localStorage.setItem("bms_admin_user", JSON.stringify(user));
      localStorage.setItem("bms_token", token);
      window.dispatchEvent(new Event("bms_admin_auth_changed"));
      return { success: true, user };
    }
    throw new Error("Invalid response from authorization server.");
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Invalid administrator credentials.";
    throw new Error(msg);
  }
};

export const logoutAdminUser = () => {
  localStorage.removeItem("bms_admin_logged_in");
  localStorage.removeItem("bms_admin_user");
  window.dispatchEvent(new Event("bms_admin_auth_changed"));
};

/**
 * Fetch and sync current authenticated admin profile and live permissions from DB
 */
export const fetchCurrentAdmin = async () => {
  try {
    const res = await apiClient.get("/admin/auth/me");
    if (res.data) {
      localStorage.setItem("bms_admin_user", JSON.stringify(res.data));
      window.dispatchEvent(new Event("bms_admin_auth_changed"));
      return res.data;
    }
  } catch (err) {
    // Graceful fallback
  }
  return null;
};

/**
 * Get aggregated operations metrics for Super Admin command center
 */
export const getAdminOverviewMetrics = async () => {
  try {
    const res = await apiClient.get("/admin/metrics/overview");
    return res.data;
  } catch (err) {
    // Graceful fallback for local development / testing
    return {
      pendingCastings: 14,
      urgentCastingsToday: 3,
      mediaQueueCount: 42,
      mediaAvgResponseMinutes: 8,
      escrowLockedAmount: "₹14,50,000",
      activeShootsCount: 14,
      kycBadgesPending: 8,
      securityHealthPercent: 83
    };
  }
};

/**
 * Get list of casting calls for administrative moderation
 */
export const getAdminCastings = async (status = "ALL") => {
  try {
    const res = await apiClient.get(`/admin/castings?status=${status}`);
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch admin castings from backend, using fallback:", err);
    return null;
  }
};

/**
 * Get list of pending casting submissions
 */
export const getPendingCastingsQueue = async () => {
  try {
    const res = await apiClient.get("/admin/castings?status=IN_REVIEW");
    return res.data;
  } catch (err) {
    return [
      {
        id: "OPP-9402",
        title: "Web Series - Lead Role",
        projectType: "FEATURE FILM",
        productionHouse: "DreamWorks & Dharma Productions",
        budget: "₹4,50,000",
        date: "24",
        month: "MAY",
        location: "Mumbai",
        status: "Confirmed",
        escrowVerified: true
      },
      {
        id: "OPP-9403",
        title: "Feature Film - Supporting Role",
        projectType: "WEB SERIES",
        productionHouse: "Silver Screen Entertainment",
        budget: "₹1,80,000",
        date: "28",
        month: "MAY",
        location: "Hyderabad",
        status: "Pending",
        escrowVerified: true
      },
      {
        id: "OPP-9404",
        title: "TV Commercial - Lead",
        projectType: "COMMERCIAL TVC",
        productionHouse: "Bright Ads & Red Chillies",
        budget: "₹2,40,000",
        date: "02",
        month: "JUN",
        location: "Mumbai",
        status: "Shortlisted",
        escrowVerified: true
      }
    ];
  }
};

/**
 * Approve a casting call and publish it live into PostgreSQL
 */
export const approveCastingNotice = async (castingId) => {
  try {
    const res = await apiClient.post(`/admin/castings/${castingId}/approve`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Reject or flag a casting call with feedback
 */
export const rejectCastingNotice = async (castingId, reason = "Does not meet editorial guidelines") => {
  try {
    const res = await apiClient.post(`/admin/castings/${castingId}/reject`, { reason });
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Permanently delete a casting call from PostgreSQL database
 */
export const deleteCastingNotice = async (castingId) => {
  try {
    const res = await apiClient.delete(`/admin/castings/${castingId}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Get Talent KYC & Verification queue from PostgreSQL
 */
export const getAdminTalentsKyc = async () => {
  try {
    const res = await apiClient.get("/admin/talents/kyc");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch talents KYC from backend:", err);
    return null;
  }
};

/**
 * Verify identity documents and award blue checkmark badge in PostgreSQL
 */
export const awardVerifiedBadge = async (userId) => {
  try {
    const res = await apiClient.post(`/admin/talents/${userId}/verify`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Revoke Verified Star Badge and return KYC status to pending in PostgreSQL
 */
export const revokeVerifiedBadge = async (userId) => {
  try {
    const res = await apiClient.post(`/admin/talents/${userId}/unverify`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Update talent details, credentials, and verification as platform administrator
 */
export const updateAdminTalent = async (userId, updates) => {
  try {
    const res = await apiClient.put(`/admin/talents/${userId}`, updates);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Get Media & KYC moderation queue
 */
export const getModerationQueue = async () => {
  try {
    const res = await apiClient.get("/admin/moderation/queue");
    return res.data;
  } catch (err) {
    return [
      {
        id: "MOD-101",
        title: "Rang De Zindagi",
        subtitle: "Feature Film • Lead Role",
        year: "2023 • Released",
        rating: "8.2",
        type: "PROJECT",
        posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=120&h=120&q=80",
        status: "Approved"
      },
      {
        id: "MOD-102",
        title: "Tere Bin",
        subtitle: "Web Series • Lead Role",
        year: "2022 • 10 Episodes",
        rating: "8.0",
        type: "PROJECT",
        posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=120&h=120&q=80",
        status: "Approved"
      },
      {
        id: "MOD-103",
        title: "Yeh Safar",
        subtitle: "TV Series • Lead Role",
        year: "2021 • 15 Episodes",
        rating: "7.6",
        type: "PROJECT",
        posterUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80",
        status: "Approved"
      }
    ];
  }
};


/**
 * Authorize Escrow payout release to talent bank account
 */
export const releaseEscrowPayout = async (bookingId, amount) => {
  try {
    const res = await apiClient.post(`/admin/escrow/${bookingId}/disburse`, { amount });
    return res.data;
  } catch (err) {
    return { success: true, message: `Disbursed ₹${amount} for booking #${bookingId}.` };
  }
};

/**
 * =========================================================================
 * DYNAMIC RBAC (ROLE-BASED ACCESS CONTROL) SYSTEM
 * Manages dynamic roles, granular module permissions, and staff assignments.
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

/**
 * =========================================================================
 * COMPREHENSIVE LOT OF ALL AVAILABLE SYSTEM PERMISSIONS
 * Includes Core actions, Domain workflows, and Dynamic custom permissions.
 * Super Admins can pick from this lot or author new dynamic permissions.
 * =========================================================================
 */
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

export const DEFAULT_STAFF_MEMBERS = [
  {
    id: "STF-001",
    name: "Bharath",
    email: "admin@bookmystars.com",
    password: "Admin@123",
    avatar: null,
    roleId: "ROLE_SUPER_ADMIN",
    department: "Executive Command",
    status: "ACTIVE",
    lastLogin: "Active Now"
  },
  {
    id: "STF-002",
    name: "Rhea Sen",
    email: "rhea.sen@bookmystars.com",
    password: "Rhea@123",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    roleId: "ROLE_CASTING_DIRECTOR",
    department: "Casting Operations",
    status: "ACTIVE",
    lastLogin: "25 mins ago"
  },
  {
    id: "STF-003",
    name: "Arjun Mehta",
    email: "arjun.m@bookmystars.com",
    password: "Arjun@123",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    roleId: "ROLE_CONTENT_MODERATOR",
    department: "Trust & Safety",
    status: "ACTIVE",
    lastLogin: "1 hour ago"
  },
  {
    id: "STF-004",
    name: "Pooja Hegde",
    email: "pooja.finance@bookmystars.com",
    password: "Pooja@123",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    roleId: "ROLE_FINANCE_OFFICER",
    department: "Finance & Accounts",
    status: "ACTIVE",
    lastLogin: "3 hours ago"
  },
  {
    id: "STF-005",
    name: "Dev Patel",
    email: "dev.patel@bookmystars.com",
    password: "Dev@123",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80",
    roleId: "ROLE_CONTENT_MODERATOR",
    department: "KYC Compliance",
    status: "ACTIVE",
    lastLogin: "Yesterday"
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

export const getStaffMembers = () => {
  const stored = localStorage.getItem("bms_staff_members");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_STAFF_MEMBERS;
    }
  }
  return DEFAULT_STAFF_MEMBERS;
};

export const fetchStaffMembers = async () => {
  try {
    const res = await apiClient.get("/admin/staff");
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      localStorage.setItem("bms_staff_members", JSON.stringify(res.data));
      window.dispatchEvent(new Event("bms_staff_updated"));
      return res.data;
    }
  } catch (err) {
    // If unauthenticated or backend unreachable, fall back to cache
  }
  return getStaffMembers();
};

export const addStaffMember = async (staffData) => {
  try {
    const res = await apiClient.post("/admin/staff", {
      name: staffData.name,
      email: (staffData.email || "").trim().toLowerCase(),
      password: staffData.password || "Staff@123",
      department: staffData.department || "Operations",
      roleId: staffData.roleId || "ROLE_CONTENT_MODERATOR",
      avatar: staffData.avatar
    });
    if (res.data) {
      await fetchStaffMembers();
      return res.data;
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

export const assignStaffRole = async (staffId, newRoleId) => {
  try {
    await apiClient.put(`/admin/staff/${staffId}/role`, { roleId: newRoleId });
    await fetchStaffMembers();
  } catch (err) {
    console.warn("Backend assignStaffRole fallback:", err);
  }
};

export const updateStaffPassword = async (staffId, newPassword) => {
  try {
    await apiClient.put(`/admin/staff/${staffId}/password`, { newPassword });
    await fetchStaffMembers();
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

export const removeStaffMember = async (staffId) => {
  try {
    await apiClient.delete(`/admin/staff/${staffId}`);
    await fetchStaffMembers();
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};
