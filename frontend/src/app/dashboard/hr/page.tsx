"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import { getTeachers, Teacher, SECTION_TYPE_LABELS } from "@/lib/teachers";
import { getAdminStaff, AdminStaff, ADMIN_POSITION_LABELS } from "@/lib/adminStaff";
import { getTransportStaff, TransportStaff, TRANSPORT_ROLE_LABELS } from "@/lib/transport";

type Category = "TEACHING" | "ADMIN" | "TRANSPORT";

const CATEGORY_LABELS: Record<Category, string> = {
  TEACHING: "Teaching",
  ADMIN: "Admin",
  TRANSPORT: "Transport",
};

interface HrRecord {
  id: string;
  name: string;
  category: Category;
  role: string;
  qatar_id: string;
  qatar_id_expiry: string;
  contract_expiry: string;
  email: string;
  contact_number: string;
  gender: string;
  shift: string;
  sponsor_status: string;
  extra: string; // section / route / bus etc, shown as a small note
  editHref: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function expiryInfo(dateStr: string) {
  if (!dateStr) return { label: "Not set", cls: "aasr-badge--muted", days: null as number | null };
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return { label: "Not set", cls: "aasr-badge--muted", days: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / DAY_MS);
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, cls: "aasr-badge--error", days };
  if (days <= 60) return { label: `${days}d left`, cls: "aasr-badge--warning", days };
  return { label: dateStr, cls: "aasr-badge--success", days };
}

function ExpiryBadge({ dateStr }: { dateStr: string }) {
  const info = expiryInfo(dateStr);
  return <span className={`aasr-badge ${info.cls}`}>{info.label}</span>;
}

