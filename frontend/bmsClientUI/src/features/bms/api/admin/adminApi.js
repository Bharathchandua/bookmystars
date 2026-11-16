/**
 * Super Admin & Back-Office Operations API
 * Re-exports from partitioned domain services for 100% backward compatibility:
 * - adminAuthApi: Authentication & session management
 * - adminMetricsApi: Overview metrics & financial escrow disbursements
 * - adminCastingsApi: Casting calls screening & moderation
 * - adminTalentKycApi: Talent identity KYC & verification rosette badges
 * - adminRbacApi: Dynamic roles, permission matrix & lot
 * - adminStaffApi: Staff accounts directory & provisioning
 */

export * from "./adminAuthApi";
export * from "./adminMetricsApi";
export * from "./adminCastingsApi";
export * from "./adminTalentKycApi";
export * from "./adminRbacApi";
export * from "./adminStaffApi";
