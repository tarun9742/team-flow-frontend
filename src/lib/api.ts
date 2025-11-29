/// <reference types="vite/client" />
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://team-flow-backend-gojy.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add Firebase token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("firebaseToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}); 

export default api;
