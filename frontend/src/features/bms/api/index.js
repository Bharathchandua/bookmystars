/**
 * Central BMS API Directory Root
 * Aggregates all modular feature APIs
 */
export * from "./auth/authApi";
export * from "./profile/profileApi";
export * from "./profile/workExperienceApi";
export * from "./profile/measurementsApi";
export * from "./profile/skillsApi";
export * from "./media/portfolioApi";
export * from "./media/videoApi";
export * from "./media/audioApi";
export * from "./media/documentApi";
export * from "./availability/availabilityApi";
export * from "./opportunities/opportunitiesApi";
export * from "./opportunities/castingApplicationsApi";
export * from "./talents/talentsApi";
export * from "./bookings/bookingsApi";
export * from "./professional/professionalApi";
export * from "./messages/chatApi";
export { getRecentBookings, dashboardApi } from "./dashboard/dashboardApi";
export * from "./admin/adminApi";
export * from "./apiHelpers";
