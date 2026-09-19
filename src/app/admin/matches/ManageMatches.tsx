"use client";

import { useState } from "react";

type MatchPlayer = {
  id: string;
  name: string;
  kills: number;
  deaths: number;
  kd: number;
  team: string | null;
};

type Match = {
  id: string;
  mode: string;
  playedAt: string;
  notes: string | null;
  players: MatchPlayer[];
};

export default function ManageMatches({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string, mode: string) => {
    if (!confirm(`Delete this "${mode}" match? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admin/matches/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        setMatches(matches.filter((m) => m.id !== id));
        if (expandedId === id) setExpandedId(null);
      } else {
        alert("Error: " + result.error);
      }
    } catch {
      alert("Failed to delete match.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Matches</h1>
        <span className="text-gray-400 text-sm">{matches.length} match{matches.length !== 1 ? "es" : ""} total</span>
      </div>

      {matches.length === 0 ? (
        <div className="glass-panel p-8 text-center text-gray-400">
          No matches recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div key={match.id} className="glass-panel overflow-hidden">
              <div className="flex items-center justify-between p-4 gap-3">
                <button
                  onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                  className="flex-1 text-left flex items-center gap-4 min-w-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold tracking-wide text-gaming-accent truncate">{match.mode}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(match.playedAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                      {" · "}{match.players.length} players
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm shrink-0">
                    {expandedId === match.id ? "▲" : "▼"}
                  </span>
                </button>
                <button
                  onClick={() => handleDelete(match.id, match.mode)}
                  className="shrink-0 text-xs px-3 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                >
                  🗑 Delete
                </button>
              </div>

              {expandedId === match.id && (
                <div className="border-t border-glass-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-black/30 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-2 font-normal">Player</th>
                        <th className="px-4 py-2 font-normal text-center">Team</th>
                        <th className="px-4 py-2 font-normal text-center">K</th>
                        <th className="px-4 py-2 font-normal text-center">D</th>
                        <th className="px-4 py-2 font-normal text-center">K/D</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border/40">
                      {match.players.map((mp) => (
                        <tr key={mp.id} className="hover:bg-white/5">
                          <td className="px-4 py-2 font-medium">{mp.name}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              mp.team === "A" ? "bg-blue-900/50 text-blue-300" :
                              mp.team === "B" ? "bg-red-900/50 text-red-300" :
                              "text-gray-500"
                            }`}>
                              {mp.team || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center text-green-400">{mp.kills}</td>
                          <td className="px-4 py-2 text-center text-red-400">{mp.deaths}</td>
                          <td className="px-4 py-2 text-center text-gaming-accent font-mono">
                            {mp.kd.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {match.notes && (
                    <div className="px-4 py-2 text-xs text-gray-500 border-t border-glass-border/40">
                      📝 {match.notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
