"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Teacher,
  createTeacher,
  updateTeacher,
  GRADE_CHOICES,
  DIVISION_CHOICES,
  POSITION_CHOICES,
  GENDER_CHOICES,
  YES_NO_CHOICES,
  SPONSOR_CHOICES,
  SPONSOR_LABELS,
} from "@/lib/teachers";
import { getSubjects, Subject } from "@/lib/subjects";
import {
  Section,
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
  FastDateField,
  ShiftField,
  PhotoUploadField,
} from "@/components/AasrFormFields";

const emptyTeacher: Teacher = {
  name: "",
  emp_no: "",
  photo_url: "",
  qatar_id: "",
  qatar_id_expiry: "",
  sponsor_status: "",
  home_country_number: "",
  email: "",
  contact_number: "",
  doj: "",
  contract_expiry: "",
  dob: "",
  age: "",
  gender: "",
  shift: "",
  session: "",
  section: "",
  teaching_other_section: "",
  other_section_details: "",
  ug_qualification: "",
  pg_qualification: "",
  other_diploma: "",
  bed_qualified: "",
  bed_details: "",
  med_qualified: "",
  med_details: "",
  phd_qualified: "",
  position: "",
  experience_iis: "",
  experience_overall: "",
  class_teacher: "",
  class_teacher_grade_division: "",
  total_periods: null,
  continue_service: "",
  discontinue_reason: "",
  departure_date: "",
  grade_divisions: [],
  subject_periods: [],
};

interface Props {
  teacherId?: string;
  initialData?: Teacher;
  /** When true, this is a public self-registration form (no login):
   * on success it shows a confirmation instead of redirecting into
   * the (login-gated) dashboard, and offers to register another. */
  publicMode?: boolean;
}

