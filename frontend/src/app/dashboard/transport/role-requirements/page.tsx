"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  TRANSPORT_ROLE_CHOICES,
  TRANSPORT_ROLE_LABELS,
  TransportStaff,
  TransportRoleRequirement,
  getTransportStaff,
  getTransportRoleRequirements,
  createTransportRoleRequirement,
  updateTransportRoleRequirement,
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

export default function TransportRoleRequirementsPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<TransportStaff[]>([]);
  const [requirements, setRequirements] = useState<TransportRoleRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reqDrafts, setReqDrafts] = useState<Record<string, string>>({});
  const [savingReq, setSavingReq] = useState<string | null>(null);

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
      const [staffData, reqData] = await Promise.all([
        getTransportStaff(),
        getTransportRoleRequirements(),
      ]);
      const staffList: TransportStaff[] = Array.isArray(staffData) ? staffData : staffData.results || [];
      const reqList: TransportRoleRequirement[] = Array.isArray(reqData) ? reqData : reqData.results || [];

      setStaff(staffList);
      setRequirements(reqList);

      const drafts: Record<string, string> = {};
      for (const role of TRANSPORT_ROLE_CHOICES) {
        const existing = reqList.find((r) => r.role === role);
        drafts[role] = String(existing?.required_count ?? 0);
      }
      setReqDrafts(drafts);
    } catch {
      setError("Failed to load role requirements.");
    } finally {
      setLoading(false);
    }
  }

  const currentCountByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of staff) counts[s.role] = (counts[s.role] || 0) + 1;
    return counts;
  }, [staff]);

  async function saveRequirement(role: string) {
    const existing = requirements.find((r) => r.role === role);
    setSavingReq(role);
    try {
      const payload: TransportRoleRequirement = {
        role,
        required_count: Number(reqDrafts[role]) || 0,
      };
      if (existing?.id) {
        const updated = await updateTransportRoleRequirement(existing.id, payload);
        setRequirements((prev) => prev.map((r) => (r.role === role ? updated : r)));
      } else {
        const created = await createTransportRoleRequirement(payload);
        setRequirements((prev) => [...prev, created]);
      }
    } catch {
      alert("Failed to save requirement.");
    } finally {
      setSavingReq(null);
    }
  }

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 05</p>
          <h1 className="aasr-page-title">Role Requirements</h1>
          <p className="aasr-page-subtitle">
            Target headcount for each transport role, versus current staffing.
          </p>
        </div>
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}
      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : (
        <section className="aasr-section">
          <div className="aasr-table-wrap">
            <table className="aasr-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Current</th>
                  <th>Required</th>
                  <th>Shortage / Surplus</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {TRANSPORT_ROLE_CHOICES.map((role) => {
                  const current = currentCountByRole[role] || 0;
                  const required = Number(reqDrafts[role]) || 0;
                  const diff = current - required;
                  return (
                    <tr key={role}>
                      <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>{TRANSPORT_ROLE_LABELS[role]}</td>
                      <td>{current}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={reqDrafts[role] ?? "0"}
                          onChange={(e) => setReqDrafts((prev) => ({ ...prev, [role]: e.target.value }))}
                          className="aasr-input"
                          style={{ width: "5rem" }}
                        />
                      </td>
                      <td><DiffBadge diff={diff} /></td>
                      <td>
                        <button
                          onClick={() => saveRequirement(role)}
                          disabled={savingReq === role}
                          className="aasr-btn aasr-btn-ghost aasr-btn-sm"
                        >
                          {savingReq === role ? "Saving…" : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