export default function HrManagementPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [adminStaff, setAdminStaff] = useState<AdminStaff[]>([]);
  const [transportStaff, setTransportStaff] = useState<TransportStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"ALL" | Category>("ALL");
  const [expiryFilter, setExpiryFilter] = useState<"ALL" | "EXPIRED" | "SOON">("ALL");

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
      const [t, a, tr] = await Promise.all([getTeachers(), getAdminStaff(), getTransportStaff()]);
      setTeachers(Array.isArray(t) ? t : t.results || []);
      setAdminStaff(Array.isArray(a) ? a : a.results || []);
      setTransportStaff(Array.isArray(tr) ? tr : tr.results || []);
    } catch {
      setError("Failed to load HR data.");
    } finally {
      setLoading(false);
    }
  }

  const records = useMemo<HrRecord[]>(() => {
    const fromTeachers: HrRecord[] = teachers.map((t) => ({
      id: `t-${t.id}`,
      name: t.name,
      category: "TEACHING",
      role: t.position || "Teacher",
      qatar_id: t.qatar_id || "",
      qatar_id_expiry: t.qatar_id_expiry || "",
      contract_expiry: t.contract_expiry || "",
      email: t.email || "",
      contact_number: t.contact_number || "",
      gender: t.gender || "",
      shift: t.shift || "",
      sponsor_status: t.sponsor_status || "",
      extra: t.section_type ? SECTION_TYPE_LABELS[t.section_type] || t.section_type : t.section || "",
      editHref: `/dashboard/teachers/${t.id}`,
    }));
    const fromAdmin: HrRecord[] = adminStaff.map((a) => ({
      id: `a-${a.id}`,
      name: a.name,
      category: "ADMIN",
      role: ADMIN_POSITION_LABELS[a.position] || a.position,
      qatar_id: a.qatar_id || "",
      qatar_id_expiry: a.qatar_id_expiry || "",
      contract_expiry: a.contract_expiry || "",
      email: a.email || "",
      contact_number: a.contact_number || "",
      gender: a.gender || "",
      shift: a.shift || "",
      sponsor_status: a.sponsor_status || "",
      extra: "",
      editHref: `/dashboard/admin-staff/${a.id}`,
    }));
    const fromTransport: HrRecord[] = transportStaff.map((tr) => ({
      id: `tr-${tr.id}`,
      name: tr.name,
      category: "TRANSPORT",
      role: TRANSPORT_ROLE_LABELS[tr.role] || tr.role,
      qatar_id: tr.qatar_id || "",
      qatar_id_expiry: tr.qatar_id_expiry || "",
      contract_expiry: tr.contract_expiry || "",
      email: tr.email || "",
      contact_number: tr.contact_number || "",
      gender: tr.gender || "",
      shift: tr.shift || "",
      sponsor_status: tr.sponsor_status || "",
      extra: [tr.bus_number, tr.route].filter(Boolean).join(" / "),
      editHref: `/dashboard/transport/${tr.id}`,
    }));
    return [...fromTeachers, ...fromAdmin, ...fromTransport];
  }, [teachers, adminStaff, transportStaff]);

  const filtered = useMemo(() => {
    let list = records;
    if (category !== "ALL") list = list.filter((r) => r.category === category);
    if (expiryFilter !== "ALL") {
      list = list.filter((r) => {
        const q = expiryInfo(r.qatar_id_expiry);
        const c = expiryInfo(r.contract_expiry);
        if (expiryFilter === "EXPIRED") return (q.days !== null && q.days < 0) || (c.days !== null && c.days < 0);
        return (
          (q.days !== null && q.days >= 0 && q.days <= 60) ||
          (c.days !== null && c.days >= 0 && c.days <= 60)
        );
      });
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      list = list.filter((r) =>
        [
          r.name,
          r.role,
          r.qatar_id,
          r.email,
          r.contact_number,
          r.extra,
          CATEGORY_LABELS[r.category],
          r.sponsor_status,
          r.gender,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term)
      );
    }
    return list;
  }, [records, category, expiryFilter, search]);

  const counts = useMemo(() => {
    const teaching = records.filter((r) => r.category === "TEACHING").length;
    const admin = records.filter((r) => r.category === "ADMIN").length;
    const transport = records.filter((r) => r.category === "TRANSPORT").length;
    const expired = records.filter((r) => {
      const q = expiryInfo(r.qatar_id_expiry);
      const c = expiryInfo(r.contract_expiry);
      return (q.days !== null && q.days < 0) || (c.days !== null && c.days < 0);
    }).length;
    const soon = records.filter((r) => {
      const q = expiryInfo(r.qatar_id_expiry);
      const c = expiryInfo(r.contract_expiry);
      return (
        (q.days !== null && q.days >= 0 && q.days <= 60) ||
        (c.days !== null && c.days >= 0 && c.days <= 60)
      );
    }).length;
    return { total: records.length, teaching, admin, transport, expired, soon };
  }, [records]);

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">HR Management</p>
          <h1 className="aasr-page-title">Staff Directory &amp; ID Expiry Tracker</h1>
          <p className="aasr-page-subtitle">
            Search every staff member across Teaching, Admin and Transport, and keep an eye on Qatar ID
            and contract expiry dates in one place.
          </p>
        </div>
      </div>

      {error && <p className="aasr-error-banner">{error}</p>}

      {!loading && (
        <div className="aasr-stat-grid" style={{ marginBottom: "1.75rem" }}>
          <div className="aasr-stat-card">
            <p className="aasr-stat-card__label">Total Staff</p>
            <p className="aasr-stat-card__title">{counts.total}</p>
            <p className="aasr-stat-card__desc">
              {counts.teaching} Teaching · {counts.admin} Admin · {counts.transport} Transport
            </p>
          </div>
          <div className="aasr-stat-card">
            <p className="aasr-stat-card__label">Expiring Soon</p>
            <p className="aasr-stat-card__title">{counts.soon}</p>
            <p className="aasr-stat-card__desc">Qatar ID or contract expiring within 60 days.</p>
          </div>
          <div className="aasr-stat-card">
            <p className="aasr-stat-card__label">Already Expired</p>
            <p className="aasr-stat-card__title">{counts.expired}</p>
            <p className="aasr-stat-card__desc">Needs immediate renewal.</p>
          </div>
        </div>
      )}

      <div className="aasr-filter-bar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, Qatar ID, email, phone, section, route…"
          className="aasr-input"
        />

        <div className="aasr-filter-grid">
          <select className="aasr-select" value={category} onChange={(e) => setCategory(e.target.value as "ALL" | Category)}>
            <option value="ALL">All sections ({counts.total})</option>
            <option value="TEACHING">Teaching ({counts.teaching})</option>
            <option value="ADMIN">Admin ({counts.admin})</option>
            <option value="TRANSPORT">Transport ({counts.transport})</option>
          </select>

          <select
            className="aasr-select"
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value as "ALL" | "EXPIRED" | "SOON")}
          >
            <option value="ALL">Any ID / contract status</option>
            <option value="SOON">Expiring within 60 days ({counts.soon})</option>
            <option value="EXPIRED">Already expired ({counts.expired})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : (
        <section className="aasr-section">
          <div className="aasr-table-wrap">
            <table className="aasr-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Section</th>
                  <th>Role</th>
                  <th>Qatar ID</th>
                  <th>Qatar ID Expiry</th>
                  <th>Contract Expiry</th>
                  <th>Contact</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <a href={r.editHref} className="aasr-table-link" style={{ fontWeight: 500 }}>
                        {r.name}
                      </a>
                    </td>
                    <td>
                      <span className="aasr-badge aasr-badge--info">{CATEGORY_LABELS[r.category]}</span>
                    </td>
                    <td>{r.role}</td>
                    <td>{r.qatar_id || "—"}</td>
                    <td>
                      <ExpiryBadge dateStr={r.qatar_id_expiry} />
                    </td>
                    <td>
                      <ExpiryBadge dateStr={r.contract_expiry} />
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {r.contact_number}
                      {r.contact_number && r.email ? <br /> : null}
                      {r.email}
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--aasr-muted)" }}>{r.extra || "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="aasr-empty-state">
                      No staff match this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
