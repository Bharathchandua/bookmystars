import apiClient from "../../../../shared/services/axiosConfig";

export async function getMyContacts() {
  try {
    const response = await apiClient.get("/contacts/my");
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn("Could not fetch contacts from server:", err);
    return [];
  }
}

export async function saveUserContact(contactUserId) {
  const response = await apiClient.post(`/contacts/save/${contactUserId}`);
  return response.data;
}

export async function removeUserContact(contactUserId) {
  const response = await apiClient.delete(`/contacts/${contactUserId}`);
  return response.data;
}

export async function toggleStarContact(contactUserId) {
  const response = await apiClient.post(`/contacts/${contactUserId}/toggle-star`);
  return response.data;
}

export async function checkContactSaved(contactUserId) {
  try {
    const response = await apiClient.get(`/contacts/check/${contactUserId}`);
    return response.data || { saved: false, starred: false };
  } catch (err) {
    return { saved: false, starred: false };
  }
}

export const contactsApi = {
  getMyContacts,
  saveUserContact,
  removeUserContact,
  toggleStarContact,
  checkContactSaved
};

export default contactsApi;
