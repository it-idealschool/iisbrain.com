"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  TransportStaff,
  TransportSummary,
  getTransportStaff,
  getTransportSummaries,
  createTransportSummary,
  updateTransportSummary,
} from "@/lib/transport";

const emptySummary: TransportSummary = {
  number_of_buses: 0,
  students_per_bus: null,
  working_hours: "",
  overtime_notes: "",
  substitute_staff_availability: "",
  route_wise_staffing_notes: "",
};

export default function TransportFleetSummaryPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<TransportStaff[]>([]);
  const [summary, setSummary] = useState<TransportSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summarySaving, setSummarySaving] = useState(false);

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
      const [staffData, summaryData] = await Promise.all([
        getTransportStaff(),
        getTransportSummaries(),
      ]);
      const staffList: TransportStaff[] = Array.isArray(staffData) ? staffData : staffData.results || [];
      const summaryList: TransportSummary[] = Array.isArray(summaryData) ? summaryData : summaryData.results || [];

      setStaff(staffList);
      if (summaryList.length > 0) setSummary(summaryList[0]);
    } catch {
      setError("Failed to load fleet summary.");
    } finally {
      setLoading(false);
    }
  }

  const driverToBusRatio = useMemo(() => {
    const drivers = staff.filter((s) => s.role === "DRIVER").length;
    if (!summary.number_of_buses) return "—";
    return `${drivers}:${summary.number_of_buses}`;
  }, [staff, summary.number_of_buses]);

  async function saveSummary() {
    setSummarySaving(true);
    try {
      if (summary.id) {
        const updated = await updateTransportSummary(summary.id, summary);
        setSummary(updated);
      } else {
        const created = await createTransportSummary(summary);
        setSummary(created);
      }
    } catch {
      alert("Failed to save fleet summary.");
    } finally {
      setSummarySaving(false);
    }
  }

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 05</p>
          <h1 className="aasr-page-title">Fleet Summary</h1>
          <p className="aasr-page-subtitle">
            Buses, ratios, working hours, and route-level notes.
          </p>
        </div>
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}
      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : (
        <section className="aasr-section">
          <div className="aasr-filter-bar">
            <div className="aasr-field-grid">
              <label className="aasr-label">
                <span className="aasr-label-text">Number of Buses</span>
                <input
                  type="number"
                  min={0}
                  value={summary.number_of_buses}
                  onChange={(e) => setSummary((prev) => ({ ...prev, number_of_buses: Number(e.target.value) || 0 }))}
                  className="aasr-input"
                />
              </label>
              <label className="aasr-label">
                <span className="aasr-label-text">Students per Bus (avg)</span>
                <input
                  type="number"
                  min={0}
                  value={summary.students_per_bus ?? ""}
                  onChange={(e) => setSummary((prev) => ({ ...prev, students_per_bus: e.target.value ? Number(e.target.value) : null }))}
                  className="aasr-input"
                />
              </label>
              <div className="aasr-label">
                <span className="aasr-label-text">Driver-to-Bus Ratio</span>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--aasr-navy)" }}>{driverToBusRatio}</p>
              </div>
              <label className="aasr-label">
                <span className="aasr-label-text">Working Hours</span>
                <input
                  value={summary.working_hours || ""}
                  onChange={(e) => setSummary((prev) => ({ ...prev, working_hours: e.target.value }))}
                  className="aasr-input"
                  placeholder="e.g. 7:00 AM - 4:00 PM"
                />
              </label>
              <label className="aasr-label aasr-label--full">
                <span className="aasr-label-text">Overtime Notes</span>
                <input
                  value={summary.overtime_notes || ""}
                  onChange={(e) => setSummary((prev) => ({ ...prev, overtime_notes: e.target.value }))}
                  className="aasr-input"
                />
              </label>
              <label className="aasr-label aasr-label--full">
                <span className="aasr-label-text">Substitute Staff Availability</span>
                <input
                  value={summary.substitute_staff_availability || ""}
                  onChange={(e) => setSummary((prev) => ({ ...prev, substitute_staff_availability: e.target.value }))}
                  className="aasr-input"
                />
              </label>
              <label className="aasr-label aasr-label--full">
                <span className="aasr-label-text">Route-wise Staffing Notes</span>
                <textarea
                  value={summary.route_wise_staffing_notes || ""}
                  onChange={(e) => setSummary((prev) => ({ ...prev, route_wise_staffing_notes: e.target.value }))}
                  className="aasr-textarea"
                  rows={3}
                />
              </label>
            </div>
            <div className="aasr-filter-row">
              <button onClick={saveSummary} disabled={summarySaving} className="aasr-btn aasr-btn-primary aasr-btn-sm">
                {summarySaving ? "Saving…" : "Save Fleet Summary"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
