import api from "./api";

export interface RegistrationSettings {
  teacher_registration_open: boolean;
  admin_staff_registration_open: boolean;
  transport_registration_open: boolean;
  updated_at?: string;
}

/** Public: anyone can read the current on/off state, no login needed. */
export async function getRegistrationSettings(): Promise<RegistrationSettings> {
  const res = await api.get("/settings/registration/");
  return res.data;
}

/** Admin-only: requires a logged-in session (token attached automatically). */
export async function updateRegistrationSettings(
  data: Partial<RegistrationSettings>
): Promise<RegistrationSettings> {
  const res = await api.patch("/settings/registration/", data);
  return res.data;
}
