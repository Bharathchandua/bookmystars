import apiClient from "../../../../shared/services/axiosConfig";

/**
 * Fetch all active master languages (public endpoint for signup, profile & casting forms)
 */
export const getPublicLanguages = async () => {
  try {
    const res = await apiClient.get("/languages");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch public languages, using fallback:", err);
    return [
      { id: 1, name: "Telugu", nativeName: "తెలుగు", code: "te" },
      { id: 2, name: "Hindi", nativeName: "हिन्दी", code: "hi" },
      { id: 3, name: "Tamil", nativeName: "தமிழ்", code: "ta" },
      { id: 4, name: "Kannada", nativeName: "ಕನ್ನಡ", code: "kn" },
      { id: 5, name: "Malayalam", nativeName: "മലയാളം", code: "ml" },
      { id: 6, name: "English", nativeName: "English", code: "en" },
      { id: 7, name: "Bengali", nativeName: "বাংলা", code: "bn" },
      { id: 8, name: "Marathi", nativeName: "मराठी", code: "mr" },
      { id: 9, name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", code: "pa" },
      { id: 10, name: "Gujarati", nativeName: "ગુજરાતી", code: "gu" },
      { id: 11, name: "Odia", nativeName: "ଓଡ଼ିଆ", code: "or" },
      { id: 12, name: "Bhojpuri", nativeName: "भोजपुरी", code: "bho" }
    ];
  }
};

/**
 * Get all languages for admin management with talent counts
 */
export const getAdminLanguages = async () => {
  try {
    const res = await apiClient.get("/admin/languages");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch admin languages:", err);
    return [];
  }
};

/**
 * Add a new official language to catalog (Admin only)
 */
export const createAdminLanguage = async (languageData) => {
  try {
    const res = await apiClient.post("/admin/languages", languageData);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Delete an official language (Admin only)
 */
export const deleteAdminLanguage = async (languageId) => {
  try {
    const res = await apiClient.delete(`/admin/languages/${languageId}`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Get standard cinema reference library of 24 canonical languages
 */
export const getLanguagesLibrary = async () => {
  try {
    const res = await apiClient.get("/admin/languages/library");
    return res.data;
  } catch (err) {
    console.warn("Failed to fetch languages library:", err);
    return [];
  }
};

/**
 * One-click bulk import all 24 standard cinema languages into catalog
 */
export const bulkImportLanguages = async () => {
  try {
    const res = await apiClient.post("/admin/languages/bulk-import");
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};

/**
 * Toggle language active status (select / deselect from Sign-Up & public UI)
 */
export const toggleAdminLanguage = async (languageId) => {
  try {
    const res = await apiClient.patch(`/admin/languages/${languageId}/toggle`);
    return res.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
};
