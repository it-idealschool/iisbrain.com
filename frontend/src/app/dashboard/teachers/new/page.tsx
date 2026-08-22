"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";
import TeacherForm from "../TeacherForm";

export default function NewTeacherPage() {
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
          <p className="aasr-eyebrow">Register 01</p>
          <h1 className="aasr-page-title">Add teacher</h1>
        </div>
      </div>
      <TeacherForm />
    </div>
  );
}
