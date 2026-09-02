import api from "./api";

export const TRANSPORT_ROLE_CHOICES = ["COORDINATOR", "DRIVER", "ATTENDANT"] as const;

export const TRANSPORT_ROLE_LABELS: Record<string, string> = {
  COORDINATOR: "Transport Coordinator",
  DRIVER: "Driver",
  ATTENDANT: "Bus Attendant / Conductor",
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

export interface TransportStaff {
  id?: string;
  name: string;
  role: string;
  photo_url?: string;
  qatar_id?: string;
  sponsor_status?: string;
  home_country_number?: string;
  contact_number?: string;
  email?: string;
  license_number?: string;
  bus_number?: string;
  route?: string;
  is_substitute?: boolean;
  doj?: string;
  contract_expiry?: string;
  dob?: string;
  age?: string;
  gender?: string;
  shift?: string;
  qualification?: string;
  extra_qualification?: string;
  certificate_url?: string;
}

export interface TransportRoleRequirement {
  id?: string;
  role: string;
  required_count: number;
}

export interface TransportSummary {
  id?: string;
  number_of_buses: number;
  students_per_bus?: number | null;
  working_hours?: string;
  overtime_notes?: string;
  substitute_staff_availability?: string;
  route_wise_staffing_notes?: string;
}

// --- Staff members ---

export async function getTransportStaff() {
  const res = await api.get("/transport/staff/");
  return res.data;
}

export async function createTransportStaff(data: TransportStaff) {
  const res = await api.post("/transport/staff/", data);
  return res.data;
}

export async function updateTransportStaff(id: string, data: TransportStaff) {
  const res = await api.put(`/transport/staff/${id}/`, data);
  return res.data;
}

export async function deleteTransportStaff(id: string) {
  await api.delete(`/transport/staff/${id}/`);
}

// --- Role requirements ---

export async function getTransportRoleRequirements() {
  const res = await api.get("/transport/requirements/");
  return res.data;
}

export async function createTransportRoleRequirement(data: TransportRoleRequirement) {
  const res = await api.post("/transport/requirements/", data);
  return res.data;
}

export async function updateTransportRoleRequirement(
  id: string,
  data: TransportRoleRequirement
) {
  const res = await api.put(`/transport/requirements/${id}/`, data);
  return res.data;
}

// --- Fleet summary (treated as a singleton: use the first record, or create one) ---

export async function getTransportSummaries() {
  const res = await api.get("/transport/summary/");
  return res.data;
}

export async function createTransportSummary(data: TransportSummary) {
  const res = await api.post("/transport/summary/", data);
  return res.data;
}

export async function updateTransportSummary(id: string, data: TransportSummary) {
  const res = await api.put(`/transport/summary/${id}/`, data);
  return res.data;
}
