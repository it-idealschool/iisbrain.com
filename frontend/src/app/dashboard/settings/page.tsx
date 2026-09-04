"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  RegistrationSettings,
  getRegistrationSettings,
  updateRegistrationSettings,
} from "@/lib/registrationSettings";

const TOGGLES: { key: keyof RegistrationSettings; label: string; formPath: string }[] = [
  { key: "teacher_registration_open", label: "Teacher Registration", formPath: "/register/teacher" },
  { key: "admin_staff_registration_open", label: "Admin Staff Registration", formPath: "/register/admin-staff" },
  { key: "transport_registration_open", label: "Transport Staff Registration", formPath: "/register/transport" },
];

export default function RegistrationSettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<RegistrationSettings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(() => setReady(true))
      .catch(() => router.push("/login"));
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    getRegistrationSettings()
      .then(setSettings)
      .catch(() => setError("Could not load registration settings."));
  }, [ready]);

  async function toggle(key: keyof RegistrationSettings) {
    if (!settings) return;
    const nextValue = !settings[key];
    setSaving(key);
    setError("");
    // Optimistic update
    setSettings({ ...settings, [key]: nextValue });
    try {
      const updated = await updateRegistrationSettings({ [key]: nextValue });
      setSettings(updated);
    } catch {
      // Revert on failure
      setSettings({ ...settings, [key]: !nextValue });
      setError("Could not save the change. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  if (!ready) return <p className="aasr-loading-state aasr-page">Loading…</p>;

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Settings</p>
          <h1 className="aasr-page-title">Public Registration Forms</h1>
          <p className="aasr-page-subtitle">
            Turn each self-registration form on or off. When off, the public link shows a
            &ldquo;registration closed&rdquo; message instead of the form.
          </p>
        </div>
      </div>

      {error && (
        <p
          style={{
            color: "var(--aasr-error)",
            background: "var(--aasr-error-bg)",
            border: "1px solid var(--aasr-error)",
            borderRadius: "0.45rem",
            padding: "0.75rem",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
          }}
        >
          {error}
        </p>
      )}

      <section className="aasr-section">
        {!settings ? (
          <p className="aasr-empty-state">Loading settings…</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {TOGGLES.map((t) => {
              const isOpen = Boolean(settings[t.key]);
              return (
                <div
                  key={t.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "1rem 1.1rem",
                    border: "1px solid var(--aasr-border)",
                    borderRadius: "0.6rem",
                    background: "var(--aasr-surface)",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--aasr-navy)" }}>{t.label}</p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--aasr-muted)" }}>
                      Status: <strong style={{ color: isOpen ? "var(--aasr-success)" : "var(--aasr-error)" }}>
                        {isOpen ? "Open" : "Closed"}
                      </strong>
                      {" · "}
                      <code style={{ fontSize: "0.78rem" }}>{t.formPath}</code>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(t.key)}
                    disabled={saving === t.key}
                    className={isOpen ? "aasr-btn aasr-btn-secondary aasr-btn-sm" : "aasr-btn aasr-btn-primary aasr-btn-sm"}
                    style={{ minWidth: "6.5rem" }}
                  >
                    {saving === t.key ? "Saving…" : isOpen ? "Turn Off" : "Turn On"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
