import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import ManageMatches from "./ManageMatches";

export default async function ManageMatchesPage() {
  await requireAuth();

  const matches = await prisma.match.findMany({
    orderBy: { playedAt: "desc" },
    include: {
      players: {
        include: { player: true },
      },
    },
  });

  const serialized = matches.map((m) => ({
    id: m.id,
    mode: m.mode,
    playedAt: m.playedAt.toISOString(),
    notes: m.notes,
    players: m.players.map((mp) => ({
      id: mp.id,
      name: mp.player.displayName,
      kills: mp.kills,
      deaths: mp.deaths,
      kd: mp.kd,
      team: mp.team,
    })),
  }));

  return <ManageMatches initialMatches={serialized} />;
}
