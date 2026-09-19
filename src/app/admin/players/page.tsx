import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import ManagePlayers from "./ManagePlayers";

export default async function AdminPlayersPage() {
  await requireAuth();

  const players = await prisma.player.findMany({
    orderBy: { displayName: "asc" },
  });

  return <ManagePlayers initialPlayers={players} />;
}
