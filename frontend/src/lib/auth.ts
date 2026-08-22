import api from "./api";

export async function login(username: string, password: string) {
  const res = await api.post("/accounts/login/", { username, password });
  localStorage.setItem("access_token", res.data.access);
  localStorage.setItem("refresh_token", res.data.refresh);
  return res.data;
}

export interface RegisterData {
  username: string;
  password: string;
  password2: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
}

export async function register(data: RegisterData) {
  const res = await api.post("/accounts/register/", data);
  return res.data;
}

export async function getMe() {
  const res = await api.get("/accounts/me/");
  return res.data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}