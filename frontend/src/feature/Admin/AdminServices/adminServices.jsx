import apiConfig from '../../../config/ApiConfig';

// 1. Fetch Admin Dashboard Stats (Total Users, Exhibitors, Attendees)
export const getAdminStatsApi = async () => {
  const response = await apiConfig.get('/admin/stats');
  return response.data;
};

// 2. Fetch All Users List (excluding passwords, sorted by createdAt desc)
export const getAllUsersApi = async () => {
  const response = await apiConfig.get('/admin/users');
  return response.data;
};
// Get all Events
// export const getAllEventsApi = async () => {
//   const response = await axios.get(`${API_URL}/admin/events`, getAuthHeaders());
//   return response.data;
// };

// Create New Event
// export const createEventApi = async (eventData) => {
//   const response = await axios.post(`${API_URL}/admin/events`, eventData, getAuthHeaders());
//   return response.data;
// };