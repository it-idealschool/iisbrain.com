"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  getStudents,
  deleteStudent,
  exportStudentsExcel,
  Student,
  StudentFilters,
  GRADE_CHOICES,
  GENDER_CHOICES,
} from "@/lib/students";

const emptyFilters: StudentFilters = {
  search: "",
  grade: "",
  division: "",
  gender: "",
};

export default function StudentsListPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filters, setFilters] = useState<StudentFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(() => loadStudents(emptyFilters))
      .catch(() => router.push("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadStudents(f: StudentFilters) {
    setLoading(true);
    setError("");
    try {
      const data = await getStudents(f);
      setStudents(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key: keyof StudentFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleApplyFilters(e: React.FormEvent) {
    e.preventDefault();
    loadStudents(filters);
  }

  function handleClearFilters() {
    setFilters(emptyFilters);
    loadStudents(emptyFilters);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportStudentsExcel(filters);
    } catch {
      alert("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete student "${name}"?`)) return;
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Delete failed.");
    }
  }

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 02</p>
          <h1 className="aasr-page-title">Students</h1>
          <p className="aasr-page-subtitle">
            Search, filter, and manage enrollment records.
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
          <Link href="/dashboard/students/new" className="aasr-btn aasr-btn-primary">
            + Add Student
          </Link>
        </div>
      </div>

      <form onSubmit={handleApplyFilters} className="aasr-filter-bar">
        <input
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="Search by name, admission no…"
          className="aasr-input"
        />

        <div className="aasr-filter-grid">
          <select
            className="aasr-select"
            value={filters.grade}
            onChange={(e) => updateFilter("grade", e.target.value)}
          >
            <option value="">All grades</option>
            {GRADE_CHOICES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <input
            className="aasr-input"
            placeholder="Division"
            value={filters.division}
            onChange={(e) => updateFilter("division", e.target.value)}
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
      ) : students.length === 0 ? (
        <div className="aasr-table-wrap">
          <p className="aasr-empty-state">
            No students match these filters yet.
          </p>
        </div>
      ) : (
        <div className="aasr-table-wrap">
          <table className="aasr-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Admission No</th>
                <th>Grade</th>
                <th>Division</th>
                <th>Parent</th>
                <th>Contact</th>
                <th className="aasr-cell-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link
                      href={`/dashboard/students/${s.id}`}
                      className="aasr-table-link"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="aasr-mono">{s.admission_no}</td>
                  <td>{s.grade || "—"}</td>
                  <td>{s.division || "—"}</td>
                  <td>{s.parent_name || "—"}</td>
                  <td className="aasr-mono">{s.contact_number || "—"}</td>
                  <td className="aasr-cell-actions">
                    <Link
                      href={`/dashboard/students/${s.id}`}
                      className="aasr-btn aasr-btn-ghost aasr-btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => s.id && handleDelete(s.id, s.name)}
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
