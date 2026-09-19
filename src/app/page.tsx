import { prisma } from "@/lib/db/prisma";
import { calculatePlayerRating } from "@/lib/balancing/playerRating";
import { generateBalancedTeams } from "@/lib/balancing/teamBalancer";
import Link from "next/link";
import PlayerStatusModal from "@/components/PlayerStatusModal";

export const revalidate = 0;

export default async function Home() {
  const allPlayers = await prisma.player.findMany({
    orderBy: { displayName: "asc" },
    include: {
      matches: {
        include: { match: true },
        orderBy: { match: { playedAt: "desc" } },
      },
    },
  });

  const activePlayers = allPlayers.filter((p) => p.active);

  const recentMatches = await prisma.match.findMany({
    orderBy: { playedAt: "desc" },
    take: 3,
    include: { players: { include: { player: true } } },
  });

  const playerRatings = activePlayers
    .map((p) => {
      const matches = p.matches.map((m) => ({
        kills: m.kills,
        deaths: m.deaths,
        kd: m.kd,
        playedAt: m.match.playedAt,
      }));
      const { rating, recentKd, confidence } = calculatePlayerRating(matches);
      return { id: p.id, name: p.displayName, rating, recentKd, matchesCount: matches.length, confidence };
    })
    .sort((a, b) => b.rating - a.rating);

  const options = generateBalancedTeams(playerRatings);
  const best = options[0];

  return (
    <div className="min-h-screen flex flex-col px-3 sm:px-4 py-4 w-full max-w-4xl mx-auto space-y-6 sm:space-y-8">

      {/* ── HEADER ─────────────────────────────── */}
      <header className="flex justify-between items-start pt-4 sm:pt-6 gap-3">
        <div className="flex-1 min-w-0">
          {/* Pakistan crescent bar */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 max-w-[30px]" style={{ background: "linear-gradient(90deg, transparent, #01411C)" }} />
            <span style={{ color: "#d4aa3c", fontSize: "1rem" }}>☪</span>
            <span className="text-xs tracking-[0.25em] uppercase truncate" style={{ color: "#1a7a3a" }}>DURRANI FAMILY</span>
            <span style={{ color: "#d4aa3c", fontSize: "1rem" }}>☪</span>
            <div className="h-px flex-1 max-w-[30px]" style={{ background: "linear-gradient(90deg, #01411C, transparent)" }} />
          </div>

          {/* Main title */}
          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[0.08em] sm:tracking-[0.12em] text-gaming-accent flicker glitch leading-tight"
            data-text="MEDAN E JUNG"
            style={{ fontFamily: "Orbitron, sans-serif", textShadow: "0 0 30px rgba(255,102,0,0.6)" }}
          >
            MEDAN E JUNG
          </h1>

          {/* Urdu */}
          <div
            className="text-lg sm:text-xl md:text-2xl mt-1"
            style={{
              fontFamily: "'Noto Nastaliq Urdu', serif",
              color: "#d4aa3c",
              direction: "rtl",
              textShadow: "0 0 12px rgba(212,170,60,0.4)",
              lineHeight: "2",
            }}
          >
            میدانِ جنگ
          </div>

          <p className="text-xs tracking-[0.3em] text-military-khaki uppercase mt-1">
            ▸ COD Mobile 🇵🇰
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 text-xs text-military-khaki hover:text-gaming-accent transition-colors tracking-widest uppercase border border-glass-border px-2 sm:px-3 py-1 rounded mt-1"
        >
          ⚙ Admin
        </Link>
      </header>

      {/* ── TEAMS SECTION ──────────────────────── */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center gap-2">
          <h2
            className="text-base sm:text-xl tracking-[0.15em] sm:tracking-[0.2em] uppercase text-military-olive"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            ⚔ Today&apos;s Squads
          </h2>
          <div className="flex items-center gap-2">
            <PlayerStatusModal
              players={allPlayers.map((p) => ({
                id: p.id,
                name: p.displayName,
                active: p.active,
              }))}
            />
            <Link
              href="/"
              className="btn-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm shrink-0"
            >
              ↻ Regenerate
            </Link>
          </div>
        </div>

        {best ? (
          <>
            <div className="flex flex-col md:flex-row gap-4 scan-sweep">
              {/* TEAM A */}
              <div className="team-card-a flex-1 rounded p-0 overflow-hidden">
                <div className="bg-team-a/20 px-4 py-3 border-b border-team-a/30 flex justify-between items-center">
                  <span
                    className="font-black tracking-[0.25em] text-blue-300"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    ALPHA
                  </span>
                  <span className="text-xs text-blue-400 font-mono">{best.teamARating} pts</span>
                </div>
                <div className="p-4 space-y-3">
                  {best.teamA.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-blue-500 text-xs font-mono w-4">{i + 1}</span>
                      <span className="flex-1 font-bold tracking-wide text-blue-100">{p.name}</span>
                      <div className="text-right">
                        <div className="text-gaming-accent font-mono text-sm font-bold">{p.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-3">
                  <div className="rating-bar" style={{ width: `${Math.min((best.teamARating / (best.teamARating + best.teamBRating)) * 100, 100)}%` }} />
                </div>
              </div>

              {/* VS DIVIDER */}
              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center gap-1 md:gap-3">
                  <div className="w-px h-8 md:h-16 bg-gradient-to-b from-transparent via-gaming-accent to-transparent hidden md:block" />
                  <span
                    className="text-2xl md:text-3xl font-black italic text-gaming-accent pulse-glow px-4 py-2"
                    style={{ fontFamily: "Orbitron, sans-serif", textShadow: "0 0 20px rgba(255,102,0,0.8)" }}
                  >
                    VS
                  </span>
                  <div className="w-px h-8 md:h-16 bg-gradient-to-b from-transparent via-gaming-accent to-transparent hidden md:block" />
                </div>
              </div>

              {/* TEAM B */}
              <div className="team-card-b flex-1 rounded p-0 overflow-hidden">
                <div className="bg-team-b/20 px-4 py-3 border-b border-team-b/30 flex justify-between items-center">
                  <span
                    className="font-black tracking-[0.25em] text-red-300"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    BRAVO
                  </span>
                  <span className="text-xs text-red-400 font-mono">{best.teamBRating} pts</span>
                </div>
                <div className="p-4 space-y-3">
                  {best.teamB.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-red-500 text-xs font-mono w-4">{i + 1}</span>
                      <span className="flex-1 font-bold tracking-wide text-red-100">{p.name}</span>
                      <div className="text-right">
                        <div className="text-gaming-accent font-mono text-sm font-bold">{p.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-3">
                  <div className="rating-bar" style={{ width: `${Math.min((best.teamBRating / (best.teamARating + best.teamBRating)) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Balance meter */}
            <div className="glass-panel px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-military-khaki text-xs tracking-widest uppercase">Balance Diff</span>
                <span className="font-mono text-gaming-accent font-bold">{best.ratingDifference} pts</span>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${best.balancePercentage}%`,
                      background: "linear-gradient(90deg, #cc4400, #ffaa00, #44cc00)",
                    }}
                  />
                </div>
              </div>
              <span
                className="text-sm font-bold tracking-widest uppercase"
                style={{ color: best.ratingDifference <= 5 ? "#44dd00" : "#ffaa00" }}
              >
                {best.ratingDifference <= 5 ? "▲ EXCELLENT BALANCE" : "● CLOSE MATCH"}
              </span>
            </div>
          </>
        ) : (
          <div className="glass-panel p-8 text-center text-military-khaki tracking-widest">
            — NO ACTIVE PLAYERS — Upload match data to begin
          </div>
        )}
      </section>

      {/* ── PLAYER RATINGS ─────────────────────── */}
      <section className="space-y-3">
        <h2
          className="text-lg tracking-[0.2em] uppercase text-military-olive"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          📊 Player Intel
        </h2>
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left war-table">
            <thead>
              <tr className="bg-black/40 text-military-khaki text-xs tracking-widest uppercase">
                <th className="p-3">#</th>
                <th className="p-3">Operator</th>
                <th className="p-3 text-right">Rating</th>
                <th className="p-3 text-right hidden sm:table-cell">K/D</th>
                <th className="p-3 text-right hidden sm:table-cell">Matches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border text-sm">
              {playerRatings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-military-khaki tracking-widest">
                    — No operators found. Add players in Admin. —
                  </td>
                </tr>
              ) : (
                playerRatings.map((p, i) => (
                  <tr key={p.id} className="transition-colors">
                    <td className="p-3 text-military-khaki font-mono">{i + 1}</td>
                    <td className="p-3 font-bold tracking-wide">{p.name}</td>
                    <td className="p-3 text-right">
                      <span className="text-gaming-accent font-mono font-bold">{p.rating}</span>
                    </td>
                    <td className="p-3 text-right font-mono text-military-olive hidden sm:table-cell">
                      {p.recentKd.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-military-khaki hidden sm:table-cell">
                      {p.matchesCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── RECENT MATCHES ─────────────────────── */}
      {recentMatches.length > 0 && (
        <section className="space-y-3 pb-12">
        <div className="flex justify-between items-center">
          <h2
            className="text-lg tracking-[0.2em] uppercase text-military-olive"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            🕰 Recent Engagements
          </h2>
          <Link
            href="/matches"
            className="text-xs text-military-khaki hover:text-gaming-accent transition-colors tracking-widest uppercase border border-glass-border px-3 py-1 rounded"
          >
            View All →
          </Link>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentMatches.map((m) => (
              <div key={m.id} className="glass-panel p-4 space-y-3">
                <div className="flex justify-between text-xs text-military-khaki tracking-widest uppercase">
                  <span>{m.mode}</span>
                  <span>{new Date(m.playedAt).toLocaleDateString()}</span>
                </div>
                <div className="space-y-1">
                  {m.players.slice(0, 5).map((mp) => (
                    <div key={mp.id} className="flex justify-between text-sm">
                      <span className="text-text-primary">{mp.player.displayName}</span>
                      <span className="font-mono text-military-olive">{mp.kills}/{mp.deaths}</span>
                    </div>
                  ))}
                  {m.players.length > 5 && (
                    <div className="text-center text-military-khaki text-xs pt-1 tracking-widest">
                      +{m.players.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* ── PAKISTANI FOOTER ──────────────────────── */}
      <footer className="pb-8 pt-4 flex flex-col items-center gap-2">
        {/* Pakistan flag stripe */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-[3px] rounded" style={{ background: "linear-gradient(90deg, transparent, #01411C)" }} />
          <span style={{ color: "#d4aa3c", fontSize: "1.4rem" }}>☪</span>
          <div className="flex-1 h-[3px] rounded" style={{ background: "linear-gradient(90deg, #01411C, transparent)" }} />
        </div>
        <div
          className="text-sm tracking-[0.1em]"
          style={{ fontFamily: "'Noto Nastaliq Urdu', serif", color: "#d4aa3c", direction: "rtl", lineHeight: "2" }}
        >
          دُرّانی فیملی — پاکستان زندہ باد 🇵🇰
        </div>
        <p className="text-xs tracking-widest text-military-khaki uppercase">
          DURRANI FAMILY · PAKISTAN
        </p>
      </footer>
    </div>
  );
}
