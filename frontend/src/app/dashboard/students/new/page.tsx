"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import StudentForm from "../StudentForm";

export default function NewStudentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getMe()
      .then(() => setReady(true))
      .catch(() => router.push("/login"));
  }, [router]);

  if (!ready) return <p className="aasr-loading-state aasr-page">Loading…</p>;

  return (
    <div className="aasr-page">
      <div className="aasr-page-header">
        <div>
          <p className="aasr-eyebrow">Register 02</p>
          <h1 className="aasr-page-title">Add student</h1>
        </div>
      </div>
      <StudentForm />
    </div>
  );
}
