import api from "./api";

export async function login(username: string, password: string) {
  const res = await api.post("/accounts/login/", { username, password });
  localStorage.setItem("access_token", res.data.access);
  localStorage.setItem("refresh_token", res.data.refresh);
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