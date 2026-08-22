import api from "./api";

export interface Subject {
  id: string;
  name: string;
  code?: string;
  required_teachers?: number | null;
  created_at?: string;
  updated_at?: string;
}

export async function getSubjects() {
  const res = await api.get("/subjects/");
  return res.data;
}

export async function getSubject(id: string) {
  const res = await api.get(`/subjects/${id}/`);
  return res.data;
}

export async function createSubject(data: Partial<Subject>) {
  const res = await api.post("/subjects/", data);
  return res.data;
}

export async function updateSubject(id: string, data: Partial<Subject>) {
  const res = await api.put(`/subjects/${id}/`, data);
  return res.data;
}

export async function deleteSubject(id: string) {
  await api.delete(`/subjects/${id}/`);
}
