"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  TRANSPORT_ROLE_CHOICES,
  TRANSPORT_ROLE_LABELS,
  GENDER_CHOICES,
  YES_NO_CHOICES,
  SPONSOR_CHOICES,
  SPONSOR_LABELS,
  TransportStaff,
  TransportRoleRequirement,
  TransportSummary,
  getTransportStaff,
  createTransportStaff,
  updateTransportStaff,
  deleteTransportStaff,
  getTransportRoleRequirements,
  createTransportRoleRequirement,
  updateTransportRoleRequirement,
  getTransportSummaries,
  createTransportSummary,
  updateTransportSummary,
} from "@/lib/transport";
import {
  TextField,
  SelectField,
  FastDateField,
  ShiftField,
  PhotoUploadField,
} from "@/components/AasrFormFields";

const emptyStaff: TransportStaff = {
  name: "",
  role: TRANSPORT_ROLE_CHOICES[0],
  photo_url: "",
  qatar_id: "",
  sponsor_status: "",
  home_country_number: "",
  contact_number: "",
  email: "",
  license_number: "",
  route: "",
  is_substitute: false,
  doj: "",
  contract_expiry: "",
  dob: "",
  age: "",
  gender: "",
  shift: "",
  ug_qualification: "",
  pg_qualification: "",
  other_diploma: "",
  bed_qualified: "",
  bed_details: "",
  med_qualified: "",
  med_details: "",
  phd_qualified: "",
};

const emptySummary: TransportSummary = {
  number_of_buses: 0,
  students_per_bus: null,
  working_hours: "",
  overtime_notes: "",
  substitute_staff_availability: "",
  route_wise_staffing_notes: "",
};

function DiffBadge({ diff }: { diff: number }) {
  const color = diff < 0 ? "var(--aasr-error)" : diff > 0 ? "var(--aasr-gold)" : "var(--aasr-success)";
  const bg = diff < 0 ? "var(--aasr-error-bg)" : diff > 0 ? "#fbf3de" : "var(--aasr-success-bg)";
  const text = diff === 0 ? "OK" : diff > 0 ? `+${diff} surplus` : `${diff} shortage`;
  return (
    <span className="aasr-badge" style={{ color, background: bg }}>
      {text}
    </span>
  );
}

