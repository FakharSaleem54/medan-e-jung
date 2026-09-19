import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mode, players } = body as {
      mode: string;
      players: { name: string; kills: number; deaths: number }[];
    };

    if (!players || players.length === 0) {
      return NextResponse.json({ error: "No players provided" }, { status: 400 });
    }

    // Create the match first
    const match = await prisma.match.create({
      data: {
        mode: mode || "Team Deathmatch",
        playedAt: new Date(),
      },
    });

    // Fetch all existing players once for fuzzy matching
    const allPlayers = await prisma.player.findMany();

    // Helper: Levenshtein distance for typo tolerance
    const levenshtein = (a: string, b: string): number => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1,
            matrix[j - 1][i] + 1,
            matrix[j - 1][i - 1] + indicator
          );
        }
      }
      return matrix[b.length][a.length];
    };

    // Normalize: lowercase, remove accents, keep alphanumeric, replace visually similar chars (homoglyphs)
    const normalize = (s: string) => {
      let str = s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // strip accents
        .replace(/[^a-z0-9]/g, "");       // keep only alphanumeric

      // Handle common OCR mistakes / clan tag styling
      str = str.replace(/[1l|]/g, "i");
      str = str.replace(/[0]/g, "o");
      str = str.replace(/[3]/g, "e");
      str = str.replace(/[4]/g, "a");
      str = str.replace(/[5]/g, "s");
      str = str.replace(/[8]/g, "b");

      return str.trim();
    };

    // For each player in the scorecard, find or create a Player record by displayName
    for (const p of players) {
      const kills = Number(p.kills) || 0;
      const deaths = Number(p.deaths) || 0;
      const kd = deaths > 0 ? kills / deaths : kills;

      const normalizedExtracted = normalize(p.name);

      // Find existing player by fuzzy normalized name match
      let player = allPlayers.find((existing) => {
        const existNormName = normalize(existing.displayName);
        const existNormNick = existing.nickname ? normalize(existing.nickname) : "";

        // 1. Exact normalized match
        if (existNormName === normalizedExtracted || existNormNick === normalizedExtracted) {
          return true;
        }

        // 2. Typo tolerance (allow 1 typo for length >= 5, allow 2 typos for length >= 8)
        const allowedTypos = normalizedExtracted.length >= 8 ? 2 : normalizedExtracted.length >= 5 ? 1 : 0;
        
        if (allowedTypos > 0) {
          if (levenshtein(existNormName, normalizedExtracted) <= allowedTypos) return true;
          if (existNormNick && levenshtein(existNormNick, normalizedExtracted) <= allowedTypos) return true;
        }

        return false;
      }) ?? null;

      // If no player found, auto-create one
      if (!player) {
        player = await prisma.player.create({
          data: {
            displayName: p.name,
            nickname: p.name,
            active: true,
          },
        });
        allPlayers.push(player); // keep local list in sync for subsequent iterations
      }

      await prisma.matchPlayer.create({
        data: {
          matchId: match.id,
          playerId: player.id,
          kills,
          deaths,
          kd,
        },
      });
    }

    return NextResponse.json({ success: true, matchId: match.id });
  } catch (error) {
    console.error("Save match error:", error);
    return NextResponse.json({ error: "Failed to save match" }, { status: 500 });
  }
}