export default function TeacherForm({ teacherId, initialData, publicMode = false }: Props) {
  const router = useRouter();
  const isEdit = Boolean(teacherId);

  const [form, setForm] = useState<Teacher>(initialData || emptyTeacher);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(Array.isArray(data) ? data : data.results || []))
      .catch(() => setSubjects([]));
  }, []);

  function set<K extends keyof Teacher>(key: K, value: Teacher[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // --- Grade & Division Handling (tick a grade, then tick its divisions) ---
  // activeGrades tracks which grades are "expanded" (ticked) even before any
  // division under them has been ticked yet — mirrors the WP plugin behaviour.
  const [activeGrades, setActiveGrades] = useState<Set<string>>(
    () => new Set((initialData?.grade_divisions || []).map((gd) => gd.grade))
  );

  function isGradeChecked(grade: string) {
    return activeGrades.has(grade);
  }

  function toggleGrade(grade: string, checked: boolean) {
    setActiveGrades((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(grade);
      } else {
        next.delete(grade);
      }
      return next;
    });
    if (!checked) {
      // Unticking a grade drops every division row that belonged to it.
      set("grade_divisions", (form.grade_divisions || []).filter((gd) => gd.grade !== grade));
    }
  }

  function isDivisionChecked(grade: string, division: string) {
    return (form.grade_divisions || []).some((gd) => gd.grade === grade && gd.division === division);
  }

  function toggleDivision(grade: string, division: string, checked: boolean) {
    if (checked) {
      set("grade_divisions", [...(form.grade_divisions || []), { grade, division, periods_per_week: null }]);
    } else {
      set(
        "grade_divisions",
        (form.grade_divisions || []).filter((gd) => !(gd.grade === grade && gd.division === division))
      );
    }
  }

  function getDivisionPeriods(grade: string, division: string) {
    const row = (form.grade_divisions || []).find((gd) => gd.grade === grade && gd.division === division);
    return row?.periods_per_week ?? "";
  }

  function setDivisionPeriods(grade: string, division: string, value: number | null) {
    set(
      "grade_divisions",
      (form.grade_divisions || []).map((gd) =>
        gd.grade === grade && gd.division === division ? { ...gd, periods_per_week: value } : gd
      )
    );
  }

  // --- Subjects & weekly periods handling (tick a subject, enter periods/week) ---
  function isSubjectChecked(subjectId: string) {
    return (form.subject_periods || []).some((sp) => sp.subject_id === subjectId);
  }

  function toggleSubject(subjectId: string, checked: boolean) {
    if (checked) {
      set("subject_periods", [...(form.subject_periods || []), { subject_id: subjectId, periods_per_week: null }]);
    } else {
      set("subject_periods", (form.subject_periods || []).filter((sp) => sp.subject_id !== subjectId));
    }
  }

  function getSubjectPeriods(subjectId: string) {
    const row = (form.subject_periods || []).find((sp) => sp.subject_id === subjectId);
    return row?.periods_per_week ?? "";
  }

  function setSubjectPeriods(subjectId: string, value: number | null) {
    set(
      "subject_periods",
      (form.subject_periods || []).map((sp) => (sp.subject_id === subjectId ? { ...sp, periods_per_week: value } : sp))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    // subject_periods-ൽ subject { id, name } object ഉണ്ടെങ്കിൽ അത് API-ലേക്ക് അയക്കേണ്ട,
    // subject_id (write-only field) മാത്രം മതി.
    const payload: Teacher = {
      ...form,
      subject_periods: (form.subject_periods || []).map((sp) => ({
        id: sp.id,
        subject_id: sp.subject_id,
        periods_per_week: sp.periods_per_week,
      })),
    };

    try {
      if (isEdit && teacherId) {
        await updateTeacher(teacherId, payload);
      } else {
        await createTeacher(payload);
      }
      if (publicMode) {
        setSubmitted(true);
      } else {
        router.push("/dashboard/teachers");
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
            setForm(emptyTeacher);
            setSubmitted(false);
          }}
          className="aasr-btn aasr-btn-primary"
          style={{ marginTop: "1.25rem" }}
        >
          Register another teacher
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="aasr-form">
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

      {/* Personal details */}
      <Section title="Personal Details">
        <PhotoUploadField value={form.photo_url || ""} onChange={(v) => set("photo_url", v)} />
        <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} required />
        <TextField label="Employee No" value={form.emp_no} onChange={(v) => set("emp_no", v)} required />
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
        <TextField label="Email" type="email" value={form.email || ""} onChange={(v) => set("email", v)} />
        <TextField label="Contact Number" value={form.contact_number || ""} onChange={(v) => set("contact_number", v)} />
        <FastDateField label="Date of Joining" value={form.doj || ""} onChange={(v) => set("doj", v)} />
        <FastDateField label="Contract Expiry" value={form.contract_expiry || ""} onChange={(v) => set("contract_expiry", v)} />
        <FastDateField label="Date of Birth" value={form.dob || ""} onChange={(v) => set("dob", v)} minYear={1950} />
        <TextField label="Age" value={form.age || ""} onChange={(v) => set("age", v)} />
        <SelectField label="Gender" value={form.gender || ""} choices={GENDER_CHOICES} onChange={(v) => set("gender", v)} />
        <ShiftField value={form.shift || ""} onChange={(v) => set("shift", v)} />
      </Section>

      {/* Section / session */}
      <Section title="Session & Section">
        <TextField label="Session" value={form.session || ""} onChange={(v) => set("session", v)} />
        <TextField label="Section" value={form.section || ""} onChange={(v) => set("section", v)} />
        <SelectField
          label="Teaching Other Section"
          value={form.teaching_other_section || ""}
          choices={YES_NO_CHOICES}
          onChange={(v) => set("teaching_other_section", v)}
        />
        <TextAreaField
          label="Other Section Details"
          value={form.other_section_details || ""}
          onChange={(v) => set("other_section_details", v)}
        />
      </Section>

      {/* Qualifications */}
      <Section title="Qualifications">
        <TextField label="UG Qualification" value={form.ug_qualification || ""} onChange={(v) => set("ug_qualification", v)} />
        <TextField label="PG Qualification" value={form.pg_qualification || ""} onChange={(v) => set("pg_qualification", v)} />
        <TextField label="Other Diploma" value={form.other_diploma || ""} onChange={(v) => set("other_diploma", v)} />
        <SelectField label="B.Ed Qualified" value={form.bed_qualified || ""} choices={YES_NO_CHOICES} onChange={(v) => set("bed_qualified", v)} />
        <TextField label="B.Ed Details" value={form.bed_details || ""} onChange={(v) => set("bed_details", v)} />
        <SelectField label="M.Ed Qualified" value={form.med_qualified || ""} choices={YES_NO_CHOICES} onChange={(v) => set("med_qualified", v)} />
        <TextField label="M.Ed Details" value={form.med_details || ""} onChange={(v) => set("med_details", v)} />
        <SelectField label="PhD Qualified" value={form.phd_qualified || ""} choices={YES_NO_CHOICES} onChange={(v) => set("phd_qualified", v)} />
      </Section>

      {/* Position / experience */}
      <Section title="Position & Experience">
        <SelectField label="Position" value={form.position || ""} choices={POSITION_CHOICES} onChange={(v) => set("position", v)} />
        <TextField label="Experience (IIS)" value={form.experience_iis || ""} onChange={(v) => set("experience_iis", v)} />
        <TextField label="Experience (Overall)" value={form.experience_overall || ""} onChange={(v) => set("experience_overall", v)} />
        <NumberField label="Total Periods" value={form.total_periods} onChange={(v) => set("total_periods", v)} />
      </Section>

      {/* Class teacher */}
      <Section title="Class Teacher">
        <SelectField label="Class Teacher" value={form.class_teacher || ""} choices={YES_NO_CHOICES} onChange={(v) => set("class_teacher", v)} />
        <TextField
          label="Class Teacher Grade/Division"
          value={form.class_teacher_grade_division || ""}
          onChange={(v) => set("class_teacher_grade_division", v)}
        />
      </Section>

      {/* Service */}
      <Section title="Service Status">
        <SelectField label="Continue Service" value={form.continue_service || ""} choices={YES_NO_CHOICES} onChange={(v) => set("continue_service", v)} />
        <TextAreaField label="Discontinue Reason" value={form.discontinue_reason || ""} onChange={(v) => set("discontinue_reason", v)} />
        <FastDateField label="Departure Date" value={form.departure_date || ""} onChange={(v) => set("departure_date", v)} />
      </Section>

      {/* Grade & Division Handling */}
      <div className="aasr-section">
        <h2 className="aasr-section-title">Grade &amp; Division Handling</h2>
        <p className="aasr-repeater-empty" style={{ padding: 0, marginBottom: "1rem" }}>
          Tick a Grade, then tick the Division(s) you handle for that Grade. This keeps each Grade linked to its own
          Divisions.
        </p>
        {GRADE_CHOICES.map((grade) => (
          <div key={grade} className="aasr-grade-block">
            <label className="aasr-grade-check">
              <input
                type="checkbox"
                checked={isGradeChecked(grade)}
                onChange={(e) => toggleGrade(grade, e.target.checked)}
              />
              {grade}
            </label>
            {isGradeChecked(grade) && (
              <div className="aasr-division-grid">
                {DIVISION_CHOICES.map((division) => {
                  const checked = isDivisionChecked(grade, division);
                  return (
                    <div key={division} className="aasr-check-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => toggleDivision(grade, division, e.target.checked)}
                        />{" "}
                        {division}
                      </label>
                      {checked && (
                        <input
                          type="number"
                          min={0}
                          max={45}
                          className="aasr-check-period-input"
                          placeholder="periods/wk"
                          value={getDivisionPeriods(grade, division)}
                          onChange={(e) =>
                            setDivisionPeriods(grade, division, e.target.value === "" ? null : Number(e.target.value))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Subjects and number of weekly periods handling */}
      <div className="aasr-section">
        <h2 className="aasr-section-title">Subjects and number of weekly periods handling</h2>
        <p className="aasr-repeater-empty" style={{ padding: 0, marginBottom: "1rem" }}>
          Subjects Handled (Select the subjects you teach and enter the number of periods per week for each selected
          subject.)
        </p>
        <div className="aasr-subject-list">
          {subjects.map((s) => {
            const checked = isSubjectChecked(s.id);
            return (
              <div key={s.id} className="aasr-subject-item">
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleSubject(s.id, e.target.checked)}
                  />
                  {s.name}
                </label>
                {checked && (
                  <input
                    type="number"
                    min={0}
                    max={45}
                    className="aasr-input aasr-subject-period-input"
                    placeholder="periods/wk"
                    value={getSubjectPeriods(s.id)}
                    onChange={(e) => setSubjectPeriods(s.id, e.target.value === "" ? null : Number(e.target.value))}
                  />
                )}
              </div>
            );
          })}
          {subjects.length === 0 && (
            <p className="aasr-repeater-empty">No subjects configured yet — add subjects from the dashboard.</p>
          )}
        </div>
      </div>

      <div className="aasr-form-footer">
        <button type="submit" disabled={saving} className="aasr-btn aasr-btn-primary">
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Teacher"}
        </button>
        {!publicMode && (
          <button type="button" onClick={() => router.push("/dashboard/teachers")} className="aasr-btn aasr-btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
