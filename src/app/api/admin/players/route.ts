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
    const { displayName, nickname } = body as {
      displayName: string;
      nickname?: string;
    };

    if (!displayName || displayName.trim() === "") {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    const player = await prisma.player.create({
      data: {
        displayName: displayName.trim(),
        nickname: nickname?.trim() || null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error("Create player error:", error);
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const isAuth = await isAuthenticated();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { id, displayName, nickname, active } = body as {
      id: string;
      displayName?: string;
      nickname?: string;
      active?: boolean;
    };

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...(displayName !== undefined && { displayName: displayName.trim() }),
        ...(nickname !== undefined && { nickname: nickname.trim() || null }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error("Update player error:", error);
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAuth = await isAuthenticated();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json() as { id: string };
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete player error:", error);
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 });
  }
}

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: { displayName: "asc" },
  });
  return NextResponse.json(players);
}
