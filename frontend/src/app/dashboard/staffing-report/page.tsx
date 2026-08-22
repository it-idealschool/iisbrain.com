"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import { getSubjects, Subject } from "@/lib/subjects";
import { getTeachers, Teacher } from "@/lib/teachers";
import {
  ADMIN_POSITION_CHOICES,
  ADMIN_POSITION_LABELS,
  getAdminStaff,
  getAdminPositionRequirements,
  AdminStaff,
  AdminPositionRequirement,
} from "@/lib/adminStaff";
import {
  TRANSPORT_ROLE_CHOICES,
  TRANSPORT_ROLE_LABELS,
  getTransportStaff,
  getTransportRoleRequirements,
  getTransportSummaries,
  TransportStaff,
  TransportRoleRequirement,
  TransportSummary,
} from "@/lib/transport";

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

export default function StaffingReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [adminStaff, setAdminStaff] = useState<AdminStaff[]>([]);
  const [adminReqs, setAdminReqs] = useState<AdminPositionRequirement[]>([]);
  const [transportStaff, setTransportStaff] = useState<TransportStaff[]>([]);
  const [transportReqs, setTransportReqs] = useState<TransportRoleRequirement[]>([]);
  const [transportSummary, setTransportSummary] = useState<TransportSummary | null>(null);

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
      const [
        subjectsData, teachersData, adminStaffData, adminReqData,
        transportStaffData, transportReqData, transportSummaryData,
      ] = await Promise.all([
        getSubjects(), getTeachers(), getAdminStaff(), getAdminPositionRequirements(),
        getTransportStaff(), getTransportRoleRequirements(), getTransportSummaries(),
      ]);

      setSubjects(Array.isArray(subjectsData) ? subjectsData : subjectsData.results || []);
      setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.results || []);
      setAdminStaff(Array.isArray(adminStaffData) ? adminStaffData : adminStaffData.results || []);
      setAdminReqs(Array.isArray(adminReqData) ? adminReqData : adminReqData.results || []);
      setTransportStaff(Array.isArray(transportStaffData) ? transportStaffData : transportStaffData.results || []);
      setTransportReqs(Array.isArray(transportReqData) ? transportReqData : transportReqData.results || []);
      const summaryList: TransportSummary[] = Array.isArray(transportSummaryData) ? transportSummaryData : transportSummaryData.results || [];
      setTransportSummary(summaryList[0] || null);
    } catch {
      setError("Failed to load staffing report.");
    } finally {
      setLoading(false);
    }
  }

  const teachingRows = useMemo(() => {
    return subjects.map((subject) => {
      const teachersForSubject = teachers.filter((t) =>
        (t.subject_periods || []).some((sp) => sp.subject?.id === subject.id)
      );
      const workload = teachersForSubject.reduce((sum, t) => {
        const sp = (t.subject_periods || []).find((s) => s.subject?.id === subject.id);
        return sum + (sp?.periods_per_week || 0);
      }, 0);
      const required = subject.required_teachers ?? null;
      return {
        subject,
        current: teachersForSubject.length,
        required,
        diff: required !== null ? teachersForSubject.length - required : null,
        workload,
        teachersForSubject,
      };
    });
  }, [subjects, teachers]);

  const adminCountByPosition = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of adminStaff) counts[s.position] = (counts[s.position] || 0) + 1;
    return counts;
  }, [adminStaff]);

  const transportCountByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of transportStaff) counts[s.role] = (counts[s.role] || 0) + 1;
    return counts;
  }, [transportStaff]);

  const driverToBusRatio = useMemo(() => {
    const drivers = transportCountByRole["DRIVER"] || 0;
    if (!transportSummary?.number_of_buses) return "—";
    return `${drivers}:${transportSummary.number_of_buses}`;
  }, [transportCountByRole, transportSummary]);

  if (loading) return <p className="aasr-loading-state" style={{ textAlign: "center", marginTop: "5rem" }}>Loading…</p>;
  if (error) return <p className="aasr-error-banner" style={{ maxWidth: "32rem", margin: "5rem auto" }}>{error}</p>;

  return (
    <div className="aasr-page print:mt-0">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="aasr-page-header no-print">
        <div>
          <p className="aasr-eyebrow">Consolidated Report</p>
          <h1 className="aasr-page-title">Staffing Report</h1>
          <p className="aasr-page-subtitle">
            Teaching, admin, and transport staffing against required headcount.
          </p>
        </div>
        <div className="aasr-actions">
          <button onClick={() => window.print()} className="aasr-btn aasr-btn-secondary">
            Print / Save as PDF
          </button>
        </div>
      </div>

      <section className="aasr-section">
        <h2 className="aasr-section-title">1. Teaching Staff</h2>
        <div className="aasr-table-wrap">
          <table className="aasr-table">
            <thead>
              <tr>
                <th>Subject / Department</th>
                <th>Current</th>
                <th>Required</th>
                <th>Vacancy / Surplus</th>
                <th>Workload (periods/wk)</th>
                <th>Qualification &amp; Experience</th>
              </tr>
            </thead>
            <tbody>
              {teachingRows.map((row) => (
                <tr key={row.subject.id}>
                  <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>{row.subject.name}</td>
                  <td>{row.current}</td>
                  <td>{row.required ?? "—"}</td>
                  <td>{row.diff !== null ? <DiffBadge diff={row.diff} /> : "—"}</td>
                  <td>{row.workload}</td>
                  <td style={{ minWidth: "220px", fontSize: "0.8rem", color: "var(--aasr-muted)" }}>
                    {row.teachersForSubject.length === 0
                      ? "—"
                      : row.teachersForSubject
                          .map(
                            (t) =>
                              `${t.name} (${[t.ug_qualification, t.pg_qualification].filter(Boolean).join("/") || "—"}${
                                t.experience_overall ? `, ${t.experience_overall} yrs` : ""
                              })`
                          )
                          .join("; ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="aasr-section">
        <h2 className="aasr-section-title">2. Admin Staff</h2>
        <div className="aasr-table-wrap">
          <table className="aasr-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Current</th>
                <th>Required</th>
                <th>Shortage / Surplus</th>
                <th>Key Responsibilities</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_POSITION_CHOICES.map((pos) => {
                const current = adminCountByPosition[pos] || 0;
                const req = adminReqs.find((r) => r.position === pos);
                const required = req?.required_count ?? 0;
                const diff = current - required;
                return (
                  <tr key={pos}>
                    <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>{ADMIN_POSITION_LABELS[pos]}</td>
                    <td>{current}</td>
                    <td>{required}</td>
                    <td><DiffBadge diff={diff} /></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--aasr-muted)", minWidth: "200px" }}>
                      {req?.key_responsibilities || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="aasr-section-title">3. Transport Staff</h2>
        <div className="aasr-table-wrap" style={{ marginBottom: "1.25rem" }}>
          <table className="aasr-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Current</th>
                <th>Required</th>
                <th>Shortage / Surplus</th>
              </tr>
            </thead>
            <tbody>
              {TRANSPORT_ROLE_CHOICES.map((role) => {
                const current = transportCountByRole[role] || 0;
                const req = transportReqs.find((r) => r.role === role);
                const required = req?.required_count ?? 0;
                const diff = current - required;
                return (
                  <tr key={role}>
                    <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>{TRANSPORT_ROLE_LABELS[role]}</td>
                    <td>{current}</td>
                    <td>{required}</td>
                    <td><DiffBadge diff={diff} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {transportSummary && (
          <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
            <div className="aasr-field-grid">
              <div className="aasr-label">
                <span className="aasr-label-text">Number of Buses</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{transportSummary.number_of_buses}</p>
              </div>
              <div className="aasr-label">
                <span className="aasr-label-text">Students per Bus</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{transportSummary.students_per_bus ?? "—"}</p>
              </div>
              <div className="aasr-label">
                <span className="aasr-label-text">Driver-to-Bus Ratio</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{driverToBusRatio}</p>
              </div>
              <div className="aasr-label">
                <span className="aasr-label-text">Working Hours</span>
                <p style={{ margin: 0, fontWeight: 600 }}>{transportSummary.working_hours || "—"}</p>
              </div>
              <div className="aasr-label aasr-label--full">
                <span className="aasr-label-text">Overtime Notes</span>
                <p style={{ margin: 0 }}>{transportSummary.overtime_notes || "—"}</p>
              </div>
              <div className="aasr-label aasr-label--full">
                <span className="aasr-label-text">Substitute Staff Availability</span>
                <p style={{ margin: 0 }}>{transportSummary.substitute_staff_availability || "—"}</p>
              </div>
              <div className="aasr-label aasr-label--full">
                <span className="aasr-label-text">Route-wise Staffing Notes</span>
                <p style={{ margin: 0 }}>{transportSummary.route_wise_staffing_notes || "—"}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
