"use client";

import { useEffect, useState } from "react";
import TransportForm from "@/app/dashboard/transport/TransportForm";
import { getRegistrationSettings } from "@/lib/registrationSettings";

export default function PublicTransportRegisterPage() {
  const [status, setStatus] = useState<"loading" | "open" | "closed" | "error">("loading");

  useEffect(() => {
    getRegistrationSettings()
      .then((s) => setStatus(s.transport_registration_open ? "open" : "closed"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Staff Registration</p>
          <h1 className="aasr-page-title">Transport Staff Registration Form</h1>
          <p className="aasr-page-subtitle">
            Please fill in your details below. Your registration will be reviewed by the school administration.
          </p>
        </div>
      </div>

      {status === "loading" && <p className="aasr-loading-state">Loading…</p>}

      {status === "error" && (
        <p className="aasr-empty-state">Could not load this form right now. Please try again shortly.</p>
      )}

      {status === "closed" && (
        <div
          style={{
            background: "var(--aasr-error-bg)",
            border: "1px solid var(--aasr-error)",
            borderRadius: "0.6rem",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ margin: "0 0 0.4rem", color: "var(--aasr-navy)" }}>Registration closed</h2>
          <p style={{ margin: 0, color: "var(--aasr-muted)" }}>
            Transport staff registration is not accepting new submissions right now. Please check back later.
          </p>
        </div>
      )}

      {status === "open" && <TransportForm publicMode />}
    </div>
  );
}
