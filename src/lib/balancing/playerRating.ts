export const BALANCING_CONFIG = {
  kdWeight: 0.70,
  killsWeight: 0.20,
  consistencyWeight: 0.10,
  recentMatchCount: 10,
};

export type PlayerMatchRecord = {
  kills: number;
  deaths: number;
  kd: number;
  playedAt: Date;
};

// Generates an array of weights from 1.00 down to 0.55 (for 10 matches)
function getWeights(count: number): number[] {
  const weights = [];
  for (let i = 0; i < count; i++) {
    // 1.0 for the first, decreasing by 0.05 for each subsequent match
    // Ensures we don't go below 0.1
    weights.push(Math.max(1.0 - i * 0.05, 0.1));
  }
  return weights;
}

/**
 * Calculates the current player rating (0-100) based on their recent matches.
 * The matches array MUST be sorted from newest to oldest.
 */
export function calculatePlayerRating(matches: PlayerMatchRecord[]): {
  rating: number;
  recentKd: number;
  confidence: "Low" | "Moderate" | "High";
} {
  const recentMatches = matches.slice(0, BALANCING_CONFIG.recentMatchCount);
  
  if (recentMatches.length === 0) {
    return { rating: 50, recentKd: 1.0, confidence: "Low" };
  }

  const weights = getWeights(recentMatches.length);
  
  let weightedKills = 0;
  let weightedDeaths = 0;
  let totalWeight = 0;

  // Calculate standard deviation of KD for consistency
  const kds = recentMatches.map(m => m.kd);
  const meanKd = kds.reduce((a, b) => a + b, 0) / kds.length;
  const variance = kds.reduce((a, b) => a + Math.pow(b - meanKd, 2), 0) / kds.length;
  const stdDev = Math.sqrt(variance);
  
  // Consistency score: lower stdDev means higher consistency (max 1)
  const consistencyScore = Math.max(0, 1 - (stdDev / Math.max(meanKd, 1))); // rough heuristic

  recentMatches.forEach((match, index) => {
    const weight = weights[index];
    weightedKills += match.kills * weight;
    weightedDeaths += match.deaths * weight;
    totalWeight += weight;
  });

  // Calculate Weighted K/D
  // If deaths are 0, use 1 to prevent infinity
  const effectiveDeaths = Math.max(weightedDeaths, 1); 
  const recentKd = weightedKills / effectiveDeaths;

  // Normalize K/D (assuming 3.0 is exceptionally good, map to 100)
  // We'll map K/D of 0 to 0, 3.0+ to 100
  let kdScore = (recentKd / 3.0) * 100;
  kdScore = Math.min(Math.max(kdScore, 0), 100);

  // Normalize Kills (assuming 25+ average weighted kills is excellent)
  const avgWeightedKills = weightedKills / totalWeight;
  let killsScore = (avgWeightedKills / 25.0) * 100;
  killsScore = Math.min(Math.max(killsScore, 0), 100);

  const consScoreNorm = consistencyScore * 100;

  let rawRating = 
    (kdScore * BALANCING_CONFIG.kdWeight) + 
    (killsScore * BALANCING_CONFIG.killsWeight) + 
    (consScoreNorm * BALANCING_CONFIG.consistencyWeight);
    
  // Small-sample protection
  let confidence: "Low" | "Moderate" | "High" = "High";
  if (recentMatches.length <= 2) {
    confidence = "Low";
    // Regress heavily towards 50
    rawRating = (rawRating * 0.3) + (50 * 0.7);
  } else if (recentMatches.length <= 5) {
    confidence = "Moderate";
    // Regress slightly towards 50
    rawRating = (rawRating * 0.7) + (50 * 0.3);
  }

  return {
    rating: Math.round(rawRating),
    recentKd: Number(recentKd.toFixed(2)),
    confidence
  };
}
