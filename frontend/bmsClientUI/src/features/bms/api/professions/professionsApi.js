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
      // Acting & Performance (20)
      { id: 1, name: "Actor", craftCategory: "Acting & Performance" },
      { id: 22, name: "Lead Actor", craftCategory: "Acting & Performance" },
      { id: 23, name: "Lead Actress", craftCategory: "Acting & Performance" },
      { id: 24, name: "Supporting Actor", craftCategory: "Acting & Performance" },
      { id: 25, name: "Character Actor", craftCategory: "Acting & Performance" },
      { id: 26, name: "Child Artist", craftCategory: "Acting & Performance" },
      { id: 27, name: "Theater Artist", craftCategory: "Acting & Performance" },
      { id: 28, name: "Standup Comedian", craftCategory: "Acting & Performance" },
      { id: 29, name: "Mimicry Artist", craftCategory: "Acting & Performance" },
      { id: 30, name: "Dubbing Artist", craftCategory: "Acting & Performance" },
      { id: 31, name: "Body Double", craftCategory: "Acting & Performance" },
      { id: 32, name: "Stunt Double", craftCategory: "Acting & Performance" },
      { id: 33, name: "Background Artist / Extra", craftCategory: "Acting & Performance" },
      { id: 5, name: "Model", craftCategory: "Acting & Performance" },
      { id: 34, name: "Fashion Model", craftCategory: "Acting & Performance" },
      { id: 35, name: "Commercial Model", craftCategory: "Acting & Performance" },
      { id: 36, name: "Runway / Ramp Model", craftCategory: "Acting & Performance" },
      { id: 37, name: "Fitness Model", craftCategory: "Acting & Performance" },
      { id: 38, name: "Hand & Parts Model", craftCategory: "Acting & Performance" },
      { id: 39, name: "Editorial Model", craftCategory: "Acting & Performance" },

      // Writing & Direction (21)
      { id: 2, name: "Director", craftCategory: "Writing & Direction" },
      { id: 13, name: "Film Director", craftCategory: "Writing & Direction" },
      { id: 14, name: "Assistant Director (1st AD)", craftCategory: "Writing & Direction" },
      { id: 15, name: "Second Assistant Director (2nd AD)", craftCategory: "Writing & Direction" },
      { id: 16, name: "Associate Director", craftCategory: "Writing & Direction" },
      { id: 17, name: "Creative Director", craftCategory: "Writing & Direction" },
      { id: 9, name: "Screenplay Writer", craftCategory: "Writing & Direction" },
      { id: 18, name: "Dialogue Writer", craftCategory: "Writing & Direction" },
      { id: 19, name: "Story Writer", craftCategory: "Writing & Direction" },
      { id: 20, name: "Script Supervisor", craftCategory: "Writing & Direction" },
      { id: 21, name: "Continuity Supervisor", craftCategory: "Writing & Direction" },
      { id: 6, name: "Producer", craftCategory: "Writing & Direction" },
      { id: 113, name: "Executive Producer (EP)", craftCategory: "Writing & Direction" },
      { id: 114, name: "Line Producer", craftCategory: "Writing & Direction" },
      { id: 115, name: "Production Manager", craftCategory: "Writing & Direction" },
      { id: 116, name: "Unit Production Manager (UPM)", craftCategory: "Writing & Direction" },
      { id: 117, name: "Production Controller", craftCategory: "Writing & Direction" },
      { id: 118, name: "Location Manager", craftCategory: "Writing & Direction" },
      { id: 119, name: "Post-Production Supervisor", craftCategory: "Writing & Direction" },
      { id: 120, name: "Casting Director", craftCategory: "Writing & Direction" },
      { id: 121, name: "Casting Associate", craftCategory: "Writing & Direction" },

      // Technical & Camera (19)
      { id: 7, name: "Cinematographer", craftCategory: "Technical & Camera" },
      { id: 40, name: "Director of Photography (DoP)", craftCategory: "Technical & Camera" },
      { id: 41, name: "Camera Operator", craftCategory: "Technical & Camera" },
      { id: 42, name: "Steadicam Operator", craftCategory: "Technical & Camera" },
      { id: 43, name: "Drone / Aerial Cinematographer", craftCategory: "Technical & Camera" },
      { id: 46, name: "Gimbal Operator", craftCategory: "Technical & Camera" },
      { id: 47, name: "Underwater Camera Specialist", craftCategory: "Technical & Camera" },
      { id: 48, name: "DIT (Digital Imaging Technician)", craftCategory: "Technical & Camera" },
      { id: 49, name: "Gaffer (Chief Lighting Technician)", craftCategory: "Technical & Camera" },
      { id: 50, name: "Best Boy Electric", craftCategory: "Technical & Camera" },
      { id: 51, name: "Key Grip", craftCategory: "Technical & Camera" },
      { id: 52, name: "Best Boy Grip", craftCategory: "Technical & Camera" },
      { id: 53, name: "Dolly Grip", craftCategory: "Technical & Camera" },
      { id: 54, name: "Rigging Grip", craftCategory: "Technical & Camera" },
      { id: 55, name: "Lighting Programmer", craftCategory: "Technical & Camera" },
      { id: 124, name: "Still Photographer", craftCategory: "Technical & Camera" },
      { id: 125, name: "BTS Videographer (Making-of)", craftCategory: "Technical & Camera" },
      { id: 126, name: "1st Assistant Camera (Focus Puller)", craftCategory: "Technical & Camera" },
      { id: 127, name: "2nd Assistant Camera (Clapper Loader)", craftCategory: "Technical & Camera" },

      // Music & Voice (18)
      { id: 4, name: "Singer", craftCategory: "Music & Voice" },
      { id: 66, name: "Playback Singer (Male)", craftCategory: "Music & Voice" },
      { id: 67, name: "Playback Singer (Female)", craftCategory: "Music & Voice" },
      { id: 65, name: "Music Director / Composer", craftCategory: "Music & Voice" },
      { id: 68, name: "Background Score Composer", craftCategory: "Music & Voice" },
      { id: 69, name: "Lyricist", craftCategory: "Music & Voice" },
      { id: 70, name: "Music Arranger / Programmer", craftCategory: "Music & Voice" },
      { id: 71, name: "Instrumentalist / Session Musician", craftCategory: "Music & Voice" },
      { id: 56, name: "Production Sound Mixer", craftCategory: "Music & Voice" },
      { id: 57, name: "Boom Operator", craftCategory: "Music & Voice" },
      { id: 58, name: "Sound Designer", craftCategory: "Music & Voice" },
      { id: 59, name: "Foley Artist", craftCategory: "Music & Voice" },
      { id: 60, name: "Supervising Sound Editor", craftCategory: "Music & Voice" },
      { id: 61, name: "ADR Recordist", craftCategory: "Music & Voice" },
      { id: 62, name: "Re-recording Mixer", craftCategory: "Music & Voice" },
      { id: 63, name: "Audio Mastering Engineer", craftCategory: "Music & Voice" },
      { id: 64, name: "Sound Effects (SFX) Editor", craftCategory: "Music & Voice" },
      { id: 12, name: "Voice Artist", craftCategory: "Music & Voice" },

      // Dance & Movement (7)
      { id: 3, name: "Dancer", craftCategory: "Dance & Movement" },
      { id: 10, name: "Choreographer", craftCategory: "Dance & Movement" },
      { id: 72, name: "Associate Choreographer", craftCategory: "Dance & Movement" },
      { id: 73, name: "Background Dancer", craftCategory: "Dance & Movement" },
      { id: 74, name: "Classical Dancer", craftCategory: "Dance & Movement" },
      { id: 75, name: "Contemporary Dancer", craftCategory: "Dance & Movement" },
      { id: 76, name: "Hip-Hop / Folk Dancer", craftCategory: "Dance & Movement" },

      // Hair, Makeup & Costume (12)
      { id: 92, name: "Costume Designer", craftCategory: "Hair, Makeup & Costume" },
      { id: 93, name: "Celebrity Fashion Stylist", craftCategory: "Hair, Makeup & Costume" },
      { id: 94, name: "Wardrobe Supervisor", craftCategory: "Hair, Makeup & Costume" },
      { id: 95, name: "Set Costumer", craftCategory: "Hair, Makeup & Costume" },
      { id: 96, name: "Textile & Dye Specialist", craftCategory: "Hair, Makeup & Costume" },
      { id: 97, name: "Costume Standby", craftCategory: "Hair, Makeup & Costume" },
      { id: 98, name: "Key Makeup Artist", craftCategory: "Hair, Makeup & Costume" },
      { id: 99, name: "Prosthetics & SFX Makeup Artist", craftCategory: "Hair, Makeup & Costume" },
      { id: 100, name: "Character Makeup Artist", craftCategory: "Hair, Makeup & Costume" },
      { id: 101, name: "Hair Stylist", craftCategory: "Hair, Makeup & Costume" },
      { id: 102, name: "Wig & Beard Specialist", craftCategory: "Hair, Makeup & Costume" },
      { id: 103, name: "Airbrush Makeup Specialist", craftCategory: "Hair, Makeup & Costume" },

      // Post-Production & VFX (10)
      { id: 8, name: "Film Editor", craftCategory: "Post-Production & VFX" },
      { id: 104, name: "Assistant Film Editor", craftCategory: "Post-Production & VFX" },
      { id: 105, name: "Colorist / DI Specialist", craftCategory: "Post-Production & VFX" },
      { id: 106, name: "VFX Supervisor", craftCategory: "Post-Production & VFX" },
      { id: 107, name: "VFX Compositor", craftCategory: "Post-Production & VFX" },
      { id: 109, name: "Roto & Paint Artist", craftCategory: "Post-Production & VFX" },
      { id: 110, name: "Motion Graphics Designer", craftCategory: "Post-Production & VFX" },
      { id: 111, name: "Title Sequence Designer", craftCategory: "Post-Production & VFX" },
      { id: 112, name: "CGI Artist", craftCategory: "Post-Production & VFX" },
      { id: 128, name: "3D Modeler & Animator", craftCategory: "Post-Production & VFX" },

      // Art & Production Design (9)
      { id: 83, name: "Production Designer", craftCategory: "Art & Production Design" },
      { id: 84, name: "Art Director", craftCategory: "Art & Production Design" },
      { id: 85, name: "Assistant Art Director", craftCategory: "Art & Production Design" },
      { id: 86, name: "Set Decorator", craftCategory: "Art & Production Design" },
      { id: 87, name: "Set Dresser", craftCategory: "Art & Production Design" },
      { id: 88, name: "Prop Master", craftCategory: "Art & Production Design" },
      { id: 89, name: "Construction Coordinator", craftCategory: "Art & Production Design" },
      { id: 90, name: "Concept Artist", craftCategory: "Art & Production Design" },
      { id: 91, name: "Storyboard Artist", craftCategory: "Art & Production Design" },

      // Stunts & Action (7)
      { id: 11, name: "Stunt Performer", craftCategory: "Stunts & Action" },
      { id: 77, name: "Action Director / Stunt Coordinator", craftCategory: "Stunts & Action" },
      { id: 78, name: "Fight Master", craftCategory: "Stunts & Action" },
      { id: 79, name: "Wirework Specialist", craftCategory: "Stunts & Action" },
      { id: 80, name: "Precision Stunt Driver", craftCategory: "Stunts & Action" },
      { id: 81, name: "Horse & Equestrian Stunt Artist", craftCategory: "Stunts & Action" },
      { id: 82, name: "Martial Arts Specialist", craftCategory: "Stunts & Action" },

      // Specialized Craft (2)
      { id: 122, name: "Talent Agent / Artist Manager", craftCategory: "Specialized Craft" },
      { id: 123, name: "Publicist / PR Manager", craftCategory: "Specialized Craft" }
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
