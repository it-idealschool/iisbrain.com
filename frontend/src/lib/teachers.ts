import api from "./api";

export const GRADE_CHOICES = [
  "KG-1", "KG-2",
  "GRADE-1", "GRADE-2", "GRADE-3", "GRADE-4", "GRADE-5", "GRADE-6",
  "GRADE-7", "GRADE-8", "GRADE-9", "GRADE-10", "GRADE-11", "GRADE-12",
];

// Matches the division list used in the WordPress "IIS Teacher Data Form" plugin.
export const DIVISION_CHOICES = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I",
  "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S",
];

export const POSITION_CHOICES = ["KG", "PRT", "TGT", "PGT", "OTHER"];

export const GENDER_CHOICES = ["MALE", "FEMALE", "OTHER"];

export const YES_NO_CHOICES = ["YES", "NO"];

export const SPONSOR_CHOICES = ["SPONSORED", "NON_SPONSORED"];

export const SPONSOR_LABELS: Record<string, string> = {
  SPONSORED: "Sponsored",
  NON_SPONSORED: "Non-Sponsored",
};

export const SESSION_CHOICES = ["Morning Session", "Evening Session", "Both"];

export const SECTION_CHOICES = ["KG", "Junior", "Boys", "Girls"];

export const SECTION_TYPE_CHOICES = ["BOYS", "GIRLS", "JUNIOR", "KG"];

export const SECTION_TYPE_LABELS: Record<string, string> = {
  BOYS: "Boys Section",
  GIRLS: "Girls Section",
  JUNIOR: "Junior Section",
  KG: "KG Section",
};

export const LEADERSHIP_ROLE_CHOICES = ["VP", "HM", "AHM"];

export const LEADERSHIP_ROLE_LABELS: Record<string, string> = {
  VP: "Vice Principal",
  HM: "Headmaster / Headmistress",
  AHM: "Assistant Headmaster / Headmistress",
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
  qatar_id_expiry?: string;
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
  section_type?: string;
  is_coordinator?: string;
  is_hod?: string;
  hod_subject?: string | null;
  hod_subject_detail?: { id: string; name: string } | null;
  leadership_role?: string;
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

export interface SubjectTeacherCount {
  subject_id: string;
  subject_name: string;
  teacher_count: number;
  required_teachers: number | null;
}

export interface TopSubjectTeacher {
  teacher_id: string;
  name: string;
  subject_count: number;
}

export interface LeadershipHolder {
  label: string;
  name: string | null;
  teacher_id: string | null;
}

export interface SectionStructure {
  label: string;
  total_teachers: number;
  class_teacher_count: number;
  class_teachers: { id: string; name: string }[];
  coordinator_count: number;
  coordinators: { id: string; name: string }[];
  leadership: Record<string, LeadershipHolder>;
}

export interface HodEntry {
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
}

export interface TeacherStructureReport {
  subjects: SubjectTeacherCount[];
  top_subject_teacher: TopSubjectTeacher | null;
  sections: Record<string, SectionStructure>;
  hods: HodEntry[];
}

export async function getTeacherStructureReport(): Promise<TeacherStructureReport> {
  const res = await api.get("/teachers/structure-report/");
  return res.data;
}