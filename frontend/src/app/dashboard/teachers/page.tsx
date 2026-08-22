"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  getTeachers,
  deleteTeacher,
  exportTeachersExcel,
  Teacher,
  TeacherFilters,
  POSITION_CHOICES,
  GENDER_CHOICES,
  YES_NO_CHOICES,
} from "@/lib/teachers";

const emptyFilters: TeacherFilters = {
  search: "",
  position: "",
  section: "",
  gender: "",
  continue_service: "",
  class_teacher: "",
};

export default function TeachersListPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filters, setFilters] = useState<TeacherFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(() => loadTeachers(emptyFilters))
      .catch(() => router.push("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadTeachers(f: TeacherFilters) {
    setLoading(true);
    setError("");
    try {
      const data = await getTeachers(f);
      setTeachers(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key: keyof TeacherFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleApplyFilters(e: React.FormEvent) {
    e.preventDefault();
    loadTeachers(filters);
  }

  function handleClearFilters() {
    setFilters(emptyFilters);
    loadTeachers(emptyFilters);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportTeachersExcel(filters);
    } catch {
      alert("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete teacher "${name}"?`)) return;
    try {
      await deleteTeacher(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Delete failed.");
    }
  }

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 01</p>
          <h1 className="aasr-page-title">Teachers</h1>
          <p className="aasr-page-subtitle">
            Search, filter, and manage staff records.
          </p>
        </div>
        <div className="aasr-actions">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="aasr-btn aasr-btn-secondary"
          >
            {exporting ? "Exporting…" : "Export Excel"}
          </button>
          <Link href="/dashboard/teachers/new" className="aasr-btn aasr-btn-primary">
            + Add Teacher
          </Link>
        </div>
      </div>

      <form onSubmit={handleApplyFilters} className="aasr-filter-bar">
        <input
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="Search by name, emp no, Qatar ID, email, position…"
          className="aasr-input"
        />

        <div className="aasr-filter-grid">
          <select
            className="aasr-select"
            value={filters.position}
            onChange={(e) => updateFilter("position", e.target.value)}
          >
            <option value="">All positions</option>
            {POSITION_CHOICES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <input
            className="aasr-input"
            placeholder="Section"
            value={filters.section}
            onChange={(e) => updateFilter("section", e.target.value)}
          />

          <select
            className="aasr-select"
            value={filters.gender}
            onChange={(e) => updateFilter("gender", e.target.value)}
          >
            <option value="">All genders</option>
            {GENDER_CHOICES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            className="aasr-select"
            value={filters.continue_service}
            onChange={(e) => updateFilter("continue_service", e.target.value)}
          >
            <option value="">Continue service: all</option>
            {YES_NO_CHOICES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="aasr-select"
            value={filters.class_teacher}
            onChange={(e) => updateFilter("class_teacher", e.target.value)}
          >
            <option value="">Class teacher: all</option>
            {YES_NO_CHOICES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="aasr-filter-row">
          <button type="submit" className="aasr-btn aasr-btn-secondary aasr-btn-sm">
            Apply filters
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="aasr-btn aasr-btn-ghost aasr-btn-sm"
          >
            Clear
          </button>
        </div>
      </form>

      {error && <p className="aasr-error-banner">{error}</p>}

      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : teachers.length === 0 ? (
        <div className="aasr-table-wrap">
          <p className="aasr-empty-state">
            No teachers match these filters yet.
          </p>
        </div>
      ) : (
        <div className="aasr-table-wrap">
          <table className="aasr-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Emp No</th>
                <th>Position</th>
                <th>Section</th>
                <th>Total periods</th>
                <th>Continue service</th>
                <th className="aasr-cell-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link
                      href={`/dashboard/teachers/${t.id}`}
                      className="aasr-table-link"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="aasr-mono">{t.emp_no}</td>
                  <td>{t.position || "—"}</td>
                  <td>{t.section || "—"}</td>
                  <td className="aasr-mono">{t.total_periods ?? "—"}</td>
                  <td>
                    {t.continue_service ? (
                      <span
                        className={
                          "aasr-badge " +
                          (t.continue_service === "YES"
                            ? "aasr-badge--success"
                            : "aasr-badge--muted")
                        }
                      >
                        {t.continue_service}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="aasr-cell-actions">
                    <Link
                      href={`/dashboard/teachers/${t.id}`}
                      className="aasr-btn aasr-btn-ghost aasr-btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => t.id && handleDelete(t.id, t.name)}
                      className="aasr-btn aasr-btn-danger aasr-btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
