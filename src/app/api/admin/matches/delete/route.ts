import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(request: Request) {
  const isAuth = await isAuthenticated();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json() as { id: string };
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    // Cascade deletes MatchPlayer entries too (via Prisma schema onDelete: Cascade)
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete match error:", error);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}
