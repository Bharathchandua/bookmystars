/**
 * BMS Profile Domain API Barrel
 */
export * from "./profileApi";
export * from "./workExperienceApi";
export * from "./measurementsApi";
export * from "./skillsApi";
export * from "./profileAccessApi";

import profileApi from "./profileApi";
import workExperienceApi from "./workExperienceApi";
import measurementsApi from "./measurementsApi";
import profileSkillsApi from "./skillsApi";
import profileAccessApi from "./profileAccessApi";

export {
  profileApi,
  workExperienceApi,
  measurementsApi,
  profileSkillsApi,
  profileAccessApi,
};

export default profileApi;
