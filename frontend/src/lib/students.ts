import api from "./api";
import { GRADE_CHOICES, GENDER_CHOICES } from "./teachers";

export { GRADE_CHOICES, GENDER_CHOICES };

export interface Student {
  id?: string;
  name: string;
  admission_no: string;
  grade?: string;
  division?: string;
  dob?: string;
  gender?: string;
  parent_name?: string;
  contact_number?: string;
}

export interface StudentFilters {
  search?: string;
  grade?: string;
  division?: string;
  gender?: string;
}

function buildParams(filters: StudentFilters) {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = value;
  });
  return params;
}

export async function getStudents(filters: StudentFilters = {}) {
  const res = await api.get("/students/", { params: buildParams(filters) });
  return res.data;
}

export async function exportStudentsExcel(filters: StudentFilters = {}) {
  const res = await api.get("/students/export/", {
    params: buildParams(filters),
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "students.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getStudent(id: string) {
  const res = await api.get(`/students/${id}/`);
  return res.data;
}

export async function createStudent(data: Student) {
  const res = await api.post("/students/", data);
  return res.data;
}

export async function updateStudent(id: string, data: Student) {
  const res = await api.put(`/students/${id}/`, data);
  return res.data;
}

export async function deleteStudent(id: string) {
  await api.delete(`/students/${id}/`);
}