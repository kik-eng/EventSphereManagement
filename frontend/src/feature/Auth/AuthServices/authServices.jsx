import apiConfig from '../../../config/ApiConfig';

// 1. Register API
export const registerApi = async (userData) => {
  const response = await apiConfig.post('/auth/register', userData);
  return response.data;
};

// 2. Login API
export const loginApi = async (credentials) => {
  const response = await apiConfig.post('/auth/login', credentials);
  return response.data;
};

// 3. Forgot Password API
export const forgotPasswordApi = async (emailData) => {
  const response = await apiConfig.post('/auth/forgot-password', emailData);
  return response.data;
};

// 4. Reset Password API
export const resetPasswordApi = async (resetData) => {
  const response = await apiConfig.post('/auth/reset-password', resetData);
  return response.data;
};