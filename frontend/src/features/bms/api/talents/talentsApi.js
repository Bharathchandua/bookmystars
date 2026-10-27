import apiClient from "../../../../shared/services/axiosConfig";

// ==========================================
// TALENTS DIRECTORY APIs (/api/professional/talents)
// ==========================================

export async function getTalentsDirectory({ type, query } = {}) {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (query) params.append("query", query);

  const url = `/professional/talents${params.toString() ? `?${params.toString()}` : ""}`;
  try {
    const response = await apiClient.get(url);
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    return [];
  }
}

export const talentsApi = {
  getTalentsDirectory,
};

export default talentsApi;
