/**
 * Client Domain API Barrel
 */
export * from "./clientRegistrationApi";
export * from "./clientVerificationApi";

import clientRegistrationApi from "./clientRegistrationApi";
import clientVerificationApi from "./clientVerificationApi";

export const clientApi = {
  ...clientRegistrationApi,
  ...clientVerificationApi,
};

export default clientApi;
