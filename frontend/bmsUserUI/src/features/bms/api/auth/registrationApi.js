import apiClient from "../../../../shared/services/axiosConfig";
import { extractError } from "../apiHelpers";

/**
 * Register a new user
 * Formats the data to match the Spring Boot RegistrationRequest DTO
 */
export async function registerUser(formData) {
  let genderEnum = (formData.gender || "").toUpperCase();
  if (genderEnum === "PREFER-NOT-TO-SAY" || !["MALE", "FEMALE"].includes(genderEnum)) {
    genderEnum = "OTHER";
  }

  const profileTypes = (formData.selectedProfiles || []).map((type) => {
    const upper = (type || "").toUpperCase().replace(/\s+/g, "_");
    if (["ACTOR", "MODEL", "DANCER", "SINGER", "DIRECTOR", "PRODUCER"].includes(upper)) {
      return upper;
    }
    if (upper.includes("DIRECTOR")) return "DIRECTOR";
    if (upper.includes("PRODUCER") || upper.includes("PRODUCTION")) return "PRODUCER";
    return "OTHER";
  });

  if (formData.customProfession) {
    localStorage.setItem(`bms_custom_profession_${(formData.email || "").toLowerCase().trim()}`, formData.customProfession.trim());
  }

  const payload = {
    accountType: (formData.accountType || "talent").toUpperCase(),
    fullName: (formData.fullName || "").trim(),
    stageName: formData.stageName ? formData.stageName.trim() : null,
    email: (formData.email || "").trim(),
    mobileNumber: (formData.mobileNumber || "").trim(),
    password: formData.password,
    dateOfBirth: formData.dob,
    gender: genderEnum,
    location: (formData.location || "").trim(),
    profileTypes: profileTypes.length > 0 ? profileTypes : ["OTHER"],
    referralSource: formData.howHeard || null,
    termsAccepted: Boolean(formData.agreeTerms),
    customProfession: (formData.primaryProfession || (formData.selectedProfiles && formData.selectedProfiles[0]) || formData.customProfession || "").trim(),
    primaryProfession: (formData.primaryProfession || (formData.selectedProfiles && formData.selectedProfiles[0]) || formData.customProfession || "").trim(),
    languages: Array.isArray(formData.languages) ? formData.languages.join(", ") : (formData.languages || ""),
    actingLanguages: Array.isArray(formData.actingLanguages) ? formData.actingLanguages.join(", ") : (formData.actingLanguages || ""),
    talentCategory: formData.talentCategory || "ACTING",
  };

  try {
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  } catch (err) {
    throw new Error(extractError(err, "Registration failed. Please check your inputs."));
  }
}

export const registrationApi = {
  registerUser,
};

export default registrationApi;
