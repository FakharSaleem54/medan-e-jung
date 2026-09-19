import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const ADMIN_SECRET = process.env.ADMIN_PASSWORD || "default_family_secret";

    if (password === ADMIN_SECRET) {
      await createSession();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