export default function TransportPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<TransportStaff[]>([]);
  const [requirements, setRequirements] = useState<TransportRoleRequirement[]>([]);
  const [summary, setSummary] = useState<TransportSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<TransportStaff>(emptyStaff);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [reqDrafts, setReqDrafts] = useState<Record<string, string>>({});
  const [savingReq, setSavingReq] = useState<string | null>(null);
  const [summarySaving, setSummarySaving] = useState(false);

  useEffect(() => {
    getMe()
      .then(() => loadAll())
      .catch(() => router.push("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [staffData, reqData, summaryData] = await Promise.all([
        getTransportStaff(),
        getTransportRoleRequirements(),
        getTransportSummaries(),
      ]);
      const staffList: TransportStaff[] = Array.isArray(staffData) ? staffData : staffData.results || [];
      const reqList: TransportRoleRequirement[] = Array.isArray(reqData) ? reqData : reqData.results || [];
      const summaryList: TransportSummary[] = Array.isArray(summaryData) ? summaryData : summaryData.results || [];

      setStaff(staffList);
      setRequirements(reqList);
      if (summaryList.length > 0) setSummary(summaryList[0]);

      const drafts: Record<string, string> = {};
      for (const role of TRANSPORT_ROLE_CHOICES) {
        const existing = reqList.find((r) => r.role === role);
        drafts[role] = String(existing?.required_count ?? 0);
      }
      setReqDrafts(drafts);
    } catch {
      setError("Failed to load transport data.");
    } finally {
      setLoading(false);
    }
  }

  const currentCountByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of staff) counts[s.role] = (counts[s.role] || 0) + 1;
    return counts;
  }, [staff]);

  const driverToBusRatio = useMemo(() => {
    const drivers = currentCountByRole["DRIVER"] || 0;
    if (!summary.number_of_buses) return "—";
    return `${drivers}:${summary.number_of_buses}`;
  }, [currentCountByRole, summary.number_of_buses]);

  function set(field: keyof TransportStaff, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(s: TransportStaff) {
    setEditingId(s.id || null);
    setForm(s);
    setFormError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyStaff);
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        const updated = await updateTransportStaff(editingId, form);
        setStaff((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createTransportStaff(form);
        setStaff((prev) => [...prev, created]);
      }
      cancelEdit();
    } catch {
      setFormError("Failed to save staff member.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteTransportStaff(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Delete failed.");
    }
  }

  async function saveRequirement(role: string) {
    const existing = requirements.find((r) => r.role === role);
    setSavingReq(role);
    try {
      const payload: TransportRoleRequirement = {
        role,
        required_count: Number(reqDrafts[role]) || 0,
      };
      if (existing?.id) {
        const updated = await updateTransportRoleRequirement(existing.id, payload);
        setRequirements((prev) => prev.map((r) => (r.role === role ? updated : r)));
      } else {
        const created = await createTransportRoleRequirement(payload);
        setRequirements((prev) => [...prev, created]);
      }
    } catch {
      alert("Failed to save requirement.");
    } finally {
      setSavingReq(null);
    }
  }

  async function saveSummary() {
    setSummarySaving(true);
    try {
      if (summary.id) {
        const updated = await updateTransportSummary(summary.id, summary);
        setSummary(updated);
      } else {
        const created = await createTransportSummary(summary);
        setSummary(created);
      }
    } catch {
      alert("Failed to save fleet summary.");
    } finally {
      setSummarySaving(false);
    }
  }

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 05</p>
          <h1 className="aasr-page-title">Transport Staff</h1>
          <p className="aasr-page-subtitle">
            Fleet roles, headcount targets, and route-level summary numbers.
          </p>
        </div>
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}
      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : (
        <>
          <section className="aasr-section">
            <h2 className="aasr-section-title">Role Requirements</h2>
            <div className="aasr-table-wrap">
              <table className="aasr-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Current</th>
                    <th>Required</th>
                    <th>Shortage / Surplus</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSPORT_ROLE_CHOICES.map((role) => {
                    const current = currentCountByRole[role] || 0;
                    const required = Number(reqDrafts[role]) || 0;
                    const diff = current - required;
                    return (
                      <tr key={role}>
                        <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>{TRANSPORT_ROLE_LABELS[role]}</td>
                        <td>{current}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={reqDrafts[role] ?? "0"}
                            onChange={(e) => setReqDrafts((prev) => ({ ...prev, [role]: e.target.value }))}
                            className="aasr-input"
                            style={{ width: "5rem" }}
                          />
                        </td>
                        <td><DiffBadge diff={diff} /></td>
                        <td>
                          <button
                            onClick={() => saveRequirement(role)}
                            disabled={savingReq === role}
                            className="aasr-btn aasr-btn-ghost aasr-btn-sm"
                          >
                            {savingReq === role ? "Saving…" : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="aasr-section">
            <h2 className="aasr-section-title">Fleet Summary</h2>
            <div className="aasr-filter-bar">
              <div className="aasr-field-grid">
                <label className="aasr-label">
                  <span className="aasr-label-text">Number of Buses</span>
                  <input
                    type="number"
                    min={0}
                    value={summary.number_of_buses}
                    onChange={(e) => setSummary((prev) => ({ ...prev, number_of_buses: Number(e.target.value) || 0 }))}
                    className="aasr-input"
                  />
                </label>
                <label className="aasr-label">
                  <span className="aasr-label-text">Students per Bus (avg)</span>
                  <input
                    type="number"
                    min={0}
                    value={summary.students_per_bus ?? ""}
                    onChange={(e) => setSummary((prev) => ({ ...prev, students_per_bus: e.target.value ? Number(e.target.value) : null }))}
                    className="aasr-input"
                  />
                </label>
                <div className="aasr-label">
                  <span className="aasr-label-text">Driver-to-Bus Ratio</span>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--aasr-navy)" }}>{driverToBusRatio}</p>
                </div>
                <label className="aasr-label">
                  <span className="aasr-label-text">Working Hours</span>
                  <input
                    value={summary.working_hours || ""}
                    onChange={(e) => setSummary((prev) => ({ ...prev, working_hours: e.target.value }))}
                    className="aasr-input"
                    placeholder="e.g. 7:00 AM - 4:00 PM"
                  />
                </label>
                <label className="aasr-label aasr-label--full">
                  <span className="aasr-label-text">Overtime Notes</span>
                  <input
                    value={summary.overtime_notes || ""}
                    onChange={(e) => setSummary((prev) => ({ ...prev, overtime_notes: e.target.value }))}
                    className="aasr-input"
                  />
                </label>
                <label className="aasr-label aasr-label--full">
                  <span className="aasr-label-text">Substitute Staff Availability</span>
                  <input
                    value={summary.substitute_staff_availability || ""}
                    onChange={(e) => setSummary((prev) => ({ ...prev, substitute_staff_availability: e.target.value }))}
                    className="aasr-input"
                  />
                </label>
                <label className="aasr-label aasr-label--full">
                  <span className="aasr-label-text">Route-wise Staffing Notes</span>
                  <textarea
                    value={summary.route_wise_staffing_notes || ""}
                    onChange={(e) => setSummary((prev) => ({ ...prev, route_wise_staffing_notes: e.target.value }))}
                    className="aasr-textarea"
                    rows={3}
                  />
                </label>
              </div>
              <div className="aasr-filter-row">
                <button onClick={saveSummary} disabled={summarySaving} className="aasr-btn aasr-btn-primary aasr-btn-sm">
                  {summarySaving ? "Saving…" : "Save Fleet Summary"}
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="aasr-section-title">
              {editingId ? "Edit Staff Member" : "Add Staff Member"}
            </h2>
            <form onSubmit={handleSubmit} className="aasr-filter-bar">
              <div className="aasr-field-grid">
                <PhotoUploadField value={form.photo_url || ""} onChange={(v) => set("photo_url", v)} />
                <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} required />
                <SelectField
                  label="Role"
                  value={form.role}
                  choices={TRANSPORT_ROLE_CHOICES as unknown as string[]}
                  labels={TRANSPORT_ROLE_LABELS}
                  onChange={(v) => set("role", v)}
                />
                <TextField label="Qatar ID" value={form.qatar_id || ""} onChange={(v) => set("qatar_id", v)} />
                <SelectField
                  label="Sponsor Status"
                  value={form.sponsor_status || ""}
                  choices={SPONSOR_CHOICES}
                  labels={SPONSOR_LABELS}
                  onChange={(v) => set("sponsor_status", v)}
                />
                <TextField label="Home Country Number" value={form.home_country_number || ""} onChange={(v) => set("home_country_number", v)} />
                <TextField label="Contact Number" value={form.contact_number || ""} onChange={(v) => set("contact_number", v)} />
                <TextField label="Email" type="email" value={form.email || ""} onChange={(v) => set("email", v)} />
                <TextField label="License Number (drivers)" value={form.license_number || ""} onChange={(v) => set("license_number", v)} />
                <TextField label="Route" value={form.route || ""} onChange={(v) => set("route", v)} />
                <FastDateField label="Date of Joining" value={form.doj || ""} onChange={(v) => set("doj", v)} />
                <FastDateField label="Contract Expiry" value={form.contract_expiry || ""} onChange={(v) => set("contract_expiry", v)} />
                <FastDateField label="Date of Birth" value={form.dob || ""} onChange={(v) => set("dob", v)} minYear={1950} />
                <TextField label="Age" value={form.age || ""} onChange={(v) => set("age", v)} />
                <SelectField label="Gender" value={form.gender || ""} choices={GENDER_CHOICES} onChange={(v) => set("gender", v)} />
                <ShiftField value={form.shift || ""} onChange={(v) => set("shift", v)} />
                <TextField label="UG Qualification" value={form.ug_qualification || ""} onChange={(v) => set("ug_qualification", v)} />
                <TextField label="PG Qualification" value={form.pg_qualification || ""} onChange={(v) => set("pg_qualification", v)} />
                <TextField label="Other Diploma" value={form.other_diploma || ""} onChange={(v) => set("other_diploma", v)} />
                <SelectField label="B.Ed Qualified" value={form.bed_qualified || ""} choices={YES_NO_CHOICES} onChange={(v) => set("bed_qualified", v)} />
                <TextField label="B.Ed Details" value={form.bed_details || ""} onChange={(v) => set("bed_details", v)} />
                <SelectField label="M.Ed Qualified" value={form.med_qualified || ""} choices={YES_NO_CHOICES} onChange={(v) => set("med_qualified", v)} />
                <TextField label="M.Ed Details" value={form.med_details || ""} onChange={(v) => set("med_details", v)} />
                <SelectField label="PhD Qualified" value={form.phd_qualified || ""} choices={YES_NO_CHOICES} onChange={(v) => set("phd_qualified", v)} />
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.86rem" }}>
                  <input type="checkbox" checked={!!form.is_substitute} onChange={(e) => set("is_substitute", e.target.checked)} />
                  Substitute staff
                </label>
              </div>
              {formError && <p className="aasr-error-banner" style={{ marginTop: "0.9rem", marginBottom: 0 }}>{formError}</p>}
              <div className="aasr-filter-row">
                <button type="submit" disabled={saving} className="aasr-btn aasr-btn-primary aasr-btn-sm">
                  {saving ? "Saving…" : editingId ? "Save Changes" : "+ Add Staff Member"}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} className="aasr-btn aasr-btn-ghost aasr-btn-sm">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {staff.length === 0 ? (
              <div className="aasr-table-wrap"><p className="aasr-empty-state">No transport staff added yet.</p></div>
            ) : (
              <div className="aasr-table-wrap">
                <table className="aasr-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Route</th>
                      <th>Contact</th>
                      <th>Sponsor</th>
                      <th>Shift</th>
                      <th>Substitute</th>
                      <th className="aasr-cell-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {s.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.photo_url} alt={s.name} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ color: "var(--aasr-muted)", fontSize: "0.75rem" }}>—</span>
                          )}
                        </td>
                        <td>{s.name}</td>
                        <td>{TRANSPORT_ROLE_LABELS[s.role] || s.role}</td>
                        <td>{s.route || "—"}</td>
                        <td className="aasr-mono">{s.contact_number || "—"}</td>
                        <td>{s.sponsor_status ? SPONSOR_LABELS[s.sponsor_status] || s.sponsor_status : "—"}</td>
                        <td>{s.shift || "—"}</td>
                        <td>{s.is_substitute ? "Yes" : "No"}</td>
                        <td className="aasr-cell-actions">
                          <button onClick={() => startEdit(s)} className="aasr-btn aasr-btn-ghost aasr-btn-sm">Edit</button>
                          <button onClick={() => s.id && handleDelete(s.id, s.name)} className="aasr-btn aasr-btn-danger aasr-btn-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
