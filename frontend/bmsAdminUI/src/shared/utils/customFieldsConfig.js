/**
 * Dynamic Form Schema & Custom Field Configuration for Client & Partner Requirements.
 * Multi-tenant aware: Supports Global Defaults as well as Company/Academy-level custom field overrides.
 * Allows Super Admin to configure tenant-specific input fields that dynamically appear in
 * Client "Post Shoot Requirement" and Partner "Post Audition Requirement" modals.
 */

const CLIENT_CUSTOM_FIELDS_KEY = "bms_client_custom_fields";
const PARTNER_CUSTOM_FIELDS_KEY = "bms_partner_custom_fields";

export const DEFAULT_CLIENT_CUSTOM_FIELDS = [
  {
    id: "cf_client_wardrobe",
    key: "wardrobePolicy",
    label: "Wardrobe & Styling Support",
    type: "select",
    options: ["Provided by Brand / Production", "Talent to Bring Own Wardrobe", "Partially Provided"],
    required: false,
    placeholder: "Select styling support...",
    defaultValue: "Provided by Brand / Production",
    helpText: "Indicate whether costumes and styling will be supplied on set.",
    enabled: true
  },
  {
    id: "cf_client_usage_rights",
    key: "usageRights",
    label: "Commercial Usage Rights & Territory",
    type: "select",
    options: [
      "Digital & Social Media (1 Year)",
      "National TV + OTT Broadcast (1 Year)",
      "Print Billboards & Magazine Catalogue",
      "All Media Worldwide (In Perpetuity)"
    ],
    required: true,
    placeholder: "Select media usage rights...",
    defaultValue: "Digital & Social Media (1 Year)",
    helpText: "Contractual advertising usage scope for the final shoot assets.",
    enabled: true
  },
  {
    id: "cf_client_fitting_date",
    key: "fittingDate",
    label: "Costume Fitting & Look Test Date",
    type: "date",
    options: [],
    required: false,
    placeholder: "YYYY-MM-DD",
    defaultValue: "",
    helpText: "Scheduled pre-shoot look test or trial fitting.",
    enabled: true
  },
  {
    id: "cf_client_nda_required",
    key: "ndaRequired",
    label: "Requires Signed Brand NDA before Shoot",
    type: "checkbox",
    options: [],
    required: false,
    placeholder: "",
    defaultValue: false,
    helpText: "Talent must sign confidentiality agreement prior to receiving creative brief.",
    enabled: true
  }
];

export const DEFAULT_PARTNER_CUSTOM_FIELDS = [
  {
    id: "cf_partner_exp_level",
    key: "experienceLevel",
    label: "Minimum Training / Experience Level",
    type: "select",
    options: [
      "Beginners / Freshers Welcome",
      "Intermediate (1-2 Years Formal Training)",
      "Advanced / Diploma Holders (3+ Years)",
      "Master / Seasoned Performers"
    ],
    required: true,
    placeholder: "Select required skill level...",
    defaultValue: "Intermediate (1-2 Years Formal Training)",
    helpText: "Filter candidate auditions by academy training history.",
    enabled: true
  },
  {
    id: "cf_partner_audition_format",
    key: "auditionFormat",
    label: "Audition Round Format",
    type: "select",
    options: [
      "Live In-Studio Audition",
      "Online Video Reel Screening + Live Finals",
      "Group Workshop & Callback",
      "Direct Interview & Stage Test"
    ],
    required: true,
    placeholder: "Select audition procedure...",
    defaultValue: "Live In-Studio Audition",
    helpText: "Procedure applicants should prepare for.",
    enabled: true
  },
  {
    id: "cf_partner_audition_fee",
    key: "auditionFee",
    label: "Audition / Enrollment Processing Fee",
    type: "text",
    options: [],
    required: false,
    placeholder: "e.g. Free / No Fee or ₹500",
    defaultValue: "Free / No Fee",
    helpText: "State whether there is any preliminary registration or audition fee.",
    enabled: true
  },
  {
    id: "cf_partner_stipend_scholarship",
    key: "stipendOrScholarship",
    label: "Performance Stipend or Merit Scholarship Available",
    type: "checkbox",
    options: [],
    required: false,
    placeholder: "",
    defaultValue: true,
    helpText: "Check if selected troupe members receive monthly stipends or fee waivers.",
    enabled: true
  }
];

/**
 * Fetch Client custom fields for a specific entity/company or global default
 */
