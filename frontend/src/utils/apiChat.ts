import axios from "axios";

export const apiChat = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_CHAT ?? "http://localhost:8000/api/chat/",
});

apiChat.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});