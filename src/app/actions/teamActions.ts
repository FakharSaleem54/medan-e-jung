"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function saveTeams(
  playersIds: string[],
  teamAIds: string[],
  teamBIds: string[],
  teamARating: number,
  teamBRating: number,
  ratingDifference: number
) {
  // Clear any existing saved generation to maintain just the latest active one
  await prisma.teamGeneration.deleteMany({});

  await prisma.teamGeneration.create({
    data: {
      players: JSON.stringify(playersIds),
      teamA: JSON.stringify(teamAIds),
      teamB: JSON.stringify(teamBIds),
      teamARating,
      teamBRating,
      ratingDifference,
    },
  });

  // We don't necessarily need to revalidate the path here since the UI is already updated via React state,
  // but we can to keep server components fresh.
}

export async function autoBalanceTeams() {
  // Clear the saved generation so the page will calculate a fresh balance
  await prisma.teamGeneration.deleteMany({});
  
  // Revalidate home page
  revalidatePath("/");
}
