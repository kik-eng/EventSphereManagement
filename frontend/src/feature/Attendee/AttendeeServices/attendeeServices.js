
import apiConfig from '../../../config/ApiConfig';

// 1. Get attendee dashboard statistics
export const getAttendeeDashboardApi = async () => {
  const response = await apiConfig.get('/attendee/dashboard');
  return response.data;
};

// 2. Get all available events
export const getAttendeeEventsApi = async () => {
  const response = await apiConfig.get('/attendee/events');
  return response.data;
};

// 3. Get event details by ID
export const getAttendeeEventByIdApi = async (id) => {
  const response = await apiConfig.get(`/attendee/events/${id}`);
  return response.data;
};

// 4. Register for an event
export const registerForEventApi = async (id) => {
  const response = await apiConfig.post(`/attendee/events/${id}/register`);
  return response.data;
};

// 5. Get attendee registrations
export const getAttendeeRegistrationsApi = async () => {
  const response = await apiConfig.get('/attendee/registrations');
  return response.data;
};

// 6. Cancel a registration
export const cancelAttendeeRegistrationApi = async (id) => {
  const response = await apiConfig.delete(`/attendee/registrations/${id}`);
  return response.data;
};

// 7. Get attendee profile
export const getAttendeeProfileApi = async () => {
  const response = await apiConfig.get('/attendee/profile');
  return response.data;
};

// 8. Update attendee profile
export const updateAttendeeProfileApi = async (data) => {
  const response = await apiConfig.put('/attendee/profile', data);
  return response.data;
};
