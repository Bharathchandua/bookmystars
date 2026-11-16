import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Super Admin Staff Members & Account Provisioning API
 */

export const DEFAULT_STAFF_MEMBERS = [
  {
    id: "STF-001",
    name: "Bharath",
    email: "admin@bookmystarts.com",
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
    email: "rhea.sen@bookmystarts.com",
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
    email: "arjun.m@bookmystarts.com",
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
    email: "pooja.finance@bookmystarts.com",
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
    email: "dev.patel@bookmystarts.com",
    password: "Dev@123",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80",
    roleId: "ROLE_CONTENT_MODERATOR",
    department: "KYC Compliance",
    status: "ACTIVE",
    lastLogin: "Yesterday"
  }
];

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
