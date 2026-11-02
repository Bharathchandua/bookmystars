/**
 * Master Skills & Crafts API Barrel
 */
export * from "./skillsCoreApi";
export * from "./craftsApi";

import skillsCoreApi from "./skillsCoreApi";
import craftsApi from "./craftsApi";

export const masterSkillsApi = {
  ...skillsCoreApi,
  ...craftsApi,
};

export default masterSkillsApi;
