import { updateUserProfile } from "./profileApi";

// ==========================================
// USER SKILLS MANAGEMENT
// ==========================================

export function getUserSkills(userId) {
  const key = `bms_skills_${userId || "current"}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveUserSkills(userId, skills) {
  const key = `bms_skills_${userId || "current"}`;
  localStorage.setItem(key, JSON.stringify(skills));
  window.dispatchEvent(new Event("skills_updated"));
  // Persist directly to backend database
  updateUserProfile({ skills }).catch((err) => {
    console.warn("Could not sync skills to backend database:", err);
  });
}

export function syncUserSkillsFromProfile(skills, userId) {
  if (Array.isArray(skills)) {
    const key = `bms_skills_${userId || "current"}`;
    localStorage.setItem(key, JSON.stringify(skills));
    window.dispatchEvent(new Event("skills_updated"));
    return skills;
  }
  return getUserSkills(userId);
}

export function addUserSkill(userId, newSkill) {
  const current = getUserSkills(userId);
  if (!current.includes(newSkill)) {
    const updated = [...current, newSkill];
    saveUserSkills(userId, updated);
    return updated;
  }
  return current;
}

export function removeUserSkill(userId, skillToRemove) {
  const current = getUserSkills(userId);
  const updated = current.filter((s) => s !== skillToRemove);
  saveUserSkills(userId, updated);
  return updated;
}

export const skillsApi = {
  getUserSkills,
  saveUserSkills,
  syncUserSkillsFromProfile,
  addUserSkill,
  removeUserSkill,
};

export default skillsApi;
