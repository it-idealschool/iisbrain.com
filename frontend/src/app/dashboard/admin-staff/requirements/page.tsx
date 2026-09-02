"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  ADMIN_POSITION_CHOICES,
  ADMIN_POSITION_LABELS,
  AdminStaff,
  AdminPositionRequirement,
  getAdminStaff,
  getAdminPositionRequirements,
  createAdminPositionRequirement,
  updateAdminPositionRequirement,
} from "@/lib/adminStaff";

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

export default function AdminPositionRequirementsPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [requirements, setRequirements] = useState<AdminPositionRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reqDrafts, setReqDrafts] = useState<Record<string, { required_count: string; key_responsibilities: string }>>({});
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
        getAdminStaff(),
        getAdminPositionRequirements(),
      ]);
      const staffList: AdminStaff[] = Array.isArray(staffData) ? staffData : staffData.results || [];
      const reqList: AdminPositionRequirement[] = Array.isArray(reqData) ? reqData : reqData.results || [];

      setStaff(staffList);
      setRequirements(reqList);

      const drafts: Record<string, { required_count: string; key_responsibilities: string }> = {};
      for (const pos of ADMIN_POSITION_CHOICES) {
        const existing = reqList.find((r) => r.position === pos);
        drafts[pos] = {
          required_count: String(existing?.required_count ?? 0),
          key_responsibilities: existing?.key_responsibilities ?? "",
        };
      }
      setReqDrafts(drafts);
    } catch {
      setError("Failed to load position requirements.");
    } finally {
      setLoading(false);
    }
  }

  const currentCountByPosition = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of staff) counts[s.position] = (counts[s.position] || 0) + 1;
    return counts;
  }, [staff]);

  function updateReqDraft(position: string, field: "required_count" | "key_responsibilities", value: string) {
    setReqDrafts((prev) => ({ ...prev, [position]: { ...prev[position], [field]: value } }));
  }

  async function saveRequirement(position: string) {
    const draft = reqDrafts[position];
    const existing = requirements.find((r) => r.position === position);
    setSavingReq(position);
    try {
      const payload: AdminPositionRequirement = {
        position,
        required_count: Number(draft.required_count) || 0,
        key_responsibilities: draft.key_responsibilities,
      };
      if (existing?.id) {
        const updated = await updateAdminPositionRequirement(existing.id, payload);
        setRequirements((prev) => prev.map((r) => (r.position === position ? updated : r)));
      } else {
        const created = await createAdminPositionRequirement(payload);
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
          <p className="aasr-eyebrow">Register 04</p>
          <h1 className="aasr-page-title">Position Requirements</h1>
          <p className="aasr-page-subtitle">
            Target headcount and responsibilities for each admin position.
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
                  <th>Position</th>
                  <th>Current</th>
                  <th>Required</th>
                  <th>Shortage / Surplus</th>
                  <th>Key Responsibilities</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_POSITION_CHOICES.map((pos) => {
                  const current = currentCountByPosition[pos] || 0;
                  const draft = reqDrafts[pos] || { required_count: "0", key_responsibilities: "" };
                  const required = Number(draft.required_count) || 0;
                  const diff = current - required;
                  return (
                    <tr key={pos}>
                      <td style={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                        {ADMIN_POSITION_LABELS[pos]}
                      </td>
                      <td>{current}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={draft.required_count}
                          onChange={(e) => updateReqDraft(pos, "required_count", e.target.value)}
                          className="aasr-input"
                          style={{ width: "5rem" }}
                        />
                      </td>
                      <td>
                        <DiffBadge diff={diff} />
                      </td>
                      <td style={{ minWidth: "220px" }}>
                        <input
                          value={draft.key_responsibilities}
                          onChange={(e) => updateReqDraft(pos, "key_responsibilities", e.target.value)}
                          className="aasr-input"
                          placeholder="Key responsibilities"
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => saveRequirement(pos)}
                          disabled={savingReq === pos}
                          className="aasr-btn aasr-btn-ghost aasr-btn-sm"
                        >
                          {savingReq === pos ? "Saving…" : "Save"}
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
