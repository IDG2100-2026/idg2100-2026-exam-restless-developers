import Match from "../models/match.js";

// Die values 1-6 map to: 1=7, 2=8, 3=J, 4=Q, 5=K, 6=A (ordered low→high)
function rollAllDice() {
  return Array.from({ length: 5 }, () => Math.ceil(Math.random() * 6));
}

function evaluateHand(dice, straightsAllowed) {
  const counts = {};
  for (const d of dice) counts[d] = (counts[d] || 0) + 1;

  const groups = Object.entries(counts)
    .map(([val, count]) => ({ val: Number(val), count }))
    .sort((a, b) => b.count - a.count || b.val - a.val);

  const sorted = [...dice].sort((a, b) => a - b);
  const isStraight = straightsAllowed && (
    sorted.join("") === "12345" || sorted.join("") === "23456"
  );

  const top = groups[0];
  const second = groups[1];

  if (top.count === 5) return { rank: 8, name: "Five of a Kind", tiebreak: [top.val] };
  if (top.count === 4) return { rank: 7, name: "Four of a Kind", tiebreak: [top.val, second.val] };
  if (top.count === 3 && second?.count === 2) return { rank: 6, name: "Full House", tiebreak: [top.val, second.val] };
  if (isStraight) return { rank: 5, name: "Straight", tiebreak: [sorted[4]] };
  if (top.count === 3) return { rank: 4, name: "Three of a Kind", tiebreak: groups.map(g => g.val) };
  if (top.count === 2 && second?.count === 2) return { rank: 3, name: "Two Pairs", tiebreak: groups.map(g => g.val) };
  if (top.count === 2) return { rank: 2, name: "One Pair", tiebreak: groups.map(g => g.val) };
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

export async function createMatch(req, res) {
  const { rounds, straightsAllowed, timeControl, maxPlayers, buyIn, userId } = req.body;

  try {
    const match = await Match.create({
      players: userId ? [{ userId, isAnonymous: false }] : [],
      maxPlayers: maxPlayers ?? 2,
      buyIn: buyIn ?? 1,
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
    const match = await Match.findById(req.params.id).populate("players.userId", "username elo");
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function joinMatch(req, res) {
  const { userId } = req.body;

  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (match.status !== "waiting") return res.status(400).json({ message: "Match is not open" });
    if (match.players.length >= match.maxPlayers) return res.status(400).json({ message: "Match is full" });

    const alreadyJoined = match.players.some((p) => p.userId?.toString() === userId);
    if (alreadyJoined) return res.status(400).json({ message: "Already in this match" });

    match.players.push({ userId, isAnonymous: !userId });

    if (match.players.length >= match.maxPlayers) {
      match.status = "active";
      match.currentTurn = match.players[0].userId;
      // Auto-roll first player's dice to start the game
      match.players[0].dice = rollAllDice();
      match.players[0].rollsLeft = 2;
    }

    match.markModified("players");
    await match.save();
    await match.populate("players.userId", "username elo");

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function endTurn(req, res) {
  const { userId } = req.body;

  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (match.status !== "active") return res.status(400).json({ message: "Match is not active" });
    if (match.currentTurn?.toString() !== userId) return res.status(403).json({ message: "Not your turn" });

    const currentIndex = match.players.findIndex((p) => p.userId?.toString() === userId);
    if (currentIndex === -1) return res.status(403).json({ message: "Not in this match" });

    if (match.players[currentIndex].rollsLeft > 0) {
      return res.status(400).json({ message: "You still have rolls left" });
    }

    const nextIndex = (currentIndex + 1) % match.players.length;

    if (nextIndex === 0) {
      // All players have gone — resolve the round
      const hands = match.players.map((p) => evaluateHand(
        p.dice.length === 5 ? [...p.dice] : [1, 1, 1, 1, 1],
        match.variant.straightsAllowed
      ));

      let bestIndex = 0;
      for (let i = 1; i < hands.length; i++) {
        if (compareHands(hands[i], hands[bestIndex]) > 0) bestIndex = i;
      }
      const isTie = hands.some((h, i) => i !== bestIndex && compareHands(h, hands[bestIndex]) === 0);

      if (!isTie) {
        match.players[bestIndex].roundWins = (match.players[bestIndex].roundWins || 0) + 1;
      }

      const winsNeeded = Math.ceil(match.variant.rounds / 2);
      const matchWinner = match.players.find((p) => (p.roundWins || 0) >= winsNeeded);

      if (matchWinner) {
        match.status = "finished";
        match.winner = matchWinner.userId;
        const matchLoser = match.players.find((p) => p.userId?.toString() !== matchWinner.userId?.toString());
        if (matchLoser) match.loser = matchLoser.userId;
        match.currentTurn = null;
      } else {
        // Round over but match continues — wait for "Start Next Round"
        match.roundPending = true;
        match.currentTurn = null;
        match.lastRoundWinnerId = isTie ? null : match.players[bestIndex].userId;
      }
    } else {
      // Pass turn to next player with auto-roll
      match.currentTurn = match.players[nextIndex].userId;
      match.players[nextIndex].dice = rollAllDice();
      match.players[nextIndex].rollsLeft = 2;
      match.players[nextIndex].held = [false, false, false, false, false];
    }

    match.markModified("players");
    await match.save();
    await match.populate("players.userId", "username elo");

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function startNextRound(req, res) {
  const { userId } = req.body;

  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (!match.roundPending) return res.status(400).json({ message: "No round pending" });

    const isPlayer = match.players.some((p) => p.userId?.toString() === userId);
    if (!isPlayer) return res.status(403).json({ message: "Not in this match" });

    match.roundPending = false;
    match.lastRoundWinnerId = null;
    match.currentRound = (match.currentRound || 1) + 1;
    match.currentTurn = match.players[0].userId;

    for (const player of match.players) {
      player.held = [false, false, false, false, false];
      player.rollsLeft = 3;
      player.dice = [];
    }

    // Auto-roll first player
    match.players[0].dice = rollAllDice();
    match.players[0].rollsLeft = 2;

    match.markModified("players");
    await match.save();
    await match.populate("players.userId", "username elo");

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function rollDice(req, res) {
  const { userId, held } = req.body;

  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: "Match not found" });
    if (match.status !== "active") return res.status(400).json({ message: "Match is not active" });
    if (match.currentTurn?.toString() !== userId) return res.status(403).json({ message: "Not your turn" });

    const playerIndex = match.players.findIndex((p) => p.userId?.toString() === userId);
    if (playerIndex === -1) return res.status(403).json({ message: "Not in this match" });

    const player = match.players[playerIndex];
    if (player.rollsLeft <= 0) return res.status(400).json({ message: "No rolls left" });

    const heldArr = Array.isArray(held) ? held : [false, false, false, false, false];
    const currentDice = player.dice?.length === 5 ? player.dice : [1, 1, 1, 1, 1];
    const newDice = currentDice.map((d, i) => (heldArr[i] ? d : Math.ceil(Math.random() * 6)));

    match.players[playerIndex].dice = newDice;
    match.players[playerIndex].held = heldArr;
    match.players[playerIndex].rollsLeft = player.rollsLeft - 1;
    match.markModified("players");

    await match.save();
    await match.populate("players.userId", "username elo");

    res.json(match);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
