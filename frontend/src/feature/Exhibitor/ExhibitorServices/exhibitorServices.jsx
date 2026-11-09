import apiConfig from '../../../config/ApiConfig';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

// Backend ki '/uploads/xyz.png' ko full URL bana deta hai
export const fileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return apiConfig.defaults.baseURL.replace(/\/api\/?$/, '') + path;
};

/* ───────── Dashboard & Profile ───────── */
export const getDashboardApi = async () => (await apiConfig.get('/exhibitor/dashboard')).data;
export const getProfileApi = async () => (await apiConfig.get('/exhibitor/profile')).data;
export const updateProfileApi = async (formData) =>
  (await apiConfig.put('/exhibitor/profile', formData, multipart)).data;

/* ───────── Events & Applications ───────── */
export const getOpenEventsApi = async () => (await apiConfig.get('/exhibitor/events')).data;
export const getMyApplicationsApi = async () => (await apiConfig.get('/exhibitor/applications')).data;
export const applyToEventApi = async (formData) =>
  (await apiConfig.post('/exhibitor/applications', formData, multipart)).data;
export const withdrawApplicationApi = async (id) =>
  (await apiConfig.delete(`/exhibitor/applications/${id}`)).data;

/* ───────── Booths ───────── */
export const getEventBoothsApi = async (eventId) =>
  (await apiConfig.get(`/exhibitor/events/${eventId}/booths`)).data;
export const getMyBoothsApi = async () => (await apiConfig.get('/exhibitor/my-booths')).data;
export const reserveBoothApi = async (boothId, eventId) =>
  (await apiConfig.post(`/exhibitor/booths/${boothId}/reserve`, { eventId })).data;
export const cancelReservationApi = async (boothId) =>
  (await apiConfig.delete(`/exhibitor/booths/${boothId}/reserve`)).data;
export const updateBoothDetailsApi = async (boothId, details) =>
  (await apiConfig.put(`/exhibitor/booths/${boothId}/details`, details)).data;
export const getNeighborsApi = async (boothId) =>
  (await apiConfig.get(`/exhibitor/booths/${boothId}/neighbors`)).data;

/* ───────── Messages ───────── */
export const getInboxApi = async () => (await apiConfig.get('/messages')).data;
export const getConversationApi = async (userId) => (await apiConfig.get(`/messages/${userId}`)).data;
export const sendMessageApi = async (receiverId, text) =>
  (await apiConfig.post('/messages', { receiverId, text })).data;
export const getSupportAdminApi = async () => (await apiConfig.get('/messages/support/admin')).data;