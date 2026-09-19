"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HardResetButton() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        setPassword("");
        alert("☢ DATABASE WIPED. All players and matches have been erased.");
        router.refresh();
      } else {
        setError(result.error || "Incorrect password.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setShowModal(true); setError(""); setPassword(""); }}
        className="px-4 py-2 text-sm font-bold tracking-widest uppercase border-2 border-red-600 text-red-500 hover:bg-red-900/30 rounded transition-colors"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        ☢ Hard Reset
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-lg border-2 border-red-700/60 overflow-hidden">
            <div className="bg-red-950/40 p-4 border-b border-red-700/40">
              <h2 className="text-xl font-black tracking-widest text-red-400 uppercase"
                style={{ fontFamily: "Orbitron, sans-serif" }}>
                ☢ HARD RESET
              </h2>
              <p className="text-xs text-red-300/70 mt-1">
                This will permanently erase ALL players and ALL match history.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">
                  Enter Reset Password to confirm:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  placeholder="••••••••••••••"
                  className="w-full bg-black/50 border border-red-700/40 text-red-300 p-3 rounded font-mono text-sm focus:border-red-500 outline-none"
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-xs mt-2">⚠ {error}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowModal(false); setPassword(""); setError(""); }}
                  className="flex-1 py-2 text-sm border border-glass-border text-gray-400 hover:bg-white/5 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading || !password}
                  className="flex-1 py-2 text-sm font-bold bg-red-700 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-40 uppercase tracking-widest"
                >
                  {loading ? "Wiping..." : "CONFIRM"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
