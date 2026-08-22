"use client";

import { useState } from "react";
import { login, getMe } from "@/lib/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      const me = await getMe();
      console.log("Logged in user:", me);
      // ഇവിടെ dashboard-ലേക്ക് redirect ചെയ്യാം: router.push("/dashboard")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Login failed. Check credentials."
      );
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-20 space-y-4">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 rounded"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-black text-white p-2 rounded">
        Login
      </button>
    </form>
  );
}
