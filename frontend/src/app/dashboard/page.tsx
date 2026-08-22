"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMe } from "@/lib/auth";
import { getTeachers, Teacher } from "@/lib/teachers";
import { getStudents, Student } from "@/lib/students";
import { getSubjects, Subject } from "@/lib/subjects";
import { ADMIN_POSITION_CHOICES, getAdminStaff, getAdminPositionRequirements, AdminStaff, AdminPositionRequirement } from "@/lib/adminStaff";
import { TRANSPORT_ROLE_CHOICES, getTransportStaff, getTransportRoleRequirements, TransportStaff, TransportRoleRequirement } from "@/lib/transport";

type CategoryBar = { label: string; current: number; required: number; href: string };

function StaffingBarChart({ categories }: { categories: CategoryBar[] }) {
  const max = Math.max(1, ...categories.flatMap((c) => [c.current, c.required]));
  const rowHeight = 56;
  const chartHeight = categories.length * rowHeight;
  const labelWidth = 130;
  const chartWidth = 560;
  const plotWidth = chartWidth - labelWidth - 50;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 10}`} className="w-full" role="img" aria-label="Current vs required staffing by category">
      {categories.map((c, i) => {
        const y = i * rowHeight;
        const currentW = (c.current / max) * plotWidth;
        const requiredW = (c.required / max) * plotWidth;
        return (
          <g key={c.label}>
            <text x={labelWidth - 10} y={y + 16} textAnchor="end" fontSize="12.5" fontWeight={600} fill="var(--aasr-ink, #1a1d23)">
              {c.label}
            </text>
            <rect x={labelWidth} y={y + 2} width={Math.max(currentW, 2)} height={16} rx={3} fill="#16324f" />
            <text x={labelWidth + Math.max(currentW, 2) + 6} y={y + 14} fontSize="11" fill="#16324f">
              {c.current} current
            </text>
            <rect x={labelWidth} y={y + 24} width={Math.max(requiredW, 2)} height={16} rx={3} fill="#c9a227" />
            <text x={labelWidth + Math.max(requiredW, 2) + 6} y={y + 36} fontSize="11" fill="#8a6d1a">
              {c.required} required
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GenderDonut({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return <p className="aasr-empty-state" style={{ padding: "1rem 0" }}>No student data yet.</p>;

  const colors = ["#16324f", "#c9a227", "#2f6f4e", "#b3413e"];
  const radius = 60;
  const cx = 75;
  const cy = 75;
  let angleStart = -90;

  const arcs = entries.map(([label, value], i) => {
    const fraction = value / total;
    const angle = fraction * 360;
    const angleEnd = angleStart + angle;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = cx + radius * Math.cos((Math.PI * angleStart) / 180);
    const y1 = cy + radius * Math.sin((Math.PI * angleStart) / 180);
    const x2 = cx + radius * Math.cos((Math.PI * angleEnd) / 180);
    const y2 = cy + radius * Math.sin((Math.PI * angleEnd) / 180);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const color = colors[i % colors.length];
    angleStart = angleEnd;
    return { path, color, label, value };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Students by gender">
        {arcs.map((a) => (
          <path key={a.label} d={a.path} fill={a.color} stroke="#fff" strokeWidth="2" />
        ))}
      </svg>
      <div>
        {arcs.map((a) => (
          <div key={a.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", marginBottom: "0.35rem" }}>
            <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "999px", background: a.color, flexShrink: 0 }} />
            <span style={{ color: "var(--aasr-muted)" }}>{a.label}</span>
            <span style={{ fontWeight: 600 }}>{a.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [adminStaff, setAdminStaff] = useState<AdminStaff[]>([]);
  const [adminReqs, setAdminReqs] = useState<AdminPositionRequirement[]>([]);
  const [transportStaff, setTransportStaff] = useState<TransportStaff[]>([]);
  const [transportReqs, setTransportReqs] = useState<TransportRoleRequirement[]>([]);

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
        teachersData, studentsData, subjectsData,
        adminStaffData, adminReqData, transportStaffData, transportReqData,
      ] = await Promise.all([
        getTeachers(), getStudents(), getSubjects(),
        getAdminStaff(), getAdminPositionRequirements(),
        getTransportStaff(), getTransportRoleRequirements(),
      ]);

      setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.results || []);
      setStudents(Array.isArray(studentsData) ? studentsData : studentsData.results || []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : subjectsData.results || []);
      setAdminStaff(Array.isArray(adminStaffData) ? adminStaffData : adminStaffData.results || []);
      setAdminReqs(Array.isArray(adminReqData) ? adminReqData : adminReqData.results || []);
      setTransportStaff(Array.isArray(transportStaffData) ? transportStaffData : transportStaffData.results || []);
      setTransportReqs(Array.isArray(transportReqData) ? transportReqData : transportReqData.results || []);
    } catch {
      setError("Failed to load overview data.");
    } finally {
      setLoading(false);
    }
  }

  const requiredTeachersTotal = useMemo(
    () => subjects.reduce((sum, s) => sum + (s.required_teachers || 0), 0),
    [subjects]
  );
  const requiredAdminTotal = useMemo(
    () => adminReqs.reduce((sum, r) => sum + (r.required_count || 0), 0),
    [adminReqs]
  );
  const requiredTransportTotal = useMemo(
    () => transportReqs.reduce((sum, r) => sum + (r.required_count || 0), 0),
    [transportReqs]
  );

  const categories: CategoryBar[] = [
    { label: "Teaching", current: teachers.length, required: requiredTeachersTotal, href: "/dashboard/staffing-report" },
    { label: "Admin", current: adminStaff.length, required: requiredAdminTotal, href: "/dashboard/admin-staff" },
    { label: "Transport", current: transportStaff.length, required: requiredTransportTotal, href: "/dashboard/transport" },
  ];

  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of students) {
      const g = s.gender || "Unspecified";
      counts[g] = (counts[g] || 0) + 1;
    }
    return counts;
  }, [students]);

  const totalShortage = categories.reduce((sum, c) => sum + Math.max(0, c.required - c.current), 0);

  if (loading) return <p className="aasr-loading-state" style={{ textAlign: "center", marginTop: "5rem" }}>Loading…</p>;

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Overview</p>
          <h1 className="aasr-page-title">Staffing at a Glance</h1>
          <p className="aasr-page-subtitle">
            A snapshot of teaching, admin, and transport staffing across the school.
          </p>
        </div>
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}

      {/* Top stat numbers */}
      <div className="aasr-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", marginBottom: "2rem" }}>
        <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
          <p className="aasr-stat-card__label">Teachers</p>
          <p className="aasr-stat-card__title">{teachers.length}</p>
        </div>
        <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
          <p className="aasr-stat-card__label">Students</p>
          <p className="aasr-stat-card__title">{students.length}</p>
        </div>
        <div className="aasr-card" style={{ padding: "1.1rem 1.4rem" }}>
          <p className="aasr-stat-card__label">Subjects</p>
          <p className="aasr-stat-card__title">{subjects.length}</p>
        </div>
        <div className="aasr-card" style={{ padding: "1.1rem 1.4rem", borderLeftColor: totalShortage > 0 ? "var(--aasr-error)" : "var(--aasr-success)" }}>
          <p className="aasr-stat-card__label">Total Shortage</p>
          <p className="aasr-stat-card__title" style={{ color: totalShortage > 0 ? "var(--aasr-error)" : "var(--aasr-success)" }}>
            {totalShortage}
          </p>
        </div>
      </div>

      {/* Staffing chart + student gender split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem", marginBottom: "1rem" }} className="sm:grid-cols-2">
        <section className="aasr-card" style={{ padding: "1.4rem" }}>
          <h2 className="aasr-section-title" style={{ borderBottom: "none", paddingBottom: 0 }}>
            Current vs Required Staffing
          </h2>
          <StaffingBarChart categories={categories} />
        </section>

        <section className="aasr-card" style={{ padding: "1.4rem" }}>
          <h2 className="aasr-section-title" style={{ borderBottom: "none", paddingBottom: 0 }}>
            Students by Gender
          </h2>
          <GenderDonut counts={genderCounts} />
        </section>
      </div>

      {/* Quick links */}
      <section className="aasr-section" style={{ marginTop: "1.5rem" }}>
        <h2 className="aasr-section-title">Manage</h2>
        <div className="aasr-stat-grid">
          <Link href="/dashboard/teachers" className="aasr-stat-card">
            <p className="aasr-stat-card__label">Register 01</p>
            <p className="aasr-stat-card__title">Teachers</p>
            <p className="aasr-stat-card__desc">View, add, and edit teaching staff records.</p>
          </Link>
          <Link href="/dashboard/students" className="aasr-stat-card">
            <p className="aasr-stat-card__label">Register 02</p>
            <p className="aasr-stat-card__title">Students</p>
            <p className="aasr-stat-card__desc">Search and manage enrollment records.</p>
          </Link>
          <Link href="/dashboard/subjects" className="aasr-stat-card">
            <p className="aasr-stat-card__label">Register 03</p>
            <p className="aasr-stat-card__title">Subjects</p>
            <p className="aasr-stat-card__desc">Manage subjects and required-teacher targets.</p>
          </Link>
          <Link href="/dashboard/admin-staff" className="aasr-stat-card">
            <p className="aasr-stat-card__label">Register 04</p>
            <p className="aasr-stat-card__title">Admin Staff</p>
            <p className="aasr-stat-card__desc">Administrative &amp; management headcount.</p>
          </Link>
          <Link href="/dashboard/transport" className="aasr-stat-card">
            <p className="aasr-stat-card__label">Register 05</p>
            <p className="aasr-stat-card__title">Transport Staff</p>
            <p className="aasr-stat-card__desc">Drivers, attendants, and fleet summary.</p>
          </Link>
          <Link href="/dashboard/staffing-report" className="aasr-stat-card">
            <p className="aasr-stat-card__label">Report</p>
            <p className="aasr-stat-card__title">Staffing Report</p>
            <p className="aasr-stat-card__desc">Full print-ready staffing report.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
