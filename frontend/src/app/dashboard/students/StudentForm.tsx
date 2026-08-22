"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Student,
  createStudent,
  updateStudent,
  GRADE_CHOICES,
  GENDER_CHOICES,
} from "@/lib/students";

const emptyStudent: Student = {
  name: "",
  admission_no: "",
  grade: "",
  division: "",
  dob: "",
  gender: "",
  parent_name: "",
  contact_number: "",
};

interface Props {
  studentId?: string;
  initialData?: Student;
}

export default function StudentForm({ studentId, initialData }: Props) {
  const router = useRouter();
  const isEdit = Boolean(studentId);

  const [form, setForm] = useState<Student>(initialData || emptyStudent);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof Student>(key: K, value: Student[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit && studentId) {
        await updateStudent(studentId, form);
      } else {
        await createStudent(form);
      }
      router.push("/dashboard/students");
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

  return (
    <form
      onSubmit={handleSubmit}
      className="aasr-page--narrow"
      style={{ margin: "0 auto", paddingBottom: "4rem" }}
    >
      {error && <p className="aasr-error-banner">{error}</p>}

      <div className="aasr-field-grid">
        <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} required />
        <TextField
          label="Admission No"
          value={form.admission_no}
          onChange={(v) => set("admission_no", v)}
          required
        />

        <SelectField
          label="Grade"
          value={form.grade || ""}
          choices={GRADE_CHOICES}
          onChange={(v) => set("grade", v)}
        />
        <TextField label="Division" value={form.division || ""} onChange={(v) => set("division", v)} />

        <TextField label="Date of Birth" type="date" value={form.dob || ""} onChange={(v) => set("dob", v)} />
        <SelectField
          label="Gender"
          value={form.gender || ""}
          choices={GENDER_CHOICES}
          onChange={(v) => set("gender", v)}
        />

        <TextField
          label="Parent Name"
          value={form.parent_name || ""}
          onChange={(v) => set("parent_name", v)}
        />
        <TextField
          label="Contact Number"
          value={form.contact_number || ""}
          onChange={(v) => set("contact_number", v)}
        />
      </div>

      <div className="aasr-form-footer">
        <button type="submit" disabled={saving} className="aasr-btn aasr-btn-primary">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add student"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/students")}
          className="aasr-btn aasr-btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="aasr-label">
      <span className="aasr-label-text">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="aasr-input"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: string;
  choices: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="aasr-label">
      <span className="aasr-label-text">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="aasr-select"
      >
        <option value="">— Select —</option>
        {choices.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}