const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create 8 family members
  const playersData = [
    "Fakhar",
    "Hamza",
    "Ali",
    "Ahmed",
    "Zain",
    "Usman",
    "Hassan",
    "Bilal",
  ];

  const players = [];
  for (const name of playersData) {
    const player = await prisma.player.create({
      data: {
        displayName: name,
        nickname: `${name}_07`,
        active: true,
      },
    });
    players.push(player);
  }

  // Create some dummy matches over the last week
  const mode = "Team Deathmatch";
  for (let i = 0; i < 15; i++) {
    // Generate match date (up to 7 days ago, sorted)
    const playedAt = new Date();
    playedAt.setDate(playedAt.getDate() - Math.floor(Math.random() * 7));

    const match = await prisma.match.create({
      data: {
        mode,
        playedAt,
        notes: `Seed match ${i + 1}`,
      },
    });

    // Pick 8 random players to play this match, split into 2 teams
    const matchPlayers = [...players].sort(() => 0.5 - Math.random());
    
    for (let j = 0; j < 8; j++) {
      const p = matchPlayers[j];
      const kills = Math.floor(Math.random() * 20) + 5; // 5 to 25
      const deaths = Math.floor(Math.random() * 15) + 5; // 5 to 20
      const kd = kills / deaths;
      const team = j < 4 ? "A" : "B";

      await prisma.matchPlayer.create({
        data: {
          matchId: match.id,
          playerId: p.id,
          kills,
          deaths,
          kd,
          team,
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
