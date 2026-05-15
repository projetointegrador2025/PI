import axios from "axios";
import config from "@/config";

const api = axios.create({
  baseURL: config.API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem("idToken");
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
