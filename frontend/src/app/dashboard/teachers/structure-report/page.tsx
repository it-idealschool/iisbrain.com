"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  getTeacherStructureReport,
  TeacherStructureReport,
  SECTION_TYPE_CHOICES,
  LEADERSHIP_ROLE_CHOICES,
} from "@/lib/teachers";

function DiffBadge({ diff }: { diff: number | null }) {
  if (diff === null) return <span className="aasr-badge aasr-badge--muted">No target set</span>;
  const color = diff < 0 ? "var(--aasr-error)" : diff > 0 ? "var(--aasr-gold)" : "var(--aasr-success)";
  const bg = diff < 0 ? "var(--aasr-error-bg)" : diff > 0 ? "#fbf3de" : "var(--aasr-success-bg)";
  const text = diff === 0 ? "OK" : diff > 0 ? `+${diff} surplus` : `${diff} shortage`;
  return (
    <span className="aasr-badge" style={{ color, background: bg }}>
      {text}
    </span>
  );
}

export default function TeacherStructureReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<TeacherStructureReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(() => load())
      .catch(() => router.push("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getTeacherStructureReport();
      setReport(data);
    } catch {
      setError("Failed to load structure report.");
    } finally {
      setLoading(false);
    }
  }

  const totalClassTeachers = report
    ? SECTION_TYPE_CHOICES.reduce((sum, code) => sum + (report.sections[code]?.class_teacher_count || 0), 0)
    : 0;
  const totalCoordinators = report
    ? SECTION_TYPE_CHOICES.reduce((sum, code) => sum + (report.sections[code]?.coordinator_count || 0), 0)
    : 0;

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 01</p>
          <h1 className="aasr-page-title">Teacher Structure Report</h1>
          <p className="aasr-page-subtitle">
            Subject-wise teacher load, section headcount, coordinators, HODs and section leadership at a glance.
          </p>
        </div>
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}

      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : !report ? null : (
        <>
          {/* KPI cards */}
          <div className="aasr-stat-grid" style={{ marginBottom: "2rem" }}>
            <div className="aasr-stat-card">
              <p className="aasr-stat-card__label">Most Subjects Handled</p>
              <p className="aasr-stat-card__title">
                {report.top_subject_teacher ? report.top_subject_teacher.name : "—"}
              </p>
              <p className="aasr-stat-card__desc">
                {report.top_subject_teacher
                  ? `${report.top_subject_teacher.subject_count} subjects`
                  : "No subject data yet"}
              </p>
            </div>
            <div className="aasr-stat-card">
              <p className="aasr-stat-card__label">Class Teachers</p>
              <p className="aasr-stat-card__title">{totalClassTeachers}</p>
              <p className="aasr-stat-card__desc">Across all sections</p>
            </div>
            <div className="aasr-stat-card">
              <p className="aasr-stat-card__label">Coordinators</p>
              <p className="aasr-stat-card__title">{totalCoordinators}</p>
              <p className="aasr-stat-card__desc">Across all sections</p>
            </div>
            <div className="aasr-stat-card">
              <p className="aasr-stat-card__label">HODs Assigned</p>
              <p className="aasr-stat-card__title">{report.hods.length}</p>
              <p className="aasr-stat-card__desc">Out of {report.subjects.length} subjects taught</p>
            </div>
          </div>

          {/* Section-wise breakdown */}
          <section className="aasr-section">
            <h2 className="aasr-section-title">Sections</h2>
            <div className="aasr-stat-grid">
              {SECTION_TYPE_CHOICES.map((code) => {
                const sec = report.sections[code];
                if (!sec) return null;
                return (
                  <div className="aasr-card" key={code} style={{ padding: "1.3rem 1.4rem" }}>
                    <h3 style={{ margin: "0 0 0.75rem", fontFamily: "var(--font-source-serif), Georgia, serif" }}>
                      {sec.label}
                    </h3>
                    <p style={{ margin: "0 0 0.4rem", fontSize: "0.85rem", color: "var(--aasr-muted)" }}>
                      Total teachers: <strong>{sec.total_teachers}</strong>
                    </p>
                    <p style={{ margin: "0 0 0.4rem", fontSize: "0.85rem" }}>
                      Class teachers: <strong>{sec.class_teacher_count}</strong>
                      {sec.class_teachers.length > 0 && (
                        <span style={{ color: "var(--aasr-muted)" }}>
                          {" "}
                          ({sec.class_teachers.map((t) => t.name).join(", ")})
                        </span>
                      )}
                    </p>
                    <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem" }}>
                      Coordinators: <strong>{sec.coordinator_count}</strong>
                      {sec.coordinators.length > 0 && (
                        <span style={{ color: "var(--aasr-muted)" }}>
                          {" "}
                          ({sec.coordinators.map((t) => t.name).join(", ")})
                        </span>
                      )}
                    </p>
                    <div style={{ borderTop: "1px solid var(--aasr-border)", paddingTop: "0.7rem" }}>
                      {LEADERSHIP_ROLE_CHOICES.map((role) => {
                        const holder = sec.leadership[role];
                        if (!holder) return null;
                        return (
                          <p key={role} style={{ margin: "0.2rem 0", fontSize: "0.85rem" }}>
                            {holder.label}: <strong>{holder.name || "—"}</strong>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Subject-wise teacher counts */}
          <section className="aasr-section">
            <h2 className="aasr-section-title">Subject-wise Teacher Count</h2>
            {report.subjects.length === 0 ? (
              <p className="aasr-empty-state">No teachers have been assigned subjects yet.</p>
            ) : (
              <div className="aasr-table-wrap">
                <table className="aasr-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Teachers Assigned</th>
                      <th>Required</th>
                      <th>Shortage / Surplus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.subjects.map((s) => {
                      const diff =
                        s.required_teachers === null || s.required_teachers === undefined
                          ? null
                          : s.teacher_count - s.required_teachers;
                      const isTop = s.subject_id === report.subjects[0]?.subject_id;
                      return (
                        <tr key={s.subject_id}>
                          <td style={{ fontWeight: 500 }}>
                            {s.subject_name}
                            {isTop && s.teacher_count > 0 && (
                              <span className="aasr-badge aasr-badge--info" style={{ marginLeft: "0.5rem" }}>
                                Most teachers
                              </span>
                            )}
                          </td>
                          <td>{s.teacher_count}</td>
                          <td>{s.required_teachers ?? "—"}</td>
                          <td>
                            <DiffBadge diff={diff} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* HODs */}
          <section className="aasr-section">
            <h2 className="aasr-section-title">Heads of Department</h2>
            {report.hods.length === 0 ? (
              <p className="aasr-empty-state">No HODs have been assigned yet.</p>
            ) : (
              <div className="aasr-table-wrap">
                <table className="aasr-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>HOD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.hods.map((h) => (
                      <tr key={h.subject_id}>
                        <td style={{ fontWeight: 500 }}>{h.subject_name}</td>
                        <td>{h.teacher_name}</td>
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
