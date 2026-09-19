import { GoogleGenAI } from "@google/genai";

export interface PlayerMatchData {
  name: string;
  kills: number;
  deaths: number;
  kd?: number;
  confidence: number;
}

export interface ExtractedMatch {
  mode?: string;
  players: PlayerMatchData[];
}

export interface ScorecardExtractor {
  extractScorecard(imageBase64: string, mimeType: string): Promise<ExtractedMatch>;
}

const EXTRACTION_PROMPT = `
This is a screenshot of a Call of Duty Mobile scoreboard.

Your task:
1. Identify the match mode (e.g., Team Deathmatch, Frontline) if visible.
2. Extract every visible player's name, kills, and deaths from the scoreboard.
3. If K/D is not shown, calculate it as kills divided by deaths (use 1 for deaths if deaths is 0).
4. Preserve player names exactly as they appear.
5. Do NOT invent players. Do NOT guess missing numbers.
6. Assign a confidence score (0-100) per player row based on how clearly you can read it.

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "mode": "string or null",
  "players": [
    {
      "name": "string",
      "kills": number,
      "deaths": number,
      "kd": number,
      "confidence": number
    }
  ]
}
`;

export class GeminiScorecardExtractor implements ScorecardExtractor {
  async extractScorecard(imageBase64: string, mimeType: string): Promise<ExtractedMatch> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Retry up to 3 times for transient 503 overload errors
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: EXTRACTION_PROMPT },
                { inlineData: { data: imageBase64, mimeType } }
              ]
            }
          ]
        });

        const text = response.text;
        if (!text) throw new Error("Gemini returned an empty response.");

        // Strip markdown code fences if the model wrapped JSON in them
        const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleaned) as ExtractedMatch;
        return parsed;
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const is503 = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("overloaded");
        if (is503 && attempt < 3) {
          console.log(`Gemini overloaded, retrying (attempt ${attempt}/3)...`);
          await new Promise(res => setTimeout(res, attempt * 3000)); // wait 3s, 6s
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }
}

export const scorecardExtractor = new GeminiScorecardExtractor();
