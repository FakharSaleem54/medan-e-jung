"use client";

import { useState, useEffect, useTransition } from "react";
import { BalancedTeamsOption, PlayerWithRating } from "@/lib/balancing/teamBalancer";
import { saveTeams } from "@/app/actions/teamActions";

export default function TeamsDisplay({ initialTeams }: { initialTeams: BalancedTeamsOption }) {
  const [teamA, setTeamA] = useState<PlayerWithRating[]>(initialTeams.teamA);
  const [teamB, setTeamB] = useState<PlayerWithRating[]>(initialTeams.teamB);

  useEffect(() => {
    setTeamA(initialTeams.teamA);
    setTeamB(initialTeams.teamB);
  }, [initialTeams]);

  const [isPending, startTransition] = useTransition();

  const movePlayer = (player: PlayerWithRating, from: "A" | "B") => {
    let newTeamA = teamA;
    let newTeamB = teamB;
    
    if (from === "A") {
      newTeamA = teamA.filter((p) => p.id !== player.id);
      newTeamB = [...teamB, player];
      setTeamA(newTeamA);
      setTeamB(newTeamB);
    } else {
      newTeamB = teamB.filter((p) => p.id !== player.id);
      newTeamA = [...teamA, player];
      setTeamB(newTeamB);
      setTeamA(newTeamA);
    }

    const newTeamARating = Math.round(newTeamA.reduce((sum, p) => sum + p.rating, 0));
    const newTeamBRating = Math.round(newTeamB.reduce((sum, p) => sum + p.rating, 0));
    const newDiff = Math.abs(newTeamARating - newTeamBRating);
    const allIds = [...newTeamA, ...newTeamB].map(p => p.id);

    startTransition(() => {
      saveTeams(allIds, newTeamA.map(p => p.id), newTeamB.map(p => p.id), newTeamARating, newTeamBRating, newDiff);
    });
  };

  const teamARating = Math.round(teamA.reduce((sum, p) => sum + p.rating, 0));
  const teamBRating = Math.round(teamB.reduce((sum, p) => sum + p.rating, 0));
  const ratingDifference = Math.abs(teamARating - teamBRating);
  const maxPossibleDiff = Math.max(teamARating, teamBRating, 1);
  const balancePercentage = Number((100 - (ratingDifference / maxPossibleDiff) * 100).toFixed(2));

  return (
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
            <span className="text-xs text-blue-400 font-mono">{teamARating} pts</span>
          </div>
          <div className="p-4 space-y-3">
            {teamA.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-blue-500 text-xs font-mono w-4">{i + 1}</span>
                <span className="flex-1 font-bold tracking-wide text-blue-100">{p.name}</span>
                <div className="text-right flex items-center gap-2">
                  <div className="text-gaming-accent font-mono text-sm font-bold">{p.rating}</div>
                  <button 
                    onClick={() => movePlayer(p, "A")}
                    className="text-xs px-2 py-1 bg-black/40 hover:bg-black/60 text-military-khaki rounded border border-glass-border transition-colors"
                    title="Move to Bravo"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-3">
            <div className="rating-bar" style={{ width: `${Math.min((teamARating / (teamARating + teamBRating)) * 100, 100)}%` }} />
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
            <span className="text-xs text-red-400 font-mono">{teamBRating} pts</span>
          </div>
          <div className="p-4 space-y-3">
            {teamB.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="text-left flex items-center gap-2">
                  <button 
                    onClick={() => movePlayer(p, "B")}
                    className="text-xs px-2 py-1 bg-black/40 hover:bg-black/60 text-military-khaki rounded border border-glass-border transition-colors"
                    title="Move to Alpha"
                  >
                    ←
                  </button>
                </div>
                <span className="text-red-500 text-xs font-mono w-4 text-center">{i + 1}</span>
                <span className="flex-1 font-bold tracking-wide text-red-100">{p.name}</span>
                <div className="text-right">
                  <div className="text-gaming-accent font-mono text-sm font-bold">{p.rating}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-3">
            <div className="rating-bar" style={{ width: `${Math.min((teamBRating / (teamARating + teamBRating)) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Balance meter */}
      <div className="glass-panel px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-military-khaki text-xs tracking-widest uppercase">Balance Diff</span>
          <span className="font-mono text-gaming-accent font-bold">{ratingDifference} pts</span>
        </div>
        <div className="flex-1 max-w-xs w-full">
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(0, balancePercentage)}%`,
                background: "linear-gradient(90deg, #cc4400, #ffaa00, #44cc00)",
              }}
            />
          </div>
        </div>
        <span
          className="text-sm font-bold tracking-widest uppercase"
          style={{ color: ratingDifference <= 5 ? "#44dd00" : (ratingDifference <= 15 ? "#ffaa00" : "#ff4444") }}
        >
          {ratingDifference <= 5 ? "▲ EXCELLENT BALANCE" : (ratingDifference <= 15 ? "● CLOSE MATCH" : "▼ UNBALANCED")}
        </span>
      </div>
    </>
  );
}
