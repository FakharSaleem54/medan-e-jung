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

    // Normalize: lowercase, remove special chars/accents, trim
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // strip accents
        .replace(/[^a-z0-9]/g, "")        // keep only alphanumeric
        .trim();

    // For each player in the scorecard, find or create a Player record by displayName
    for (const p of players) {
      const kills = Number(p.kills) || 0;
      const deaths = Number(p.deaths) || 0;
      const kd = deaths > 0 ? kills / deaths : kills;

      const normalizedExtracted = normalize(p.name);

      // Find existing player by fuzzy normalized name match
      let player = allPlayers.find(
        (existing) =>
          normalize(existing.displayName) === normalizedExtracted ||
          (existing.nickname && normalize(existing.nickname) === normalizedExtracted)
      ) ?? null;

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
