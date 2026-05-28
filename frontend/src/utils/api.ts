import axios from "axios";

const AUTH_CHANGE_EVENT = "authchange";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/auth/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("authToken");
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    }
    return Promise.reject(error);
  }
);
