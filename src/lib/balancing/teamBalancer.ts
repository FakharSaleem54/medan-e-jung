export type PlayerWithRating = {
  id: string;
  name: string;
  rating: number;
};

export type BalancedTeamsOption = {
  teamA: PlayerWithRating[];
  teamB: PlayerWithRating[];
  teamARating: number;
  teamBRating: number;
  ratingDifference: number;
  balancePercentage: number;
};

// Helper to generate all combinations of k elements from an array
function getCombinations<T>(arr: T[], k: number): T[][] {
  const results: T[][] = [];

  function helper(start: number, currentCombo: T[]) {
    if (currentCombo.length === k) {
      results.push([...currentCombo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      currentCombo.push(arr[i]);
      helper(i + 1, currentCombo);
      currentCombo.pop();
    }
  }

  helper(0, []);
  return results;
}

export function generateBalancedTeams(
  players: PlayerWithRating[]
): BalancedTeamsOption[] {
  if (players.length < 2) return [];

  // Deterministic tie-breaker: sort alphabetically by ID first to ensure same input order always yields same combos
  const sortedPlayers = [...players].sort((a, b) => a.id.localeCompare(b.id));

  // Determine size of Team A. E.g., for 7 players, 4 vs 3 (Team A gets 4).
  // For 10 players, 5 vs 5.
  const teamASize = Math.ceil(sortedPlayers.length / 2);
  
  const allCombos = getCombinations(sortedPlayers, teamASize);
  const options: BalancedTeamsOption[] = [];

  // We use a Set to avoid mirror duplicate matches. E.g., A vs B is same as B vs A.
  // This is primarily relevant when teams are perfectly equal size, but for simplicity
  // we can create a canonical string key for the match split.
  const seenSplits = new Set<string>();

  for (const combo of allCombos) {
    const teamAIds = new Set(combo.map(p => p.id));
    const teamB = sortedPlayers.filter(p => !teamAIds.has(p.id));

    // Create a canonical string representation for this split to avoid mirror duplicates
    // Sort the IDs in both teams, then sort the two teams.
    const teamAStr = combo.map(p => p.id).sort().join(',');
    const teamBStr = teamB.map(p => p.id).sort().join(',');
    
    // Sort team A and B strings so that "A vs B" generates same key as "B vs A"
    const splitKey = [teamAStr, teamBStr].sort().join('|');

    if (seenSplits.has(splitKey)) {
      continue;
    }
    seenSplits.add(splitKey);

    const teamARating = combo.reduce((sum, p) => sum + p.rating, 0);
    const teamBRating = teamB.reduce((sum, p) => sum + p.rating, 0);
    const ratingDifference = Math.abs(teamARating - teamBRating);
    
    // Calculate a rough balance percentage. 
    // If difference is 0, it's 100%. If difference is large, it goes down.
    const maxPossibleDiff = Math.max(teamARating, teamBRating, 1);
    const balancePercentage = Number((100 - (ratingDifference / maxPossibleDiff) * 100).toFixed(2));

    options.push({
      teamA: [...combo], // combo is already cloned but just to be safe
      teamB,
      teamARating,
      teamBRating,
      ratingDifference,
      balancePercentage
    });
  }

  // Sort options from smallest difference to largest
  options.sort((a, b) => {
    if (a.ratingDifference !== b.ratingDifference) {
      return a.ratingDifference - b.ratingDifference;
    }
    // Deterministic tie breaker
    return a.teamA[0].id.localeCompare(b.teamA[0].id);
  });

  // Return the top a few options, e.g., top 10 best balances
  return options.slice(0, 10);
}
