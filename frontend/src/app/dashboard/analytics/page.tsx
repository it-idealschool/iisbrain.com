"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  getOverview,
  getGradeAnalytics,
  getClassCapacity,
  OverviewResponse,
  GradeAnalyticsRow,
  ClassCapacityRow,
} from "@/lib/analytics";

type Status = "GOOD" | "WARNING" | "CRITICAL" | "INFO";

function StatusBadge({ status }: { status: Status }) {
  const variant =
    status === "GOOD"
      ? "aasr-badge--success"
      : status === "WARNING"
      ? "aasr-badge--warning"
      : status === "CRITICAL"
      ? "aasr-badge--error"
      : "aasr-badge--muted";
  const label =
    status === "GOOD" ? "Good" : status === "WARNING" ? "Warning" : status === "CRITICAL" ? "Critical" : "Info";
  return <span className={`aasr-badge ${variant}`}>{label}</span>;
}

export default function SchoolAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [gradeRows, setGradeRows] = useState<GradeAnalyticsRow[]>([]);
  const [classRows, setClassRows] = useState<ClassCapacityRow[]>([]);

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
      const [overviewData, gradeData, classData] = await Promise.all([
        getOverview(),
        getGradeAnalytics(),
        getClassCapacity(),
      ]);
      setOverview(overviewData);
      setGradeRows(gradeData);
      setClassRows(classData);
    } catch {
      setError("Failed to load school analytics. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <p className="aasr-loading-state" style={{ textAlign: "center", marginTop: "5rem" }}>
        Loading…
      </p>
    );
  }

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Analytics</p>
          <h1 className="aasr-page-title">School Overview</h1>
          <p className="aasr-page-subtitle">
            Live manpower and enrolment figures, calculated directly from current student, teacher, admin and
            transport records.
          </p>
        </div>
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}

      {overview && (
        <>
          <div className="aasr-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", marginBottom: "1.75rem" }}>
            <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
              <p className="aasr-stat-card__label">Students</p>
              <p className="aasr-stat-card__title">{overview.kpis.total_students}</p>
            </div>
            <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
              <p className="aasr-stat-card__label">Teachers</p>
              <p className="aasr-stat-card__title">{overview.kpis.total_teachers}</p>
            </div>
            <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
              <p className="aasr-stat-card__label">Admin Staff</p>
              <p className="aasr-stat-card__title">{overview.kpis.total_admin_staff}</p>
            </div>
            <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
              <p className="aasr-stat-card__label">Transport Staff</p>
              <p className="aasr-stat-card__title">{overview.kpis.total_transport_staff}</p>
            </div>
            <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
              <p className="aasr-stat-card__label">Total Employees</p>
              <p className="aasr-stat-card__title">{overview.kpis.total_employees}</p>
            </div>
            <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
              <p className="aasr-stat-card__label">Grades</p>
              <p className="aasr-stat-card__title">{overview.kpis.total_grades}</p>
            </div>
            <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
              <p className="aasr-stat-card__label">Divisions / Sections</p>
              <p className="aasr-stat-card__title">{overview.kpis.total_divisions}</p>
            </div>
            <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
              <p className="aasr-stat-card__label">Avg. Students / Class</p>
              <p className="aasr-stat-card__title">{overview.kpis.average_students_per_class ?? "—"}</p>
            </div>
          </div>

          <section className="aasr-section">
            <h2 className="aasr-section-title">Student : Teacher Ratio</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2.5rem", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 0.3rem", fontSize: "2.1rem", fontWeight: 700 }}>
                  {overview.student_teacher_ratio.current_ratio ?? "—"} : 1
                </p>
                <StatusBadge status={overview.student_teacher_ratio.status} />
              </div>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div>
                  <p className="aasr-stat-card__label">Target ratio</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{overview.student_teacher_ratio.target_ratio} : 1</p>
                </div>
                <div>
                  <p className="aasr-stat-card__label">Required teachers</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{overview.student_teacher_ratio.required_teachers ?? "—"}</p>
                </div>
                <div>
                  <p className="aasr-stat-card__label">Current teachers</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{overview.student_teacher_ratio.current_teachers}</p>
                </div>
                <div>
                  <p className="aasr-stat-card__label">
                    {(overview.student_teacher_ratio.teacher_gap ?? 0) < 0 ? "Shortage" : "Surplus"}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color:
                        (overview.student_teacher_ratio.teacher_gap ?? 0) < 0
                          ? "var(--aasr-error)"
                          : "var(--aasr-success)",
                    }}
                  >
                    {Math.abs(overview.student_teacher_ratio.teacher_gap ?? 0)}
                  </p>
                </div>
              </div>
            </div>
            <p style={{ margin: "1rem 0 0", fontSize: "0.8rem", color: "var(--aasr-muted)" }}>
              The target ratio is a configurable planning benchmark, not a fixed legal requirement — adjust it from
              Registration Settings as school policy changes.
            </p>
          </section>

          <section className="aasr-section">
            <h2 className="aasr-section-title">Grade-wise Student Analysis</h2>
            <div className="aasr-table-wrap">
              <table className="aasr-table">
                <thead>
                  <tr>
                    <th>Grade</th>
                    <th>Boys</th>
                    <th>Girls</th>
                    <th>Total</th>
                    <th>Divisions</th>
                    <th>Avg / Class</th>
                    <th>Capacity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeRows.map((row) => (
                    <tr key={row.grade}>
                      <td>{row.grade_display}</td>
                      <td>{row.boys}</td>
                      <td>{row.girls}</td>
                      <td>{row.total_students}</td>
                      <td>{row.divisions}</td>
                      <td>{row.average_per_class}</td>
                      <td>{row.class_capacity}</td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                  {gradeRows.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        <p className="aasr-empty-state">No student records with a grade set yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="aasr-section">
            <h2 className="aasr-section-title">Division / Class Strength</h2>
            <div className="aasr-table-wrap">
              <table className="aasr-table">
                <thead>
                  <tr>
                    <th>Grade</th>
                    <th>Division</th>
                    <th>Boys</th>
                    <th>Girls</th>
                    <th>Total</th>
                    <th>Capacity</th>
                    <th>Available</th>
                    <th>Occupancy</th>
                    <th>Class Teacher</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classRows.map((row) => (
                    <tr key={`${row.grade}-${row.division}`}>
                      <td>{row.grade_display}</td>
                      <td>{row.division}</td>
                      <td>{row.boys}</td>
                      <td>{row.girls}</td>
                      <td>{row.total_students}</td>
                      <td>{row.class_capacity}</td>
                      <td>{row.available_seats}</td>
                      <td>{row.occupancy_percentage ?? "—"}%</td>
                      <td>
                        {row.class_teacher ? (
                          row.class_teacher
                        ) : (
                          <span style={{ color: "var(--aasr-muted)" }}>No class teacher</span>
                        )}
                        {row.duplicate_class_teacher_assignment && (
                          <span className="aasr-badge aasr-badge--warning" style={{ marginLeft: "0.4rem" }}>
                            Duplicate
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                  {classRows.length === 0 && (
                    <tr>
                      <td colSpan={10}>
                        <p className="aasr-empty-state">No student records with a grade and division set yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
