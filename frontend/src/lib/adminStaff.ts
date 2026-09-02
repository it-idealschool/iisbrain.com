import api from "./api";

export const ADMIN_POSITION_CHOICES = [
  "PRINCIPAL",
  "VICE_PRINCIPAL",
  "HR_ADMIN",
  "ACCOUNTS",
  "RECEPTION",
  "ADMISSIONS",
  "IT_DATA_ENTRY",
  "SECRETARY",
  "PRO_CUSTOMER_SERVICE",
  "OFFICE_SUPPORT",
] as const;

export const ADMIN_POSITION_LABELS: Record<string, string> = {
  PRINCIPAL: "Principal",
  VICE_PRINCIPAL: "Vice Principal",
  HR_ADMIN: "HR / Admin",
  ACCOUNTS: "Accounts",
  RECEPTION: "Reception",
  ADMISSIONS: "Admissions",
  IT_DATA_ENTRY: "IT / Data Entry",
  SECRETARY: "Secretary",
  PRO_CUSTOMER_SERVICE: "PRO / Customer Service",
  OFFICE_SUPPORT: "Office Support Staff",
};

export const GENDER_CHOICES = ["MALE", "FEMALE", "OTHER"];

export const YES_NO_CHOICES = ["YES", "NO"];

export const SPONSOR_CHOICES = ["SPONSORED", "NON_SPONSORED"];

export const SPONSOR_LABELS: Record<string, string> = {
  SPONSORED: "Sponsored",
  NON_SPONSORED: "Non-Sponsored",
};

export const QUALIFICATION_CHOICES = [
  "PLUS_TWO",
  "DIPLOMA",
  "GRADUATED",
  "POST_GRADUATED",
];

export const QUALIFICATION_LABELS: Record<string, string> = {
  PLUS_TWO: "+2",
  DIPLOMA: "Diploma",
  GRADUATED: "Graduated",
  POST_GRADUATED: "Post Graduated",
};

export interface AdminStaff {
  id?: string;
  name: string;
  position: string;
  photo_url?: string;
  qatar_id?: string;
  qatar_id_expiry?: string;
  sponsor_status?: string;
  home_country_number?: string;
  contact_number?: string;
  email?: string;
  doj?: string;
  contract_expiry?: string;
  dob?: string;
  age?: string;
  gender?: string;
  shift?: string;
  qualification?: string;
  extra_qualification?: string;
  certificate_url?: string;
  notes?: string;
}

export interface AdminPositionRequirement {
  id?: string;
  position: string;
  required_count: number;
  key_responsibilities?: string;
}

// --- Staff members ---

export async function getAdminStaff() {
  const res = await api.get("/admin-staff/staff/");
  return res.data;
}

export async function createAdminStaff(data: AdminStaff) {
  const res = await api.post("/admin-staff/staff/", data);
  return res.data;
}

export async function updateAdminStaff(id: string, data: AdminStaff) {
  const res = await api.put(`/admin-staff/staff/${id}/`, data);
  return res.data;
}

export async function deleteAdminStaff(id: string) {
  await api.delete(`/admin-staff/staff/${id}/`);
}

// --- Position requirements (target headcount + responsibilities) ---

export async function getAdminPositionRequirements() {
  const res = await api.get("/admin-staff/requirements/");
  return res.data;
}

export async function createAdminPositionRequirement(data: AdminPositionRequirement) {
  const res = await api.post("/admin-staff/requirements/", data);
  return res.data;
}

export async function updateAdminPositionRequirement(
  id: string,
  data: AdminPositionRequirement
) {
  const res = await api.put(`/admin-staff/requirements/${id}/`, data);
  return res.data;
}
