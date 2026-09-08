"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMe } from "@/lib/auth";
import {
  getAdminStaffMember,
  AdminStaff,
  ADMIN_POSITION_LABELS,
  SPONSOR_LABELS,
  QUALIFICATION_LABELS,
} from "@/lib/adminStaff";

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", padding: "0.4rem 0", fontSize: "0.86rem" }}>
      <span style={{ color: "var(--aasr-muted)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function AdminStaffProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [staff, setStaff] = useState<AdminStaff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(() => load())
      .catch(() => router.push("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminStaffMember(params.id);
      setStaff(data);
    } catch {
      setError("Failed to load staff member.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="aasr-loading-state" style={{ textAlign: "center", marginTop: "5rem" }}>Loading…</p>;
  if (error) return <p className="aasr-error-banner" style={{ maxWidth: "32rem", margin: "5rem auto" }}>{error}</p>;
  if (!staff) return null;

  return (
    <div className="aasr-page aasr-page--narrow print:mt-0">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="no-print aasr-page-header">
        <Link href="/dashboard/admin-staff" className="aasr-btn aasr-btn-ghost aasr-btn-sm" style={{ paddingLeft: 0 }}>
          &larr; Back to Admin Staff
        </Link>
        <div className="aasr-actions">
          <button onClick={() => window.print()} className="aasr-btn aasr-btn-secondary">
            Print / Save as PDF
          </button>
          <Link href="/dashboard/admin-staff" className="aasr-btn aasr-btn-primary">
            Edit
          </Link>
        </div>
      </div>

      <div className="print-card aasr-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", borderBottom: "1px solid var(--aasr-border)", paddingBottom: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ width: "7rem", height: "7rem", borderRadius: "999px", overflow: "hidden", background: "var(--aasr-bg)", border: "1px solid var(--aasr-border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {staff.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={staff.photo_url} alt={staff.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "2rem", fontWeight: 600, color: "var(--aasr-gold)" }}>
                {staff.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="aasr-page-title" style={{ fontSize: "1.6rem" }}>{staff.name}</h1>
            <p style={{ color: "var(--aasr-muted)", margin: "0.2rem 0 0" }}>
              {ADMIN_POSITION_LABELS[staff.position] || staff.position}
            </p>
          </div>
        </div>

        <section className="aasr-section">
          <h2 className="aasr-section-title">Contact &amp; Personal Details</h2>
          <div className="aasr-field-grid">
            <div>
              <DetailRow label="Email" value={staff.email} />
              <DetailRow label="Contact Number" value={staff.contact_number} />
              <DetailRow label="Qatar ID" value={staff.qatar_id} />
              <DetailRow label="Qatar ID Expiry" value={staff.qatar_id_expiry} />
              <DetailRow label="Sponsor Status" value={staff.sponsor_status ? SPONSOR_LABELS[staff.sponsor_status] : ""} />
              <DetailRow label="Home Country Number" value={staff.home_country_number} />
            </div>
            <div>
              <DetailRow label="Gender" value={staff.gender} />
              <DetailRow label="Date of Birth" value={staff.dob} />
              <DetailRow label="Age" value={staff.age} />
              <DetailRow label="Shift" value={staff.shift} />
              <DetailRow label="Date of Joining" value={staff.doj} />
              <DetailRow label="Contract Expiry" value={staff.contract_expiry} />
            </div>
          </div>
        </section>

        <section className="aasr-section">
          <h2 className="aasr-section-title">Qualifications</h2>
          <div className="aasr-field-grid">
            <div>
              <DetailRow
                label="Qualification"
                value={staff.qualification ? QUALIFICATION_LABELS[staff.qualification] : ""}
              />
              <DetailRow label="Extra Qualification" value={staff.extra_qualification} />
            </div>
            <div>
              {staff.certificate_url ? (
                <div style={{ padding: "0.4rem 0" }}>
                  <a
                    href={staff.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aasr-btn aasr-btn-ghost aasr-btn-sm"
                  >
                    View / Download Certificate
                  </a>
                </div>
              ) : (
                <DetailRow label="Certificate" value="Not uploaded" />
              )}
            </div>
          </div>
        </section>

        {staff.notes && (
          <section>
            <h2 className="aasr-section-title">Notes</h2>
            <p style={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>{staff.notes}</p>
          </section>
        )}
      </div>
    </div>
  );
}
