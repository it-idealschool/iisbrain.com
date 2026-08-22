import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://127.0.0.1:8000/api
  headers: {
    "Content-Type": "application/json",
  },
});

// Every request-ലും, localStorage-ൽ token ഉണ്ടെങ്കിൽ automatic ആയി header-ൽ ചേർക്കും
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
