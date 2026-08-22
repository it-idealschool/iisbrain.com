"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMe } from "@/lib/auth";
import { getTeacher, Teacher } from "@/lib/teachers";

const CHART_COLORS = [
  "#16324f", "#c9a227", "#2f6f4e", "#b3413e", "#1f4162",
  "#8a6d1a", "#4c7a63", "#7a3f3d", "#31506e", "#9c8330",
];

function SubjectPeriodsChart({ teacher }: { teacher: Teacher }) {
  const rows = (teacher.subject_periods || [])
    .filter((sp) => sp.subject?.name)
    .map((sp) => ({ name: sp.subject!.name, periods: sp.periods_per_week ?? 0 }));

  if (rows.length === 0) {
    return <p className="aasr-empty-state" style={{ padding: "1rem 0" }}>No subjects assigned yet.</p>;
  }

  const max = Math.max(1, ...rows.map((r) => r.periods));
  const barHeight = 28;
  const gap = 12;
  const chartHeight = rows.length * (barHeight + gap);
  const labelWidth = 140;
  const chartWidth = 420;
  const plotWidth = chartWidth - labelWidth - 40;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 10}`} className="w-full max-w-xl" role="img" aria-label="Periods per week by subject">
      {rows.map((r, i) => {
        const y = i * (barHeight + gap);
        const barW = (r.periods / max) * plotWidth;
        return (
          <g key={r.name}>
            <text x={labelWidth - 8} y={y + barHeight / 2 + 4} textAnchor="end" fontSize="12" fill="var(--aasr-muted)">
              {r.name}
            </text>
            <rect x={labelWidth} y={y} width={Math.max(barW, 2)} height={barHeight} rx={4} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            <text x={labelWidth + Math.max(barW, 2) + 6} y={y + barHeight / 2 + 4} fontSize="12" fill="var(--aasr-ink)">
              {r.periods}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", padding: "0.4rem 0", fontSize: "0.86rem" }}>
      <span style={{ color: "var(--aasr-muted)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(() => loadTeacher())
      .catch(() => router.push("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function loadTeacher() {
    setLoading(true);
    setError("");
    try {
      const data = await getTeacher(params.id);
      setTeacher(data);
    } catch {
      setError("Failed to load teacher.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="aasr-loading-state" style={{ textAlign: "center", marginTop: "5rem" }}>Loading…</p>;
  if (error) return <p className="aasr-error-banner" style={{ maxWidth: "32rem", margin: "5rem auto" }}>{error}</p>;
  if (!teacher) return null;

  const totalWeeklyPeriods = (teacher.subject_periods || []).reduce((sum, sp) => sum + (sp.periods_per_week || 0), 0);

  return (
    <div className="aasr-page aasr-page--narrow print:mt-0">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="no-print aasr-page-header">
        <Link href="/dashboard/teachers" className="aasr-btn aasr-btn-ghost aasr-btn-sm" style={{ paddingLeft: 0 }}>
          &larr; Back to Teachers
        </Link>
        <div className="aasr-actions">
          <button onClick={() => window.print()} className="aasr-btn aasr-btn-secondary">
            Print / Save as PDF
          </button>
          <Link href={`/dashboard/teachers/${params.id}/edit`} className="aasr-btn aasr-btn-primary">
            Edit
          </Link>
        </div>
      </div>

      <div className="print-card aasr-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", borderBottom: "1px solid var(--aasr-border)", paddingBottom: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ width: "7rem", height: "7rem", borderRadius: "999px", overflow: "hidden", background: "var(--aasr-bg)", border: "1px solid var(--aasr-border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {teacher.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={teacher.photo_url} alt={teacher.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "2rem", fontWeight: 600, color: "var(--aasr-gold)" }}>
                {teacher.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="aasr-page-title" style={{ fontSize: "1.6rem" }}>{teacher.name}</h1>
            <p style={{ color: "var(--aasr-muted)", margin: "0.2rem 0 0" }}>
              {[teacher.position, teacher.section].filter(Boolean).join(" · ") || "—"}
            </p>
            <p className="aasr-mono" style={{ color: "var(--aasr-muted)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
              Emp No: {teacher.emp_no}
            </p>
          </div>
        </div>

        <section className="aasr-section">
          <h2 className="aasr-section-title">Personal Details</h2>
          <div className="aasr-field-grid">
            <div>
              <DetailRow label="Email" value={teacher.email} />
              <DetailRow label="Contact Number" value={teacher.contact_number} />
              <DetailRow label="Qatar ID" value={teacher.qatar_id} />
              <DetailRow label="Sponsor Status" value={teacher.sponsor_status} />
              <DetailRow label="Home Country Number" value={teacher.home_country_number} />
              <DetailRow label="Gender" value={teacher.gender} />
              <DetailRow label="Date of Birth" value={teacher.dob} />
              <DetailRow label="Age" value={teacher.age} />
            </div>
            <div>
              <DetailRow label="Date of Joining" value={teacher.doj} />
              <DetailRow label="Contract Expiry" value={teacher.contract_expiry} />
              <DetailRow label="Session" value={teacher.session} />
              <DetailRow label="Class Teacher" value={teacher.class_teacher} />
              <DetailRow label="Class Teacher Grade/Division" value={teacher.class_teacher_grade_division} />
              <DetailRow label="Continue Service" value={teacher.continue_service} />
              <DetailRow label="Total Periods" value={teacher.total_periods} />
            </div>
          </div>
        </section>

        <section className="aasr-section">
          <h2 className="aasr-section-title">Qualifications</h2>
          <div className="aasr-field-grid">
            <div>
              <DetailRow label="UG Qualification" value={teacher.ug_qualification} />
              <DetailRow label="PG Qualification" value={teacher.pg_qualification} />
              <DetailRow label="Other Diploma" value={teacher.other_diploma} />
            </div>
            <div>
              <DetailRow label="B.Ed" value={teacher.bed_qualified} />
              <DetailRow label="M.Ed" value={teacher.med_qualified} />
              <DetailRow label="PhD" value={teacher.phd_qualified} />
              <DetailRow label="Experience (IIS)" value={teacher.experience_iis} />
              <DetailRow label="Experience (Overall)" value={teacher.experience_overall} />
            </div>
          </div>
        </section>

        {teacher.grade_divisions && teacher.grade_divisions.length > 0 && (
          <section className="aasr-section">
            <h2 className="aasr-section-title">Grades / Divisions Handled</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {teacher.grade_divisions.map((gd) => (
                <span key={gd.id || `${gd.grade}-${gd.division}`} className="aasr-badge aasr-badge--muted">
                  {gd.grade} {gd.division} — {gd.periods_per_week ?? 0} periods/wk
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h2 className="aasr-section-title" style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
              Subjects &amp; Periods per Week
            </h2>
            <span style={{ fontSize: "0.85rem", color: "var(--aasr-muted)" }}>
              Total: {totalWeeklyPeriods} periods/week
            </span>
          </div>
          <SubjectPeriodsChart teacher={teacher} />
        </section>
      </div>
    </div>
  );
}
