"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TransportStaff,
  TRANSPORT_ROLE_CHOICES,
  TRANSPORT_ROLE_LABELS,
  GENDER_CHOICES,
  SPONSOR_CHOICES,
  SPONSOR_LABELS,
  QUALIFICATION_CHOICES,
  QUALIFICATION_LABELS,
  createTransportStaff,
  updateTransportStaff,
} from "@/lib/transport";
import {
  Section,
  TextField,
  SelectField,
  FastDateField,
  ShiftField,
  PhotoUploadField,
  FileUploadField,
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
  bus_number: "",
  route: "",
  is_substitute: false,
  doj: "",
  contract_expiry: "",
  dob: "",
  age: "",
  gender: "",
  shift: "",
  qualification: "",
  extra_qualification: "",
  certificate_url: "",
};

interface Props {
  staffId?: string;
  initialData?: TransportStaff;
  /** When true, this is a public self-registration form (no login):
   * on success it shows a confirmation instead of redirecting into
   * the (login-gated) dashboard, and offers to register another. */
  publicMode?: boolean;
}

export default function TransportForm({ staffId, initialData, publicMode = false }: Props) {
  const router = useRouter();
  const isEdit = Boolean(staffId);

  const [form, setForm] = useState<TransportStaff>(initialData || emptyStaff);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof TransportStaff, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && staffId) {
        await updateTransportStaff(staffId, form);
      } else {
        await createTransportStaff(form);
      }
      if (publicMode) {
        setSubmitted(true);
      } else {
        router.push("/dashboard/transport");
      }
    } catch (err: any) {
      const data = err.response?.data;
      setError(
        typeof data === "string"
          ? data
          : data
          ? JSON.stringify(data)
          : "Save failed. Please check the form and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (publicMode && submitted) {
    return (
      <div className="aasr-page aasr-page--narrow" style={{ padding: 0, textAlign: "center" }}>
        <div
          style={{
            background: "var(--aasr-success-bg)",
            border: "1px solid var(--aasr-success)",
            borderRadius: "0.6rem",
            padding: "2rem 1.5rem",
          }}
        >
          <h2 style={{ margin: "0 0 0.5rem", color: "var(--aasr-navy)" }}>Registration submitted</h2>
          <p style={{ margin: 0, color: "var(--aasr-muted)" }}>
            Thank you, {form.name || "your details"} {form.name ? "have" : "has"} been submitted for review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyStaff);
            setSubmitted(false);
          }}
          className="aasr-btn aasr-btn-primary"
          style={{ marginTop: "1.25rem" }}
        >
          Register another staff member
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="aasr-page aasr-page--narrow" style={{ padding: 0 }}>
      {error && (
        <p
          style={{
            color: "var(--aasr-error)",
            background: "var(--aasr-error-bg)",
            border: "1px solid var(--aasr-error)",
            borderRadius: "0.45rem",
            padding: "0.75rem",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
          }}
        >
          {error}
        </p>
      )}

      <Section title="Personal Details">
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
        <TextField label="Bus Number" value={form.bus_number || ""} onChange={(v) => set("bus_number", v)} />
        <TextField label="Route" value={form.route || ""} onChange={(v) => set("route", v)} />
        <FastDateField label="Date of Joining" value={form.doj || ""} onChange={(v) => set("doj", v)} />
        <FastDateField label="Contract Expiry" value={form.contract_expiry || ""} onChange={(v) => set("contract_expiry", v)} />
        <FastDateField label="Date of Birth" value={form.dob || ""} onChange={(v) => set("dob", v)} minYear={1950} />
        <TextField label="Age" value={form.age || ""} onChange={(v) => set("age", v)} />
        <SelectField label="Gender" value={form.gender || ""} choices={GENDER_CHOICES} onChange={(v) => set("gender", v)} />
        <ShiftField value={form.shift || ""} onChange={(v) => set("shift", v)} />
      </Section>

      <Section title="Qualifications">
        <SelectField
          label="Qualification"
          value={form.qualification || ""}
          choices={QUALIFICATION_CHOICES}
          labels={QUALIFICATION_LABELS}
          onChange={(v) => set("qualification", v)}
        />
        <TextField label="Extra Qualifications" value={form.extra_qualification || ""} onChange={(v) => set("extra_qualification", v)} />
        <FileUploadField label="Certificate Upload" value={form.certificate_url || ""} onChange={(v) => set("certificate_url", v)} />
      </Section>

      <Section title="Substitute Status">
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.86rem" }}>
          <input
            type="checkbox"
            checked={!!form.is_substitute}
            onChange={(e) => set("is_substitute", e.target.checked)}
          />
          Substitute staff
        </label>
      </Section>

      <div className="aasr-form-footer">
        <button type="submit" disabled={saving} className="aasr-btn aasr-btn-primary">
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Register Transport Staff"}
        </button>
        {!publicMode && (
          <button type="button" onClick={() => router.push("/dashboard/transport")} className="aasr-btn aasr-btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