export function getClientCustomFields(entityId = "global") {
  try {
    const isTenant = entityId && entityId !== "global";
    const storageKey = isTenant
      ? `${CLIENT_CUSTOM_FIELDS_KEY}_entity_${entityId}`
      : CLIENT_CUSTOM_FIELDS_KEY;

    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // If company doesn't have custom overrides, inherit global settings
    if (isTenant) {
      const globalRaw = localStorage.getItem(CLIENT_CUSTOM_FIELDS_KEY);
      if (globalRaw) {
        const parsedGlobal = JSON.parse(globalRaw);
        if (Array.isArray(parsedGlobal) && parsedGlobal.length > 0) return parsedGlobal;
      }
    }
  } catch (e) {
    console.warn("Could not parse client custom fields:", e);
  }
  return DEFAULT_CLIENT_CUSTOM_FIELDS;
}

/**
 * Save Client custom fields for a specific entity/company or global default
 */
export function saveClientCustomFields(fields, entityId = "global") {
  try {
    const isTenant = entityId && entityId !== "global";
    const storageKey = isTenant
      ? `${CLIENT_CUSTOM_FIELDS_KEY}_entity_${entityId}`
      : CLIENT_CUSTOM_FIELDS_KEY;

    localStorage.setItem(storageKey, JSON.stringify(fields));
    window.dispatchEvent(
      new CustomEvent("bms_client_fields_updated", {
        detail: { fields, entityId: entityId || "global" }
      })
    );
    return true;
  } catch (e) {
    console.error("Could not save client custom fields:", e);
    return false;
  }
}

/**
 * Reset a specific company's schema to match Global Baseline
 */
export function resetEntityClientCustomFields(entityId) {
  try {
    if (entityId && entityId !== "global") {
      localStorage.removeItem(`${CLIENT_CUSTOM_FIELDS_KEY}_entity_${entityId}`);
      const globalFields = getClientCustomFields("global");
      window.dispatchEvent(
        new CustomEvent("bms_client_fields_updated", {
          detail: { fields: globalFields, entityId }
        })
      );
      return globalFields;
    }
  } catch (e) {}
  return DEFAULT_CLIENT_CUSTOM_FIELDS;
}

/**
 * Fetch Partner custom fields for a specific entity/academy or global default
 */
export function getPartnerCustomFields(entityId = "global") {
  try {
    const isTenant = entityId && entityId !== "global";
    const storageKey = isTenant
      ? `${PARTNER_CUSTOM_FIELDS_KEY}_entity_${entityId}`
      : PARTNER_CUSTOM_FIELDS_KEY;

    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // If academy doesn't have custom overrides, inherit global settings
    if (isTenant) {
      const globalRaw = localStorage.getItem(PARTNER_CUSTOM_FIELDS_KEY);
      if (globalRaw) {
        const parsedGlobal = JSON.parse(globalRaw);
        if (Array.isArray(parsedGlobal) && parsedGlobal.length > 0) return parsedGlobal;
      }
    }
  } catch (e) {
    console.warn("Could not parse partner custom fields:", e);
  }
  return DEFAULT_PARTNER_CUSTOM_FIELDS;
}

/**
 * Save Partner custom fields for a specific entity/academy or global default
 */
export function savePartnerCustomFields(fields, entityId = "global") {
  try {
    const isTenant = entityId && entityId !== "global";
    const storageKey = isTenant
      ? `${PARTNER_CUSTOM_FIELDS_KEY}_entity_${entityId}`
      : PARTNER_CUSTOM_FIELDS_KEY;

    localStorage.setItem(storageKey, JSON.stringify(fields));
    window.dispatchEvent(
      new CustomEvent("bms_partner_fields_updated", {
        detail: { fields, entityId: entityId || "global" }
      })
    );
    return true;
  } catch (e) {
    console.error("Could not save partner custom fields:", e);
    return false;
  }
}

/**
 * Reset a specific academy's schema to match Global Baseline
 */
export function resetEntityPartnerCustomFields(entityId) {
  try {
    if (entityId && entityId !== "global") {
      localStorage.removeItem(`${PARTNER_CUSTOM_FIELDS_KEY}_entity_${entityId}`);
      const globalFields = getPartnerCustomFields("global");
      window.dispatchEvent(
        new CustomEvent("bms_partner_fields_updated", {
          detail: { fields: globalFields, entityId }
        })
      );
      return globalFields;
    }
  } catch (e) {}
  return DEFAULT_PARTNER_CUSTOM_FIELDS;
}
