"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  ADMIN_POSITION_CHOICES,
  ADMIN_POSITION_LABELS,
  GENDER_CHOICES,
  YES_NO_CHOICES,
  SPONSOR_CHOICES,
  SPONSOR_LABELS,
  AdminStaff,
  AdminPositionRequirement,
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
  getAdminPositionRequirements,
  createAdminPositionRequirement,
  updateAdminPositionRequirement,
} from "@/lib/adminStaff";
import {
  TextField,
  SelectField,
  FastDateField,
  ShiftField,
  PhotoUploadField,
} from "@/components/AasrFormFields";

const emptyStaff: AdminStaff = {
  name: "",
  position: ADMIN_POSITION_CHOICES[0],
  photo_url: "",
  qatar_id: "",
  sponsor_status: "",
  home_country_number: "",
  contact_number: "",
  email: "",
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
  notes: "",
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

export default function AdminStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [requirements, setRequirements] = useState<AdminPositionRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<AdminStaff>(emptyStaff);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [reqDrafts, setReqDrafts] = useState<Record<string, { required_count: string; key_responsibilities: string }>>({});
  const [savingReq, setSavingReq] = useState<string | null>(null);

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
      const [staffData, reqData] = await Promise.all([
        getAdminStaff(),
        getAdminPositionRequirements(),
      ]);
      const staffList: AdminStaff[] = Array.isArray(staffData) ? staffData : staffData.results || [];
      const reqList: AdminPositionRequirement[] = Array.isArray(reqData) ? reqData : reqData.results || [];
      setStaff(staffList);
      setRequirements(reqList);

      const drafts: Record<string, { required_count: string; key_responsibilities: string }> = {};
      for (const pos of ADMIN_POSITION_CHOICES) {
        const existing = reqList.find((r) => r.position === pos);
        drafts[pos] = {
          required_count: String(existing?.required_count ?? 0),
          key_responsibilities: existing?.key_responsibilities ?? "",
        };
      }
      setReqDrafts(drafts);
    } catch {
      setError("Failed to load admin staff data.");
    } finally {
      setLoading(false);
    }
  }

  const currentCountByPosition = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of staff) counts[s.position] = (counts[s.position] || 0) + 1;
    return counts;
  }, [staff]);

  function set(field: keyof AdminStaff, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(s: AdminStaff) {
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
        const updated = await updateAdminStaff(editingId, form);
        setStaff((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await createAdminStaff(form);
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
      await deleteAdminStaff(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Delete failed.");
    }
  }

  function updateReqDraft(position: string, field: "required_count" | "key_responsibilities", value: string) {
    setReqDrafts((prev) => ({ ...prev, [position]: { ...prev[position], [field]: value } }));
  }

  async function saveRequirement(position: string) {
    const draft = reqDrafts[position];
    const existing = requirements.find((r) => r.position === position);
    setSavingReq(position);
    try {
      const payload: AdminPositionRequirement = {
        position,
        required_count: Number(draft.required_count) || 0,
        key_responsibilities: draft.key_responsibilities,
      };
      if (existing?.id) {
        const updated = await updateAdminPositionRequirement(existing.id, payload);
        setRequirements((prev) => prev.map((r) => (r.position === position ? updated : r)));
      } else {
        const created = await createAdminPositionRequirement(payload);
        setRequirements((prev) => [...prev, created]);
      }
    } catch {
      alert("Failed to save requirement.");
    } finally {
      setSavingReq(null);
    }
  }

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 04</p>
          <h1 className="aasr-page-title">Admin Staff</h1>
          <p className="aasr-page-subtitle">
            Administrative &amp; management headcount, targets, and responsibilities.
          </p>
        </div>
        <div className="aasr-actions">
          <Link href="/dashboard/admin-staff/new" className="aasr-btn aasr-btn-primary">
            + Add Staff Member
          </Link>
        </div>
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}
      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : (
        <>
          <section className="aasr-section">
            <h2 className="aasr-section-title">Position Requirements</h2>
            <div className="aasr-table-wrap">
              <table className="aasr-table">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Current</th>
                    <th>Required</th>
                    <th>Shortage / Surplus</th>
                    <th>Key Responsibilities</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_POSITION_CHOICES.map((pos) => {
                    const current = currentCountByPosition[pos] || 0;
                    const draft = reqDrafts[pos] || { required_count: "0", key_responsibilities: "" };
                    const required = Number(draft.required_count) || 0;
                    const diff = current - required;
                    return (
                      <tr key={pos}>
                        <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                          {ADMIN_POSITION_LABELS[pos]}
                        </td>
                        <td>{current}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={draft.required_count}
                            onChange={(e) => updateReqDraft(pos, "required_count", e.target.value)}
                            className="aasr-input"
                            style={{ width: "5rem" }}
                          />
                        </td>
                        <td>
                          <DiffBadge diff={diff} />
                        </td>
                        <td style={{ minWidth: "220px" }}>
                          <input
                            value={draft.key_responsibilities}
                            onChange={(e) => updateReqDraft(pos, "key_responsibilities", e.target.value)}
                            className="aasr-input"
                            placeholder="Key responsibilities"
                          />
                        </td>
                        <td>
                          <button
                            onClick={() => saveRequirement(pos)}
                            disabled={savingReq === pos}
                            className="aasr-btn aasr-btn-ghost aasr-btn-sm"
                          >
                            {savingReq === pos ? "Saving…" : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {editingId && (
          <section className="aasr-section">
            <h2 className="aasr-section-title">Edit Staff Member</h2>
            <form onSubmit={handleSubmit} className="aasr-filter-bar">
              <div className="aasr-field-grid">
                <PhotoUploadField value={form.photo_url || ""} onChange={(v) => set("photo_url", v)} />
                <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} required />
                <SelectField
                  label="Position"
                  value={form.position}
                  choices={ADMIN_POSITION_CHOICES as unknown as string[]}
                  labels={ADMIN_POSITION_LABELS}
                  onChange={(v) => set("position", v)}
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
                <TextField label="Notes" value={form.notes || ""} onChange={(v) => set("notes", v)} />
              </div>
              {formError && <p className="aasr-error-banner" style={{ marginTop: "0.9rem", marginBottom: 0 }}>{formError}</p>}
              <div className="aasr-filter-row">
                <button type="submit" disabled={saving} className="aasr-btn aasr-btn-primary aasr-btn-sm">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" onClick={cancelEdit} className="aasr-btn aasr-btn-ghost aasr-btn-sm">
                  Cancel
                </button>
              </div>
            </form>
          </section>
          )}

          <section className="aasr-section">
            {staff.length === 0 ? (
              <div className="aasr-table-wrap"><p className="aasr-empty-state">No admin staff added yet.</p></div>
            ) : (
              <div className="aasr-table-wrap">
                <table className="aasr-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Sponsor</th>
                      <th>Shift</th>
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
                        <td>{ADMIN_POSITION_LABELS[s.position] || s.position}</td>
                        <td className="aasr-mono">{s.contact_number || "—"}</td>
                        <td>{s.email || "—"}</td>
                        <td>{s.sponsor_status ? SPONSOR_LABELS[s.sponsor_status] || s.sponsor_status : "—"}</td>
                        <td>{s.shift || "—"}</td>
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
