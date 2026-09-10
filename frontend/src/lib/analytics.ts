import api from "./api";

export interface OverviewKpis {
  total_students: number;
  total_teachers: number;
  total_admin_staff: number;
  total_transport_staff: number;
  total_employees: number;
  total_grades: number;
  total_divisions: number;
  average_students_per_class: number | null;
}

export interface StudentTeacherRatio {
  current_ratio: number | null;
  target_ratio: number;
  status: "GOOD" | "WARNING" | "CRITICAL" | "INFO";
  required_teachers: number | null;
  current_teachers: number;
  teacher_gap: number | null;
}

export interface OverviewResponse {
  kpis: OverviewKpis;
  student_teacher_ratio: StudentTeacherRatio;
}

export interface GradeAnalyticsRow {
  grade: string;
  grade_display: string;
  boys: number;
  girls: number;
  total_students: number;
  divisions: number;
  average_per_class: number;
  class_capacity: number;
  status: "GOOD" | "WARNING" | "CRITICAL" | "INFO";
}

export interface ClassCapacityRow {
  grade: string;
  grade_display: string;
  division: string;
  boys: number;
  girls: number;
  total_students: number;
  class_capacity: number;
  available_seats: number | null;
  occupancy_percentage: number | null;
  class_teacher: string | null;
  duplicate_class_teacher_assignment: boolean;
  status: "GOOD" | "WARNING" | "CRITICAL" | "INFO";
}

export interface ManpowerSettings {
  student_teacher_ratio_target: string;
  default_class_capacity: number;
  standard_teacher_periods: number;
  workload_warning_percentage: number;
  workload_critical_percentage: number;
  class_capacity_warning_percentage: number;
  contract_expiry_warning_days: number;
  qid_expiry_warning_days: number;
  ratio_warning_margin: string;
  updated_at: string;
}

export async function getOverview(): Promise<OverviewResponse> {
  const res = await api.get("/analytics/overview/");
  return res.data;
}

export async function getGradeAnalytics(): Promise<GradeAnalyticsRow[]> {
  const res = await api.get("/analytics/students/");
  return res.data;
}

export async function getClassCapacity(): Promise<ClassCapacityRow[]> {
  const res = await api.get("/analytics/class-capacity/");
  return res.data;
}

export async function getManpowerSettings(): Promise<ManpowerSettings> {
  const res = await api.get("/analytics/settings/");
  return res.data;
}

export async function updateManpowerSettings(
  data: Partial<ManpowerSettings>
): Promise<ManpowerSettings> {
  const res = await api.put("/analytics/settings/", data);
  return res.data;
}
