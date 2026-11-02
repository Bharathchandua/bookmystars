/**
 * Partner Domain API Barrel
 */
export * from "./partnerRegistrationApi";
export * from "./partnerVerificationApi";

import partnerRegistrationApi from "./partnerRegistrationApi";
import partnerVerificationApi from "./partnerVerificationApi";

export const partnerApi = {
  ...partnerRegistrationApi,
  ...partnerVerificationApi,
};

export default partnerApi;
