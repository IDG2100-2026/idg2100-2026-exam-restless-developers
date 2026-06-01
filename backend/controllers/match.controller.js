import Match from "../models/match.js";
import User from "../models/user.js";
import Tournament from "../models/tournament.js";
import { MIN_ELO_RATING, MAX_ELO_RATING } from "../config/constants.js";

function rollAllDice() {
  return Array.from({ length: 5 }, () => Math.ceil(Math.random() * 6));
}


const turnTimers = new Map();

function clearTurnTimer(matchId) {
  const key = String(matchId);
  if (turnTimers.has(key)) {
    clearTimeout(turnTimers.get(key));
    turnTimers.delete(key);
  }
}

function startTurnTimer(matchId, userId, timeControl, io) {
  clearTurnTimer(matchId);
  const id = setTimeout(
    () => autoRollAndEndTurn(String(matchId), String(userId), io),
    timeControl * 1000
  );
  turnTimers.set(String(matchId), id);
}

async function autoRollAndEndTurn(matchId, userId, io) {
  try {
    const match = await Match.findById(matchId);
    if (!match || match.status !== "active") return;
    if (match.currentTurn?.toString() !== userId) return;

    const playerIndex = match.players.findIndex(
      (p) => p.userId?.toString() === userId
    );
    if (playerIndex === -1) return;

    if (match.players[playerIndex].rollsLeft === 3) {
      match.players[playerIndex].dice = rollAllDice();
    }
    match.players[playerIndex].rollsLeft = 0;

    await doEndTurn(match, userId, io);
  } catch (err) {
    console.error("Turn timer error:", err);
  }
}

