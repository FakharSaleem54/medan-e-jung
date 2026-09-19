import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const isAuth = await isAuthenticated();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { password } = await request.json() as { password: string };

    if (password !== "000HARDRESET0") {
      return NextResponse.json({ error: "Invalid reset password." }, { status: 403 });
    }

    // Delete in correct order to respect foreign key constraints
    await prisma.matchPlayer.deleteMany();
    await prisma.match.deleteMany();
    await prisma.teamGeneration.deleteMany();
    await prisma.player.deleteMany();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hard reset error:", error);
    return NextResponse.json({ error: "Failed to reset database." }, { status: 500 });
  }
}
