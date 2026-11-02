import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Fetch all active master crafts (public endpoint)
 */
export const getPublicCrafts = async () => {
  try {
    const res = await apiClient.get("/crafts");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch public crafts, using fallback:", err);
    return [
      { id: 1, name: "Acting & Performance", description: "Screen acting, method performance, comedy, theater" },
      { id: 2, name: "Dance & Movement", description: "Classical, contemporary, folk, hip-hop, choreography" },
      { id: 3, name: "Music & Voice", description: "Playback singing, classical vocalization, voiceover" },
      { id: 4, name: "Writing & Direction", description: "Scriptwriting, dialog craft, screenplay, direction" },
      { id: 5, name: "Stunts & Action", description: "Combat choreography, martial arts, high-risk action" },
      { id: 6, name: "Technical & Camera", description: "Cinematography, lighting, Steadicam, drone capture" },
      { id: 7, name: "Post-Production & VFX", description: "Editing, CGI, color grading, sound design" },
      { id: 8, name: "Hair, Makeup & Costume", description: "Prosthetics, SFX makeup, vintage wardrobe" },
      { id: 9, name: "Art & Production Design", description: "Set construction, prop fabrication" },
      { id: 10, name: "Specialized Craft", description: "Niche creative crafts, mimicry, illusions" }
    ];
  }
};

/**
 * Get all crafts for admin management with skill counts
 */
export const getAdminCrafts = async () => {
  try {
    const res = await apiClient.get("/admin/crafts");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch admin crafts:", err);
    return [];
  }
};

/**
 * Add a new official craft (Admin only)
 */
export const createAdminCraft = async (craftData) => {
  try {
    const res = await apiClient.post("/admin/crafts", craftData);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Delete an official craft (Admin only)
 */
export const deleteAdminCraft = async (craftId) => {
  try {
    const res = await apiClient.delete(`/admin/crafts/${craftId}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Get standard reference library of 24 cinema crafts
 */
export const getCraftsLibrary = async () => {
  try {
    const res = await apiClient.get("/admin/crafts/library");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch crafts library:", err);
    return [];
  }
};

/**
 * One-click bulk import of the 24 cinema crafts
 */
export const bulkImportCrafts = async () => {
  try {
    const res = await apiClient.post("/admin/crafts/bulk-import");
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Toggle craft active status (select / deselect from Sign-Up page)
 */
export const toggleAdminCraft = async (craftId) => {
  try {
    const res = await apiClient.patch(`/admin/crafts/${craftId}/toggle`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

export const craftsApi = {
  getPublicCrafts,
  getAdminCrafts,
  createAdminCraft,
  deleteAdminCraft,
  getCraftsLibrary,
  bulkImportCrafts,
  toggleAdminCraft,
};

export default craftsApi;
