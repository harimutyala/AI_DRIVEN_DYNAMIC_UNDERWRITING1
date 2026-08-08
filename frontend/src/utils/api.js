import axios from 'axios';

// Dynamic API Base URL resolution:
// - Uses VITE_API_URL env variable if explicitly set
// - Uses relative URL '' when running on live cloud deployment (same origin backend + frontend)
// - Uses 'http://127.0.0.1:8000' during local Vite dev server development
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';
  }
  return 'http://127.0.0.1:8000';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL
});

export { API_BASE_URL };
export default api;
