"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  ADMIN_POSITION_CHOICES,
  ADMIN_POSITION_LABELS,
  GENDER_CHOICES,
  SPONSOR_CHOICES,
  SPONSOR_LABELS,
  QUALIFICATION_CHOICES,
  QUALIFICATION_LABELS,
  AdminStaff,
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
} from "@/lib/adminStaff";
import {
  TextField,
  SelectField,
  FastDateField,
  ShiftField,
  PhotoUploadField,
  FileUploadField,
} from "@/components/AasrFormFields";

const emptyStaff: AdminStaff = {
  name: "",
  position: ADMIN_POSITION_CHOICES[0],
  photo_url: "",
  qatar_id: "",
  qatar_id_expiry: "",
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
  qualification: "",
  extra_qualification: "",
  certificate_url: "",
  notes: "",
};

export default function AdminStaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<AdminStaff>(emptyStaff);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

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
      const staffData = await getAdminStaff();
      const staffList: AdminStaff[] = Array.isArray(staffData) ? staffData : staffData.results || [];
      setStaff(staffList);
    } catch {
      setError("Failed to load admin staff data.");
    } finally {
      setLoading(false);
    }
  }

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((s) => {
      const haystack = [
        s.name,
        ADMIN_POSITION_LABELS[s.position] || s.position,
        s.qatar_id,
        s.qatar_id_expiry,
        s.sponsor_status ? SPONSOR_LABELS[s.sponsor_status] || s.sponsor_status : "",
        s.home_country_number,
        s.contact_number,
        s.email,
        s.doj,
        s.contract_expiry,
        s.dob,
        s.age,
        s.gender,
        s.shift,
        s.qualification ? QUALIFICATION_LABELS[s.qualification] || s.qualification : "",
        s.extra_qualification,
        s.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [staff, search]);

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

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 04</p>
          <h1 className="aasr-page-title">Admin Staff</h1>
          <p className="aasr-page-subtitle">
            Search, filter, and manage administrative &amp; management staff.
          </p>
        </div>
        <div className="aasr-actions">
          <Link href="/dashboard/admin-staff/new" className="aasr-btn aasr-btn-primary">
            + Add Staff Member
          </Link>
        </div>
      </div>

      <div className="aasr-filter-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, position, Qatar ID, contact, email…"
          className="aasr-input"
        />
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}
      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : (
        <>
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
                <FastDateField label="Qatar ID Expiry Date" value={form.qatar_id_expiry || ""} onChange={(v) => set("qatar_id_expiry", v)} />
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
                <SelectField
                  label="Qualification"
                  value={form.qualification || ""}
                  choices={QUALIFICATION_CHOICES}
                  labels={QUALIFICATION_LABELS}
                  onChange={(v) => set("qualification", v)}
                />
                <TextField label="Extra Qualifications" value={form.extra_qualification || ""} onChange={(v) => set("extra_qualification", v)} />
                <FileUploadField label="Certificate Upload" value={form.certificate_url || ""} onChange={(v) => set("certificate_url", v)} />
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
            ) : filteredStaff.length === 0 ? (
              <div className="aasr-table-wrap"><p className="aasr-empty-state">No staff match this search.</p></div>
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
                    {filteredStaff.map((s) => (
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
