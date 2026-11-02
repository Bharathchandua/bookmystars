import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Fetch all active master primary professions (public endpoint for signup & profiles)
 */
export const getPublicProfessions = async () => {
  try {
    const res = await apiClient.get("/professions");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch public professions, using fallback:", err);
    return [
      { id: 1, name: "Actor", craftCategory: "Acting & Performance" },
      { id: 2, name: "Director", craftCategory: "Writing & Direction" },
      { id: 3, name: "Dancer", craftCategory: "Dance & Movement" },
      { id: 4, name: "Singer", craftCategory: "Music & Voice" },
      { id: 5, name: "Model", craftCategory: "Acting & Performance" },
      { id: 6, name: "Producer", craftCategory: "Writing & Direction" },
      { id: 7, name: "Cinematographer", craftCategory: "Technical & Camera" },
      { id: 8, name: "Film Editor", craftCategory: "Post-Production & VFX" },
      { id: 9, name: "Screenplay Writer", craftCategory: "Writing & Direction" },
      { id: 10, name: "Choreographer", craftCategory: "Dance & Movement" },
      { id: 11, name: "Stunt Performer", craftCategory: "Stunts & Action" },
      { id: 12, name: "Voice Artist", craftCategory: "Music & Voice" }
    ];
  }
};

/**
 * Get all professions for admin management with user counts
 */
export const getAdminProfessions = async () => {
  try {
    const res = await apiClient.get("/admin/professions");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch admin professions:", err);
    return [];
  }
};

/**
 * Add a new official primary profession (Admin only)
 */
export const createAdminProfession = async (professionData) => {
  try {
    const res = await apiClient.post("/admin/professions", professionData);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Delete an official primary profession (Admin only)
 */
export const deleteAdminProfession = async (professionId) => {
  try {
    const res = await apiClient.delete(`/admin/professions/${professionId}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Get standard cinema reference library of ~114 industry professions
 */
export const getProfessionsLibrary = async () => {
  try {
    const res = await apiClient.get("/admin/professions/library");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch professions library:", err);
    return [];
  }
};

/**
 * One-click bulk import all ~114 standard cinema professions into catalog
 */
export const bulkImportProfessions = async () => {
  try {
    const res = await apiClient.post("/admin/professions/bulk-import");
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Toggle profession active status (select / deselect from Sign-Up page)
 */
export const toggleAdminProfession = async (professionId) => {
  try {
    const res = await apiClient.patch(`/admin/professions/${professionId}/toggle`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};
