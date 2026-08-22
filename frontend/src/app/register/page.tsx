"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "management", label: "Management" },
  { value: "principal", label: "Principal" },
  { value: "hr", label: "HR" },
  { value: "academic_coordinator", label: "Academic Coordinator" },
  { value: "department_head", label: "Department Head" },
  { value: "viewer_auditor", label: "Viewer/Auditor" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    password2: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      const data = err.response?.data;
      const msg = data
        ? Object.values(data).flat().join(" ")
        : "Registration failed.";
      setError(msg);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-sm mx-auto mt-20 space-y-4"
    >
      <h1 className="text-xl font-bold">Register</h1>

      <input
        type="text"
        name="username"
        placeholder="Username *"
        value={form.username}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="first_name"
        placeholder="First name"
        value={form.first_name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="last_name"
        placeholder="Last name"
        value={form.last_name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="">Select role</option>
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <input
        type="password"
        name="password"
        placeholder="Password *"
        value={form.password}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        type="password"
        name="password2"
        placeholder="Confirm password *"
        value={form.password2}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm">
          Registered! Redirecting to login...
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-black text-white p-2 rounded"
      >
        Register
      </button>
    </form>
  );
}