export function startMatch(match) {
  match.status = "active";
  match.currentTurn = match.players[0].userId;
  match.players[0].dice = rollAllDice();
  match.players[0].rollsLeft = 2;
  for (const p of match.players) p.stack = match.buyIn;
  match.markModified("players");

  return match;
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function createPairings(players, maxPlayersPerGame) {
  const shuffledPlayers = shuffleArray(players);
  const pairings = [];

  for (let i = 0; i < shuffledPlayers.length; i += maxPlayersPerGame) {
    pairings.push({
      players: shuffledPlayers.slice(i, i + maxPlayersPerGame),
      winner: null,
      pointsAwarded: 0,
      game: null,
    });
  }

  return pairings;
}

function enterBettingPhase(match) {
  match.bettingPhase = true;
  match.currentTurn = null;
  match.pot = 0;
  match.currentHighBet = 0;
  for (const p of match.players) {
    p.currentBet = 0;
    p.hasFolded = false;
    p.hasActed = false;
  }
  match.bettingTurn = match.players[0].userId;
  match.markModified("players");
}

function evaluateHand(dice, straightsAllowed) {
  const counts = {};
  for (const d of dice) counts[d] = (counts[d] || 0) + 1;

  const groups = Object.entries(counts)
    .map(([val, count]) => ({ val: Number(val), count }))
    .sort((a, b) => b.count - a.count || b.val - a.val);

  const sorted = [...dice].sort((a, b) => a - b);
  const isStraight =
    straightsAllowed &&
    (sorted.join("") === "12345" || sorted.join("") === "23456");

  const top = groups[0];
  const second = groups[1];

  if (top.count === 5)
    return { rank: 8, name: "Five of a Kind", tiebreak: [top.val] };
  if (top.count === 4)
    return { rank: 7, name: "Four of a Kind", tiebreak: [top.val, second.val] };
  if (top.count === 3 && second?.count === 2)
    return { rank: 6, name: "Full House", tiebreak: [top.val, second.val] };
  if (isStraight)
    return { rank: 5, name: "Straight", tiebreak: [sorted[4]] };
  if (top.count === 3)
    return { rank: 4, name: "Three of a Kind", tiebreak: groups.map((g) => g.val) };
  if (top.count === 2 && second?.count === 2)
    return { rank: 3, name: "Two Pairs", tiebreak: groups.map((g) => g.val) };
  if (top.count === 2)
    return { rank: 2, name: "One Pair", tiebreak: groups.map((g) => g.val) };

  return { rank: 1, name: "High Card", tiebreak: sorted.reverse() };
}

function compareHands(a, b) {
  if (a.rank !== b.rank) return a.rank - b.rank;

  for (let i = 0; i < Math.max(a.tiebreak.length, b.tiebreak.length); i++) {
    const diff = (a.tiebreak[i] || 0) - (b.tiebreak[i] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

async function updateTournamentAfterMatchFinished(match, winnerId) {
  if (!match.tournamentId) {
    return;
  }

  const tournament = await Tournament.findById(match.tournamentId);

  if (!tournament) {
    return;
  }

  const round = tournament.rounds.find(
    (round) => round.roundNumber === tournament.currentRound
  );

  if (!round) {
    return;
  }

  const pairing = round.pairings.find(
    (pairing) => pairing.game?.toString() === match._id.toString()
  );

  if (!pairing || pairing.winner) {
    return;
  }

  pairing.winner = winnerId;
  pairing.pointsAwarded = 3;

  pairing.players.forEach((playerId) => {
    const standing = tournament.standings.find(
      (standing) => standing.player.toString() === playerId.toString()
    );

    if (!standing) return;

    if (playerId.toString() === winnerId.toString()) {
      standing.points += 3;
      standing.wins += 1;
    } else {
      standing.losses += 1;
    }
  });

    const allPairingsCompleted = round.pairings.every(
    (pairing) => pairing.winner
  );

  
if (allPairingsCompleted) {
  round.status = "completed";
  round.completedAt = new Date();

  const hasMoreRounds = tournament.currentRound < tournament.tournamentRounds;

if (hasMoreRounds) {
  const nextRoundNumber = tournament.currentRound + 1;

  tournament.currentRound = nextRoundNumber;

  tournament.rounds.push({
    roundNumber: nextRoundNumber,
    status: "active",
    pairings: createPairings(
      tournament.players,
      tournament.gameVariant.maxPlayersPerGame
    ),
    startedAt: new Date(),
    completedAt: null,
  });

  tournament.nextRoundStart = new Date(Date.now() + 1000 * 30);
} else {
  tournament.status = "finished";
  tournament.nextRoundStart = null;
}

  await tournament.save();
}
}

export async function leaveMatch(req, res) {
  const { userId } = req.body;

  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (match.status !== "waiting") return res.status(400).json({ message: "Can only leave before the game starts" });

    const playerIndex = match.players.findIndex((p) => p.userId?.toString() === userId);
    if (playerIndex === -1) return res.status(403).json({ message: "Not in this match" });

    match.players.splice(playerIndex, 1);

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.points = (user.points || 0) + match.buyIn;
        await user.save();
      }
    }

    match.markModified("players");
    await match.save();
    await match.populate("players.userId", "username elo");

    req.app.get("io").to(`match:${match._id}`).emit("match:update", match);
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function listMatches(req, res) {
  try {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const matches = await Match.find(filter)
      .populate("players.userId", "username elo")
      .sort({ _id: -1 })
      .limit(50);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createMatch(req, res) {
  const { rounds, straightsAllowed, timeControl, maxPlayers, buyIn, userId } =
    req.body;
  const actualBuyIn = buyIn ?? 1;

  try {
    if (userId) {
      const creator = await User.findById(userId);
      if (!creator) return res.status(404).json({ message: "User not found" });
      if (creator.points < actualBuyIn) {
        return res.status(400).json({ message: "Not enough points for buy-in" });
      }
      creator.points -= actualBuyIn;
      await creator.save();
    }

    const match = await Match.create({
      players: userId ? [{ userId, isAnonymous: false }] : [],
      maxPlayers: maxPlayers ?? 2,
      buyIn: actualBuyIn,
      isAnonymousMatch: !userId,
      variant: {
        rounds,
        straightsAllowed,
        timeControl,
      },
    });

    res.status(201).json(match);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function getMatch(req, res) {
  try {
    const match = await Match.findById(req.params.id).populate(
      "players.userId",
      "username elo"
    );

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function joinMatch(req, res) {
  const { userId } = req.body;

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "waiting") {
      return res.status(400).json({ message: "Match is not open" });
    }

    if (match.players.length >= match.maxPlayers) {
      return res.status(400).json({ message: "Match is full" });
    }

    const alreadyJoined = match.players.some(
      (p) => p.userId?.toString() === userId
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: "Already in this match" });
    }

    if (userId) {
      const joiner = await User.findById(userId);
      if (!joiner) return res.status(404).json({ message: "User not found" });
      if (joiner.points < match.buyIn) {
        return res.status(400).json({ message: "Not enough points for buy-in" });
      }
      joiner.points -= match.buyIn;
      await joiner.save();
    }

    match.players.push({ userId, isAnonymous: !userId });

    if (match.players.length >= match.maxPlayers) {
      startMatch(match);
    } else {
      match.markModified("players");
    }

    await match.save();
    await match.populate("players.userId", "username elo");

    req.app.get("io").to(`match:${match._id}`).emit("match:update", match);

    if (match.status === "active") {
      startTurnTimer(match._id, match.players[0].userId, match.variant.timeControl, req.app.get("io"));
    }

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function doEndTurn(match, userId, io) {
  const currentIndex = match.players.findIndex(
    (p) => p.userId?.toString() === userId
  );
  if (currentIndex === -1) return;

  const nextIndex = (currentIndex + 1) % match.players.length;

  if (nextIndex === 0) {
    const hands = match.players.map((p) =>
      evaluateHand(
        p.dice.length === 5 ? [...p.dice] : [1, 1, 1, 1, 1],
        match.variant.straightsAllowed
      )
    );

    let bestIndex = 0;
    for (let i = 1; i < hands.length; i++) {
      if (compareHands(hands[i], hands[bestIndex]) > 0) {
        bestIndex = i;
      }
    }

    const isTie = hands.some(
      (h, i) => i !== bestIndex && compareHands(h, hands[bestIndex]) === 0
    );

    if (!isTie) {
      match.players[bestIndex].roundWins = (match.players[bestIndex].roundWins || 0) + 1;
    }

    const winsNeeded = Math.ceil(match.variant.rounds / 2);
    const matchWinner = match.players.find((p) => (p.roundWins || 0) >= winsNeeded);

    if (matchWinner) {
      match.status = "finished";
      match.winner = matchWinner.userId;
      clearTurnTimer(match._id);

      await updateTournamentAfterMatchFinished(match, matchWinner.userId);

      match.currentTurn = null;

      if (!match.isAnonymousMatch) {
        const K = 32;
        const userDocs = await Promise.all(
          match.players.map((p) => User.findById(p.userId))
        );

        const eloDeltas = new Array(match.players.length).fill(0);

        for (let i = 0; i < match.players.length; i++) {
          for (let j = i + 1; j < match.players.length; j++) {
            const ui = userDocs[i];
            const uj = userDocs[j];
            if (!ui || !uj) continue;

            const stackI = match.players[i].stack ?? 0;
            const stackJ = match.players[j].stack ?? 0;
            const scoreI = stackI > stackJ ? 1 : stackI < stackJ ? 0 : 0.5;
            const scoreJ = 1 - scoreI;

            const expectedI = 1 / (1 + Math.pow(10, (uj.elo - ui.elo) / 400));
            const expectedJ = 1 - expectedI;

            eloDeltas[i] += Math.round(K * (scoreI - expectedI));
            eloDeltas[j] += Math.round(K * (scoreJ - expectedJ));
          }
        }

        const winnerIdx = match.players.findIndex((p) => p.userId?.toString() === matchWinner.userId?.toString());
        const winnerDelta = eloDeltas[winnerIdx] ?? 0;
        const loserDelta = match.players.length === 2 ? eloDeltas[winnerIdx === 0 ? 1 : 0] ?? 0 : null;

        for (let i = 0; i < match.players.length; i++) {
          const u = userDocs[i];
          if (!u) continue;
          u.points = (u.points || 0) + (match.players[i].stack || 0);
          u.elo = Math.min(MAX_ELO_RATING, Math.max(MIN_ELO_RATING, u.elo + eloDeltas[i]));
          u.totalGames += 1;
          if (match.players[i].userId?.toString() === matchWinner.userId?.toString()) {
            u.wins += 1;
          } else {
            u.losses += 1;
          }
          await u.save();
        }

        match.eloChange = { winnerDelta, loserDelta };
      }
    } else {
      match.lastRoundWinnerId = isTie ? null : match.players[bestIndex].userId;
      enterBettingPhase(match);
      clearTurnTimer(match._id);
    }
  } else {
    match.currentTurn = match.players[nextIndex].userId;
    match.players[nextIndex].dice = rollAllDice();
    match.players[nextIndex].rollsLeft = 2;
    match.players[nextIndex].held = [false, false, false, false, false];
    startTurnTimer(match._id, match.players[nextIndex].userId, match.variant.timeControl, io);
  }

  match.markModified("players");
  await match.save();
  await match.populate("players.userId", "username elo");
  io.to(`match:${match._id}`).emit("match:update", match);
}

export async function endTurn(req, res) {
  const { userId } = req.body;

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "active") {
      return res.status(400).json({ message: "Match is not active" });
    }

    if (match.currentTurn?.toString() !== userId) {
      return res.status(403).json({ message: "Not your turn" });
    }

    const currentIndex = match.players.findIndex(
      (p) => p.userId?.toString() === userId
    );

    if (currentIndex === -1) {
      return res.status(403).json({ message: "Not in this match" });
    }

    if (match.players[currentIndex].rollsLeft > 0) {
      return res.status(400).json({ message: "You still have rolls left" });
    }

    clearTurnTimer(match._id);
    const io = req.app.get("io");
    await doEndTurn(match, userId, io);

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}




export async function startNextRound(req, res) {
  const { userId } = req.body;

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (!match.roundPending) {
      return res.status(400).json({ message: "No round pending" });
    }

    const isPlayer = match.players.some(
      (p) => p.userId?.toString() === userId
    );

    if (!isPlayer) {
      return res.status(403).json({ message: "Not in this match" });
    }

    match.roundPending = false;
    match.bettingPhase = false;
    match.lastRoundWinnerId = null;
    match.pot = 0;
    match.currentHighBet = 0;
    match.bettingTurn = null;
    match.currentRound = (match.currentRound || 1) + 1;
    match.currentTurn = match.players[0].userId;

    for (const player of match.players) {
      player.held = [false, false, false, false, false];
      player.rollsLeft = 3;
      player.dice = [];
      player.currentBet = 0;
      player.hasFolded = false;
      player.hasActed = false;
    }

    match.players[0].dice = rollAllDice();
    match.players[0].rollsLeft = 2;

    match.markModified("players");

    await match.save();
    await match.populate("players.userId", "username elo");

    req.app.get("io").to(`match:${match._id}`).emit("match:update", match);

    startTurnTimer(match._id, match.players[0].userId, match.variant.timeControl, req.app.get("io"));

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function placeBet(req, res) {
  const { userId, action, amount } = req.body;

  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (!match.bettingPhase) return res.status(400).json({ message: "Not in betting phase" });
    if (match.bettingTurn?.toString() !== userId) return res.status(403).json({ message: "Not your betting turn" });

    const playerIndex = match.players.findIndex((p) => p.userId?.toString() === userId);
    if (playerIndex === -1) return res.status(403).json({ message: "Not in this match" });

    const p = match.players[playerIndex];

    if (action === "fold") {
      p.hasFolded = true;
      p.hasActed = true;
    } else if (action === "check") {
      if ((p.currentBet || 0) < match.currentHighBet) {
        return res.status(400).json({ message: "Cannot check — there is a bet to call" });
      }
      p.hasActed = true;
    } else if (action === "call") {
      const toCall = match.currentHighBet - (p.currentBet || 0);
      const actualCall = Math.min(toCall, p.stack || 0);
      p.stack = (p.stack || 0) - actualCall;
      p.currentBet = (p.currentBet || 0) + actualCall;
      match.pot = (match.pot || 0) + actualCall;
      p.hasActed = true;
    } else if (action === "bet") {
      const betAmount = Number(amount);
      if (!betAmount || betAmount <= 0) return res.status(400).json({ message: "Invalid bet amount" });
      const newTotal = (p.currentBet || 0) + betAmount;
      if (newTotal <= match.currentHighBet) {
        return res.status(400).json({ message: "Bet must exceed the current high bet" });
      }
      if (betAmount > (p.stack || 0)) return res.status(400).json({ message: "Not enough chips" });
      p.stack = (p.stack || 0) - betAmount;
      p.currentBet = newTotal;
      match.pot = (match.pot || 0) + betAmount;
      match.currentHighBet = newTotal;
      p.hasActed = true;
      for (let i = 0; i < match.players.length; i++) {
        if (i !== playerIndex && !match.players[i].hasFolded) {
          match.players[i].hasActed = false;
        }
      }
    } else {
      return res.status(400).json({ message: "Unknown action" });
    }

    const activePlayers = match.players.filter((p) => !p.hasFolded);
    const bettingDone =
      activePlayers.length === 1 ||
      activePlayers.every((p) => p.hasActed && (p.currentBet || 0) === match.currentHighBet);

    if (bettingDone) {
      const potWinnerId =
        activePlayers.length === 1
          ? activePlayers[0].userId?.toString()
          : match.lastRoundWinnerId?.toString();

      const potWinner = match.players.find((p) => p.userId?.toString() === potWinnerId);
      if (potWinner) potWinner.stack = (potWinner.stack || 0) + match.pot;

      match.bettingPhase = false;
      match.pot = 0;
      match.currentHighBet = 0;
      match.bettingTurn = null;
      match.roundPending = true;
    } else {
      const currentIdx = match.players.findIndex((p) => p.userId?.toString() === userId);
      let nextIdx = (currentIdx + 1) % match.players.length;
      while (match.players[nextIdx].hasFolded) {
        nextIdx = (nextIdx + 1) % match.players.length;
      }
      match.bettingTurn = match.players[nextIdx].userId;
    }

    match.markModified("players");
    await match.save();
    await match.populate("players.userId", "username elo");

    req.app.get("io").to(`match:${match._id}`).emit("match:update", match);
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function rollDice(req, res) {
  const { userId, held } = req.body;

  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    if (match.status !== "active") {
      return res.status(400).json({ message: "Match is not active" });
    }

    if (match.currentTurn?.toString() !== userId) {
      return res.status(403).json({ message: "Not your turn" });
    }

    const playerIndex = match.players.findIndex(
      (p) => p.userId?.toString() === userId
    );

    if (playerIndex === -1) {
      return res.status(403).json({ message: "Not in this match" });
    }

    const player = match.players[playerIndex];

    if (player.rollsLeft <= 0) {
      return res.status(400).json({ message: "No rolls left" });
    }

    const heldArr = Array.isArray(held)
      ? held
      : [false, false, false, false, false];

    const currentDice =
      player.dice?.length === 5 ? player.dice : [1, 1, 1, 1, 1];

    const newDice = currentDice.map((d, i) =>
      heldArr[i] ? d : Math.ceil(Math.random() * 6)
    );

    match.players[playerIndex].dice = newDice;
    match.players[playerIndex].held = heldArr;
    match.players[playerIndex].rollsLeft = player.rollsLeft - 1;

    match.markModified("players");

    await match.save();
    await match.populate("players.userId", "username elo");

    req.app.get("io").to(`match:${match._id}`).emit("match:update", match);

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}