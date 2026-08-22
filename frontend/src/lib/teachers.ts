import api from "./api";

export const GRADE_CHOICES = [
  "KG-1", "KG-2",
  "GRADE-1", "GRADE-2", "GRADE-3", "GRADE-4", "GRADE-5", "GRADE-6",
  "GRADE-7", "GRADE-8", "GRADE-9", "GRADE-10", "GRADE-11", "GRADE-12",
];

export const POSITION_CHOICES = ["KG", "PRT", "TGT", "PGT", "OTHER"];

export const GENDER_CHOICES = ["MALE", "FEMALE", "OTHER"];

export const YES_NO_CHOICES = ["YES", "NO"];

export const SPONSOR_CHOICES = ["SPONSORED", "NON_SPONSORED"];

export const SPONSOR_LABELS: Record<string, string> = {
  SPONSORED: "Sponsored",
  NON_SPONSORED: "Non-Sponsored",
};

export interface GradeDivision {
  id?: string;
  grade: string;
  division: string;
  periods_per_week: number | null;
}

export interface SubjectPeriod {
  id?: string;
  subject?: { id: string; name: string };
  subject_id: string;
  periods_per_week: number | null;
}

export interface Teacher {
  id?: string;
  name: string;
  emp_no: string;
  photo_url?: string;
  qatar_id?: string;
  sponsor_status?: string;
  home_country_number?: string;
  email?: string;
  contact_number?: string;
  doj?: string;
  contract_expiry?: string;
  dob?: string;
  age?: string;
  gender?: string;
  shift?: string;
  session?: string;
  section?: string;
  teaching_other_section?: string;
  other_section_details?: string;
  ug_qualification?: string;
  pg_qualification?: string;
  other_diploma?: string;
  bed_qualified?: string;
  bed_details?: string;
  med_qualified?: string;
  med_details?: string;
  phd_qualified?: string;
  position?: string;
  experience_iis?: string;
  experience_overall?: string;
  class_teacher?: string;
  class_teacher_grade_division?: string;
  total_periods?: number | null;
  continue_service?: string;
  discontinue_reason?: string;
  departure_date?: string;
  grade_divisions?: GradeDivision[];
  subject_periods?: SubjectPeriod[];
}

export interface TeacherFilters {
  search?: string;
  position?: string;
  section?: string;
  gender?: string;
  continue_service?: string;
  class_teacher?: string;
}

function buildParams(filters: TeacherFilters) {
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params[key] = value;
  });
  return params;
}

export async function getTeachers(filters: TeacherFilters = {}) {
  const res = await api.get("/teachers/", { params: buildParams(filters) });
  return res.data;
}

export async function exportTeachersExcel(filters: TeacherFilters = {}) {
  const res = await api.get("/teachers/export/", {
    params: buildParams(filters),
    responseType: "blob",
  });
  // Browser-ൽ file download trigger ചെയ്യുന്നു
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "teachers.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getTeacher(id: string) {
  const res = await api.get(`/teachers/${id}/`);
  return res.data;
}

export async function createTeacher(data: Teacher) {
  const res = await api.post("/teachers/", data);
  return res.data;
}

export async function updateTeacher(id: string, data: Teacher) {
  const res = await api.put(`/teachers/${id}/`, data);
  return res.data;
}

export async function deleteTeacher(id: string) {
  await api.delete(`/teachers/${id}/`);
}