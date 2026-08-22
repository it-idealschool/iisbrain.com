"use client";

import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Basic fields                                                        */
/* ------------------------------------------------------------------ */

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="aasr-section">
      <h2 className="aasr-section-title">{title}</h2>
      <div className="aasr-field-grid">{children}</div>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="aasr-label">
      <span className="aasr-label-text">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="aasr-input"
      />
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="aasr-label aasr-label--full">
      <span className="aasr-label-text">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="aasr-textarea"
        rows={2}
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="aasr-label">
      <span className="aasr-label-text">{label}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="aasr-input"
      />
    </label>
  );
}

export function SelectField({
  label,
  value,
  choices,
  labels,
  onChange,
}: {
  label: string;
  value: string;
  choices: readonly string[];
  labels?: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="aasr-label">
      <span className="aasr-label-text">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="aasr-select"
      >
        <option value="">-- Select --</option>
        {choices.map((c) => (
          <option key={c} value={c}>
            {labels?.[c] ?? c}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Fast date field — Day / Month / Year dropdowns so the year can be   */
/* jumped to directly instead of scrolling a native calendar widget.   */
/* Stores/reads a plain "YYYY-MM-DD" string, same as before.           */
/* ------------------------------------------------------------------ */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(year: number, month: number) {
  // month is 1-12
  return new Date(year, month, 0).getDate();
}

export function FastDateField({
  label,
  value,
  onChange,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 10,
}: {
  label: string;
  value: string; // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
  minYear?: number;
  maxYear?: number;
}) {
  const [y, m, d] = value ? value.split("-") : ["", "", ""];
  const year = y || "";
  const month = m ? String(Number(m)) : "";
  const day = d ? String(Number(d)) : "";

  const yearOptions: number[] = [];
  for (let yr = maxYear; yr >= minYear; yr--) yearOptions.push(yr);

  function emit(nextYear: string, nextMonth: string, nextDay: string) {
    if (!nextYear || !nextMonth || !nextDay) {
      onChange("");
      return;
    }
    const yy = Number(nextYear);
    const mm = Number(nextMonth);
    const maxDay = daysInMonth(yy, mm);
    const dd = Math.min(Number(nextDay), maxDay);
    onChange(`${yy.toString().padStart(4, "0")}-${mm.toString().padStart(2, "0")}-${dd.toString().padStart(2, "0")}`);
  }

  return (
    <label className="aasr-label">
      <span className="aasr-label-text">{label}</span>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <select
          aria-label={`${label} day`}
          className="aasr-select"
          style={{ flex: "0 0 4.2rem" }}
          value={day}
          onChange={(e) => emit(year || String(new Date().getFullYear()), month || "1", e.target.value)}
        >
          <option value="">Day</option>
          {Array.from(
            { length: daysInMonth(Number(year) || 2000, Number(month) || 1) },
            (_, i) => i + 1
          ).map((dd) => (
            <option key={dd} value={dd}>
              {dd}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label} month`}
          className="aasr-select"
          style={{ flex: "1 1 auto" }}
          value={month}
          onChange={(e) => emit(year || String(new Date().getFullYear()), e.target.value, day || "1")}
        >
          <option value="">Month</option>
          {MONTHS.map((mn, i) => (
            <option key={mn} value={i + 1}>
              {mn}
            </option>
          ))}
        </select>
        {/* Year: free-typed number input + quick-jump select, so the year
            can be changed instantly by typing instead of scrolling. */}
        <input
          aria-label={`${label} year`}
          type="number"
          className="aasr-input"
          style={{ flex: "0 0 5.5rem" }}
          placeholder="Year"
          value={year}
          onChange={(e) => {
            const v = e.target.value.slice(0, 4);
            emit(v, month || "1", day || "1");
          }}
        />
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Shift — Morning / Evening, multi-select via checkboxes.             */
/* Backed by a single string field: "MORNING" | "EVENING" | "BOTH".    */
/* ------------------------------------------------------------------ */

export function ShiftField({
  label = "Shift",
  value,
  onChange,
}: {
  label?: string;
  value: string; // "" | "MORNING" | "EVENING" | "BOTH"
  onChange: (v: string) => void;
}) {
  const morningChecked = value === "MORNING" || value === "BOTH";
  const eveningChecked = value === "EVENING" || value === "BOTH";

  function toggle(which: "MORNING" | "EVENING") {
    const morning = which === "MORNING" ? !morningChecked : morningChecked;
    const evening = which === "EVENING" ? !eveningChecked : eveningChecked;
    if (morning && evening) onChange("BOTH");
    else if (morning) onChange("MORNING");
    else if (evening) onChange("EVENING");
    else onChange("");
  }

  return (
    <label className="aasr-label">
      <span className="aasr-label-text">{label}</span>
      <div
        className="aasr-input"
        style={{ display: "flex", gap: "1.1rem", alignItems: "center" }}
      >
        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.88rem" }}>
          <input type="checkbox" checked={morningChecked} onChange={() => toggle("MORNING")} />
          Morning
        </label>
        <label style={{ display: "flex", gap: "0.4rem", alignItems: "center", fontSize: "0.88rem" }}>
          <input type="checkbox" checked={eveningChecked} onChange={() => toggle("EVENING")} />
          Evening
        </label>
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Photo upload — reads the chosen image, downsizes it in the browser, */
/* and stores it as a base64 data-URL string in `photo_url` (no extra  */
/* backend storage/media config needed).                               */
/* ------------------------------------------------------------------ */

async function fileToResizedDataUrl(file: File, maxSize = 480, quality = 0.85): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not load image"));
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export function PhotoUploadField({
  label = "Profile Photo",
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const resized = await fileToResizedDataUrl(file);
      onChange(resized);
    } catch {
      setError("Could not process that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className="aasr-label">
      <span className="aasr-label-text">{label}</span>
      <div style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
        <div
          style={{
            width: "3.4rem",
            height: "3.4rem",
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            background: "var(--aasr-bg)",
            border: "1px solid var(--aasr-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            color: "var(--aasr-muted)",
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            "No photo"
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="aasr-btn aasr-btn-ghost aasr-btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "Processing..." : value ? "Change Photo" : "Upload Photo"}
            </button>
            {value && (
              <button
                type="button"
                className="aasr-btn aasr-btn-ghost aasr-btn-sm"
                onClick={() => onChange("")}
              >
                Remove
              </button>
            )}
          </div>
          {error && <span style={{ fontSize: "0.78rem", color: "var(--aasr-error)" }}>{error}</span>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </label>
  );
}
