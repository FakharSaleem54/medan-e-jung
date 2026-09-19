import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  await requireAuth();

  const playersCount = await prisma.player.count();
  const matchesCount = await prisma.match.count();
  
  // Calculate average KD across all match players
  const allMatchPlayers = await prisma.matchPlayer.findMany();
  let avgKd = 0;
  if (allMatchPlayers.length > 0) {
    const totalKills = allMatchPlayers.reduce((acc, curr) => acc + curr.kills, 0);
    const totalDeaths = allMatchPlayers.reduce((acc, curr) => acc + curr.deaths, 0);
    avgKd = totalKills / Math.max(totalDeaths, 1);
  }

  const recentMatch = await prisma.match.findFirst({
    orderBy: { playedAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-6">
          <div className="text-sm text-gray-400">Total Players</div>
          <div className="text-3xl font-bold text-gaming-accent">{playersCount}</div>
        </div>
        <div className="glass-panel p-6">
          <div className="text-sm text-gray-400">Matches Recorded</div>
          <div className="text-3xl font-bold text-gaming-accent">{matchesCount}</div>
        </div>
        <div className="glass-panel p-6">
          <div className="text-sm text-gray-400">Global Avg K/D</div>
          <div className="text-3xl font-bold text-gaming-accent">{avgKd.toFixed(2)}</div>
        </div>
        <div className="glass-panel p-6">
          <div className="text-sm text-gray-400">Last Match</div>
          <div className="text-lg font-bold text-gaming-accent">
            {recentMatch ? recentMatch.playedAt.toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/upload" className="glass-panel p-6 hover:border-gaming-accent transition-colors flex items-center justify-center min-h-[150px]">
          <div className="text-center">
            <div className="text-4xl mb-2">📸</div>
            <div className="font-bold text-xl">Upload Scorecard</div>
          </div>
        </Link>
        <Link href="/admin/players" className="glass-panel p-6 hover:border-gaming-accent transition-colors flex items-center justify-center min-h-[150px]">
          <div className="text-center">
            <div className="text-4xl mb-2">👥</div>
            <div className="font-bold text-xl">Manage Players</div>
          </div>
        </Link>
        <Link href="/" className="glass-panel p-6 hover:border-gaming-accent transition-colors flex items-center justify-center min-h-[150px]">
          <div className="text-center">
            <div className="text-4xl mb-2">⚔️</div>
            <div className="font-bold text-xl">Generate Teams</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
