"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  Subject,
} from "@/lib/subjects";

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add form state
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newRequired, setNewRequired] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editRequired, setEditRequired] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    getMe()
      .then(() => loadSubjects())
      .catch(() => router.push("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadSubjects() {
    setLoading(true);
    setError("");
    try {
      const data = await getSubjects();
      setSubjects(Array.isArray(data) ? data : data.results || []);
    } catch {
      setError("Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError("Subject name is required.");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      const created = await createSubject({
        name: newName.trim(),
        code: newCode.trim(),
        required_teachers: newRequired ? Number(newRequired) : null,
      });
      setSubjects((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
      setNewCode("");
      setNewRequired("");
    } catch (err: any) {
      const detail =
        err?.response?.data?.name?.[0] ||
        err?.response?.data?.detail ||
        "Failed to add subject.";
      setAddError(detail);
    } finally {
      setAdding(false);
    }
  }

  function startEdit(s: Subject) {
    setEditingId(s.id);
    setEditName(s.name);
    setEditCode(s.code || "");
    setEditRequired(s.required_teachers != null ? String(s.required_teachers) : "");
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditCode("");
    setEditRequired("");
    setEditError("");
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) {
      setEditError("Subject name is required.");
      return;
    }
    setSavingEdit(true);
    setEditError("");
    try {
      const updated = await updateSubject(id, {
        name: editName.trim(),
        code: editCode.trim(),
        required_teachers: editRequired ? Number(editRequired) : null,
      });
      setSubjects((prev) =>
        prev
          .map((s) => (s.id === id ? updated : s))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
    } catch (err: any) {
      const detail =
        err?.response?.data?.name?.[0] ||
        err?.response?.data?.detail ||
        "Failed to save changes.";
      setEditError(detail);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete subject "${name}"? This may affect teachers assigned to it.`)) return;
    try {
      await deleteSubject(id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Delete failed.");
    }
  }

  return (
    <div className="aasr-page aasr-page--narrow">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 03</p>
          <h1 className="aasr-page-title">Subjects</h1>
          <p className="aasr-page-subtitle">
            Manage the subject list and set how many teachers each one needs.
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="aasr-filter-bar">
        <div className="aasr-filter-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Subject name"
            className="aasr-input"
          />
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Code (optional)"
            className="aasr-input"
          />
          <input
            type="number"
            min={0}
            value={newRequired}
            onChange={(e) => setNewRequired(e.target.value)}
            placeholder="Required teachers"
            className="aasr-input"
          />
        </div>
        <div className="aasr-filter-row">
          <button type="submit" disabled={adding} className="aasr-btn aasr-btn-primary aasr-btn-sm">
            {adding ? "Adding…" : "+ Add Subject"}
          </button>
        </div>
        {addError && <p className="aasr-error-banner" style={{ marginTop: "0.75rem", marginBottom: 0 }}>{addError}</p>}
      </form>

      {error && <p className="aasr-error-banner">{error}</p>}

      {loading ? (
        <p className="aasr-loading-state">Loading…</p>
      ) : subjects.length === 0 ? (
        <div className="aasr-table-wrap">
          <p className="aasr-empty-state">No subjects found. Add one above.</p>
        </div>
      ) : (
        <div className="aasr-table-wrap">
          <table className="aasr-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Required Teachers</th>
                <th className="aasr-cell-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  {editingId === s.id ? (
                    <>
                      <td>
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="aasr-input"
                        />
                        {editError && (
                          <p style={{ color: "var(--aasr-error)", fontSize: "0.76rem", marginTop: "0.3rem" }}>
                            {editError}
                          </p>
                        )}
                      </td>
                      <td>
                        <input
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          className="aasr-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={editRequired}
                          onChange={(e) => setEditRequired(e.target.value)}
                          className="aasr-input"
                        />
                      </td>
                      <td className="aasr-cell-actions">
                        <button
                          onClick={() => saveEdit(s.id)}
                          disabled={savingEdit}
                          className="aasr-btn aasr-btn-secondary aasr-btn-sm"
                        >
                          {savingEdit ? "Saving…" : "Save"}
                        </button>
                        <button onClick={cancelEdit} className="aasr-btn aasr-btn-ghost aasr-btn-sm">
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{s.name}</td>
                      <td className="aasr-mono">{s.code || "—"}</td>
                      <td>{s.required_teachers ?? "—"}</td>
                      <td className="aasr-cell-actions">
                        <button onClick={() => startEdit(s)} className="aasr-btn aasr-btn-ghost aasr-btn-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="aasr-btn aasr-btn-danger aasr-btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
