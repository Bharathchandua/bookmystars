import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Fetch all active master creative skills (public endpoint)
 */
export const getPublicSkills = async () => {
  try {
    const res = await apiClient.get("/skills");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch public skills, using fallback:", err);
    return [
      { id: 1, name: "Comedy", category: "Acting & Performance" },
      { id: 2, name: "Dancing", category: "Dance & Movement" },
      { id: 3, name: "Singing", category: "Music & Voice" },
      { id: 4, name: "Screenplay", category: "Writing & Direction" },
      { id: 5, name: "Action Stunts", category: "Stunts & Action" },
      { id: 6, name: "Direction", category: "Writing & Direction" },
      { id: 7, name: "Voice Over", category: "Music & Voice" },
      { id: 8, name: "Martial Arts", category: "Stunts & Action" },
      { id: 9, name: "Lyrics Writing", category: "Writing & Direction" },
      { id: 10, name: "Choreography", category: "Dance & Movement" },
      { id: 11, name: "Standup Comedy", category: "Acting & Performance" },
      { id: 12, name: "Cinematography", category: "Technical & Camera" },
      { id: 13, name: "Mimicry", category: "Acting & Performance" },
      { id: 14, name: "Playback Singing", category: "Music & Voice" }
    ];
  }
};

/**
 * Get all skills for admin management with usage counts
 */
export const getAdminSkills = async () => {
  try {
    const res = await apiClient.get("/admin/skills");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch admin skills:", err);
    return [];
  }
};

/**
 * Add a new official skill (Admin only)
 */
export const createAdminSkill = async (skillData) => {
  try {
    const res = await apiClient.post("/admin/skills", skillData);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Delete an official skill (Admin only)
 */
export const deleteAdminSkill = async (skillId) => {
  try {
    const res = await apiClient.delete(`/admin/skills/${skillId}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Get standard cinema reference library of skills
 */
export const getSkillsLibrary = async () => {
  try {
    const res = await apiClient.get("/admin/skills/library");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch skills library:", err);
    return [];
  }
};

/**
 * One-click bulk import of standard cinema skills
 */
export const bulkImportSkills = async () => {
  try {
    const res = await apiClient.post("/admin/skills/bulk-import");
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Toggle skill active status (select / deselect from platform UI)
 */
export const toggleAdminSkill = async (skillId) => {
  try {
    const res = await apiClient.patch(`/admin/skills/${skillId}/toggle`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

export const skillsCoreApi = {
  getPublicSkills,
  getAdminSkills,
  createAdminSkill,
  deleteAdminSkill,
  getSkillsLibrary,
  bulkImportSkills,
  toggleAdminSkill,
};

export default skillsCoreApi;
