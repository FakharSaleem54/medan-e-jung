"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Player = {
  id: string;
  displayName: string;
  nickname: string | null;
  active: boolean;
};

export default function ManagePlayers({ initialPlayers }: { initialPlayers: Player[] }) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: newName, nickname: newNickname }),
      });
      const result = await res.json();
      if (result.success) {
        setPlayers([...players, result.player]);
        setNewName("");
        setNewNickname("");
        setShowAddForm(false);
        router.refresh();
      } else {
        alert("Error: " + result.error);
      }
    } catch {
      alert("Failed to add player.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Players</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gaming-accent text-white px-4 py-2 rounded font-bold hover:bg-orange-600 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Player"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPlayer} className="glass-panel p-6 space-y-4 border-l-4 border-gaming-accent">
          <h2 className="font-bold text-lg">Add New Player</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Display Name *</label>
              <input
                type="text"
                placeholder="e.g. Fakhar"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full bg-black/30 border border-glass-border p-2 rounded focus:border-gaming-accent outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">COD Nickname (optional)</label>
              <input
                type="text"
                placeholder="e.g. Fakhar_07"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="w-full bg-black/30 border border-glass-border p-2 rounded focus:border-gaming-accent outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-gaming-accent text-white px-6 py-2 rounded font-bold hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Player"}
          </button>
        </form>
      )}

      <div className="glass-panel overflow-hidden">
        {players.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No players yet. Click &quot;+ Add Player&quot; to get started.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-black/30 text-gray-400 text-sm uppercase">
              <tr>
                <th className="p-4 font-normal">Name</th>
                <th className="p-4 font-normal">COD Nickname</th>
                <th className="p-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">{player.displayName}</td>
                  <td className="p-4 text-gray-400">{player.nickname || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        player.active ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                      }`}
                    >
                      {player.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
