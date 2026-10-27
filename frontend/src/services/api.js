/**
 * Central API Service Facade (Preserved for backwards compatibility)
 * All modular feature APIs are now organized under:
 * src/features/bms/api/
 */

export { API_BASE_URL, BACKEND_SERVER_URL } from "../shared/services/BaseUrl";
export * from "../features/bms/api/apiHelpers";
export * from "../features/bms/api/auth/authApi";
export * from "../features/bms/api/profile/profileApi";
export * from "../features/bms/api/profile/workExperienceApi";
export * from "../features/bms/api/profile/measurementsApi";
export * from "../features/bms/api/profile/skillsApi";
export * from "../features/bms/api/media/portfolioApi";
export * from "../features/bms/api/media/videoApi";
export * from "../features/bms/api/media/audioApi";
export * from "../features/bms/api/media/documentApi";
export * from "../features/bms/api/availability/availabilityApi";
export * from "../features/bms/api/opportunities/opportunitiesApi";
export * from "../features/bms/api/opportunities/castingApplicationsApi";
export * from "../features/bms/api/talents/talentsApi";
export * from "../features/bms/api/bookings/bookingsApi";
export * from "../features/bms/api/professional/professionalApi";
export * from "../features/bms/api/messages/chatApi";
export { getRecentBookings, dashboardApi } from "../features/bms/api/dashboard/dashboardApi";
