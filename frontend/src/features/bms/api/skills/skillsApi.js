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
