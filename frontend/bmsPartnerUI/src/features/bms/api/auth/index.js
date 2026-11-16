/**
 * BMS Authentication & Session API Barrel
 */
export * from "./sessionApi";
export * from "./registrationApi";
export * from "./loginApi";

import {
  getStoredToken,
  getAuthToken,
  getStoredUser,
  getAuthHeaders,
  getAuthUploadHeaders,
  logoutUser,
} from "./sessionApi";
import { registerUser } from "./registrationApi";
import { loginUser, resolveImageUrl } from "./loginApi";

export const authApi = {
  getStoredToken,
  getAuthToken,
  getStoredUser,
  getAuthHeaders,
  getAuthUploadHeaders,
  logoutUser,
  registerUser,
  loginUser,
  resolveImageUrl,
};

export default authApi;
