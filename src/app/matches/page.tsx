import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export const revalidate = 0;

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    orderBy: { playedAt: "desc" },
    include: {
      players: {
        include: { player: true },
        orderBy: { kills: "desc" },
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col px-3 sm:px-4 py-4 w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">

      {/* Header */}
      <header className="flex justify-between items-start pt-4 sm:pt-6 gap-3">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#1a7a3a" }}>
            ☪ DURRANI FAMILY
          </p>
          <h1
            className="text-xl sm:text-2xl md:text-4xl font-black tracking-[0.12em] text-gaming-accent leading-tight"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            MATCH HISTORY
          </h1>
          <p className="text-xs tracking-[0.3em] text-military-khaki uppercase mt-1">
            ▸ All Engagements 🇵🇰
          </p>
        </div>
        <Link
          href="/"
          className="text-xs text-military-khaki hover:text-gaming-accent transition-colors tracking-widest uppercase border border-glass-border px-3 py-1 rounded"
        >
          ← Back
        </Link>
      </header>

      {/* Match count */}
      <div className="flex items-center gap-3">
        <span
          className="text-3xl font-black text-gaming-accent font-mono"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          {matches.length}
        </span>
        <span className="text-military-khaki tracking-widest uppercase text-sm">
          Total Matches Recorded
        </span>
      </div>

      {/* Match list */}
      {matches.length === 0 ? (
        <div className="glass-panel p-12 text-center text-military-khaki tracking-widest">
          — No matches recorded yet. Upload scorecards via Admin. —
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          {matches.map((match, idx) => {
            const teamA = match.players.filter(p => p.team === "A");
            const teamB = match.players.filter(p => p.team === "B");
            const allPlayers = match.players; // sorted by kills desc
            const mvp = allPlayers[0];

            return (
              <div key={match.id} className="glass-panel overflow-hidden">
                {/* Match header */}
                <div
                  className="px-5 py-3 flex flex-wrap justify-between items-center gap-2"
                  style={{ background: "rgba(1, 65, 28, 0.2)", borderBottom: "1px solid rgba(100,120,50,0.3)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono text-military-khaki"
                      style={{ fontFamily: "Orbitron, sans-serif" }}
                    >
                      #{String(matches.length - idx).padStart(3, "0")}
                    </span>
                    <span
                      className="font-black tracking-widest uppercase text-gaming-accent text-sm"
                      style={{ fontFamily: "Orbitron, sans-serif" }}
                    >
                      {match.mode}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-military-khaki tracking-widest">
                    <span>{new Date(match.playedAt).toLocaleDateString("en-PK", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}</span>
                    <span>{new Date(match.playedAt).toLocaleTimeString("en-PK", {
                      hour: "2-digit", minute: "2-digit"
                    })}</span>
                    <span className="text-military-olive">{allPlayers.length} players</span>
                  </div>
                </div>

                {/* MVP banner */}
                {mvp && (
                  <div className="px-5 py-2 flex items-center gap-3 text-xs"
                    style={{ background: "rgba(212,170,60,0.06)", borderBottom: "1px solid rgba(212,170,60,0.15)" }}>
                    <span style={{ color: "#d4aa3c" }}>★ MVP</span>
                    <span className="font-bold text-white">{mvp.player.displayName}</span>
                    <span className="font-mono text-military-olive">{mvp.kills}K / {mvp.deaths}D</span>
                    <span className="font-mono" style={{ color: "#d4aa3c" }}>{mvp.kd.toFixed(2)} K/D</span>
                  </div>
                )}

                {/* Scoreboard */}
                {teamA.length > 0 || teamB.length > 0 ? (
                  <div className="flex flex-col divide-y divide-glass-border">
                    {[
                      { label: "ALPHA", players: teamA, color: "#1a5fff", bg: "rgba(26,95,255,0.05)" },
                      { label: "BRAVO", players: teamB, color: "#ff2200", bg: "rgba(255,34,0,0.05)" },
                    ].map(({ label, players, color, bg }) => (
                      players.length > 0 && (
                        <div key={label} className="flex-1" style={{ background: bg }}>
                          <div className="px-4 py-2 text-xs tracking-widest font-black uppercase"
                            style={{ color, borderBottom: `1px solid ${color}33` }}>
                            {label}
                          </div>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-military-khaki text-xs">
                                <th className="px-4 py-1 text-left font-normal">Operator</th>
                                <th className="px-2 py-1 text-right font-normal">K</th>
                                <th className="px-2 py-1 text-right font-normal">D</th>
                                <th className="px-4 py-1 text-right font-normal">K/D</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-glass-border">
                              {players.map(mp => (
                                <tr key={mp.id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-2 font-bold">{mp.player.displayName}</td>
                                  <td className="px-2 py-2 text-right font-mono text-green-400">{mp.kills}</td>
                                  <td className="px-2 py-2 text-right font-mono text-red-400">{mp.deaths}</td>
                                  <td className="px-4 py-2 text-right font-mono text-gaming-accent font-bold">
                                    {mp.kd.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  /* No team split - show flat scoreboard */
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-black/30 text-military-khaki text-xs">
                        <th className="px-4 py-2 text-left font-normal">#</th>
                        <th className="px-4 py-2 text-left font-normal">Operator</th>
                        <th className="px-3 py-2 text-right font-normal">Kills</th>
                        <th className="px-3 py-2 text-right font-normal">Deaths</th>
                        <th className="px-4 py-2 text-right font-normal">K/D</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {allPlayers.map((mp, i) => (
                        <tr key={mp.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2 text-military-khaki font-mono">{i + 1}</td>
                          <td className="px-4 py-2 font-bold flex items-center gap-2">
                            {i === 0 && <span style={{ color: "#d4aa3c" }}>★</span>}
                            {mp.player.displayName}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-green-400">{mp.kills}</td>
                          <td className="px-3 py-2 text-right font-mono text-red-400">{mp.deaths}</td>
                          <td className="px-4 py-2 text-right font-mono text-gaming-accent font-bold">
                            {mp.kd.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Match footer */}
                {match.notes && (
                  <div className="px-5 py-2 text-xs text-military-khaki tracking-wide italic"
                    style={{ borderTop: "1px solid rgba(100,120,50,0.2)" }}>
                    📝 {match.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
