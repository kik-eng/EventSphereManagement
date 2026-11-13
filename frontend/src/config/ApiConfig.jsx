import axios from "axios";

console.log("VITE_API_URL Env Variable:", import.meta.env.VITE_API_URL);

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : 'https://event-sphere-management-puce.vercel.app/api';

const apiConfig = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 👈 30 seconds timeout to handle Vercel cold-starts
  headers: {
    'Content-Type': 'application/json',
  },
});

apiConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiConfig;