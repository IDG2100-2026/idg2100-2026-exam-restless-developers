function probability(r1, r2) {
  return 1 / (1 + Math.pow(10, (r1 - r2) / 400));
}

export function updateElo(winner, loser, k = 30) {
  const pw = probability(loser.elo, winner.elo);
  const pl = probability(winner.elo, loser.elo);

  winner.elo = winner.elo + k * (1 - pw);
  loser.elo = loser.elo + k * (0 - pl);

  winner.totalGames++;
  loser.totalGames++;

  winner.wins++;
  loser.losses++;

  return { winner, loser };
}
