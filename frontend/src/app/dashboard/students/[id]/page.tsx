"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import { getStudent, Student } from "@/lib/students";
import StudentForm from "../StudentForm";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(() => loadStudent())
      .catch(() => router.push("/login"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function loadStudent() {
    setLoading(true);
    setError("");
    try {
      const data = await getStudent(params.id);
      setStudent(data);
    } catch {
      setError("Failed to load student.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="aasr-loading-state aasr-page">Loading…</p>;
  if (error) return <p className="aasr-error-banner aasr-page">{error}</p>;
  if (!student) return null;

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 02</p>
          <h1 className="aasr-page-title">Edit — {student.name}</h1>
        </div>
      </div>
      <StudentForm studentId={params.id} initialData={student} />
    </div>
  );
}
