import apiConfig from '../../../config/ApiConfig';

// 1. Create a new Hall and batch-generate its booths
export const createHallApi = async (hallData) => {
  const response = await apiConfig.post('/floor-plan/hall', hallData);
  return response.data;
};

// 2. Fetch full floor plan (all halls + booths)  — optional ?hallId= filter
export const getFloorPlanApi = async (hallId = null) => {
  const url = hallId ? `/floor-plan/floor-plan?hallId=${hallId}` : '/floor-plan/floor-plan';
  const response = await apiConfig.get(url);
  return response.data;
};

// 3. Update a booth (category, price, status)
export const updateBoothApi = async (boothId, updates) => {
  const response = await apiConfig.put(`/floor-plan/booth/${boothId}`, updates);
  return response.data;
};

// 4. Approve / assign a booth to an exhibitor
export const approveBoothApi = async (boothId, exhibitorId) => {
  const response = await apiConfig.put(`/floor-plan/booth/${boothId}/approve`, { exhibitorId });
  return response.data;
};

// 5. Get list of all exhibitors (for assignment dropdown)
export const getExhibitorsApi = async () => {
  const response = await apiConfig.get('/floor-plan/exhibitors');
  return response.data;
};
// 6. Fetch all halls from database for dropdowns
// Get list of all halls for dropdowns
export const getAllHallsApi = async () => {
  const token = localStorage.getItem('token');
  const response = await apiConfig.get('/floor-plan/halls', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};