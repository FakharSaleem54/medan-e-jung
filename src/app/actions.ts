"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function togglePlayerActive(id: string, active: boolean) {
  await prisma.player.update({
    where: { id },
    data: { active },
  });
  revalidatePath("/");
}
