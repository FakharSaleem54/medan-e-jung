"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="glass-panel p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.4em] text-military-olive uppercase mb-1">DURRANI FAMILY</p>
          <h1
            className="text-2xl font-black tracking-[0.2em] text-gaming-accent"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            MEDAN E JUNG
          </h1>
          <p className="text-xs tracking-widest text-military-khaki mt-1 uppercase">⚙ HQ Access</p>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <input
              type="password"
              placeholder="Enter Admin Password"
              className="w-full p-3 rounded bg-black/30 border border-glass-border focus:border-gaming-accent outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gaming-accent text-white p-3 rounded font-bold hover:bg-orange-600 transition-colors"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
