import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/session";
import { scorecardExtractor } from "@/lib/ai/scorecardExtractor";

export async function POST(request: Request) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const extractedData = await scorecardExtractor.extractScorecard(base64, file.type);

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error: unknown) {
    // Surface the real error message so we can debug it
    const message = error instanceof Error ? error.message : String(error);
    console.error("Upload API Error:", message);
    return NextResponse.json(
      { error: `Extraction failed: ${message}` },
      { status: 500 }
    );
  }
}
