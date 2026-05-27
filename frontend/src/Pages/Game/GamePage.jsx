// Worked on by: marte kaland
// Contains code from marte kaland's oblig3 (formatVariant, polling pattern, joinedRef, player card layout)

import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "../../WebComponents/GameBoard.js";
import "./GamePage.css";

const API = "http://localhost:6767/api/v1";

// Die values 1-6 → Spanish poker dice faces
const FACE = { 1: "7", 2: "8", 3: "J", 4: "Q", 5: "K", 6: "A" };

function formatVariant(variant) {
  if (!variant) return "—";
  const straights = variant.straightsAllowed ? "Straights" : "No straights";
  return `Best of ${variant.rounds} · ${variant.timeControl}s · ${straights}`;
}

function getHandName(dice, straightsAllowed) {
  if (!dice || dice.length !== 5) return "";
  const counts = {};
  for (const d of dice) counts[d] = (counts[d] || 0) + 1;
  const groups = Object.values(counts).sort((a, b) => b - a);
  const sorted = [...dice].sort((a, b) => a - b);
  const isStraight = straightsAllowed && (
    sorted.join("") === "12345" || sorted.join("") === "23456"
  );
  if (groups[0] === 5) return "Five of a Kind";
  if (groups[0] === 4) return "Four of a Kind";
  if (groups[0] === 3 && groups[1] === 2) return "Full House";
  if (isStraight) return "Straight";
  if (groups[0] === 3) return "Three of a Kind";
  if (groups[0] === 2 && groups[1] === 2) return "Two Pairs";
  if (groups[0] === 2) return "One Pair";
  return "High Card";
}

function GamePage() {
  const { id } = useParams();
  const currentUserId = localStorage.getItem("currentUserId");

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);
  const joinedRef = useRef(false);
  const boardContainerRef = useRef(null);
  const boardElementRef = useRef(null);

  async function fetchMatch() {
    try {
      const res = await fetch(`${API}/matches/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not load match");
        return null;
      }
      setMatch(data);
      return data;
    } catch {
      setError("Could not load match");
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    joinedRef.current = false;

    async function init() {
      const loaded = await fetchMatch();
      if (!loaded) return;

      const isOwner = loaded.players.some(
        (p) => String(p.userId?._id ?? p.userId) === String(currentUserId)
      );
      const hasRoom = loaded.players.length < loaded.maxPlayers;

      if (loaded.status === "waiting" && !isOwner && hasRoom && currentUserId && !joinedRef.current) {
        joinedRef.current = true;
        try {
          await fetch(`${API}/matches/${id}/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId }),
          });
          await fetchMatch();
        } catch {
          // game may already be full
        }
      }
    }

    init();

    intervalRef.current = setInterval(fetchMatch, 15000);
    return () => clearInterval(intervalRef.current);
  }, [id]);

  // Mount the game-board web component once the loading screen is gone
  useEffect(() => {
    if (loading || !boardContainerRef.current || boardElementRef.current) return;

    const board = document.createElement("game-board");
    boardElementRef.current = board;
    boardContainerRef.current.appendChild(board);

    boardContainerRef.current.addEventListener("board-roll", async (e) => {
      const { held } = e.detail;
      try {
        const res = await fetch(`${API}/matches/${id}/roll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, held }),
        });
        const data = await res.json();
        if (res.ok) setMatch(data);
      } catch {
        // ignore network errors
      }
    });

    boardContainerRef.current.addEventListener("board-end-turn", async () => {
      try {
        const res = await fetch(`${API}/matches/${id}/end-turn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        });
        const data = await res.json();
        if (res.ok) setMatch(data);
      } catch {
        // ignore network errors
      }
    });
  }, [loading]);

  // Push updated match state into the web component
  useEffect(() => {
    const board = boardElementRef.current;
    if (!board || match?.status !== "active" || match?.roundPending) return;

    const currentTurnId = match.currentTurn?._id ?? match.currentTurn;
    const isMyTurn = Boolean(currentTurnId) && String(currentTurnId) === String(currentUserId);
    const myPlayer = match.players.find(
      (p) => String(p.userId?._id ?? p.userId) === String(currentUserId)
    );

    board.setAttribute("dice", JSON.stringify(myPlayer?.dice?.length ? myPlayer.dice : [1, 1, 1, 1, 1]));
    board.setAttribute("held", JSON.stringify(myPlayer?.held?.length ? myPlayer.held : [false, false, false, false, false]));
    board.setAttribute("rolls-left", String(myPlayer?.rollsLeft ?? 3));
    board.setAttribute("my-turn", isMyTurn ? "true" : "false");
  }, [match]);

  async function handleStartNextRound() {
    try {
      const res = await fetch(`${API}/matches/${id}/next-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });
      const data = await res.json();
      if (res.ok) setMatch(data);
    } catch {
      // ignore network errors
    }
  }

  if (loading) return <main><p>Loading match...</p></main>;
  if (error) return <main><p>{error}</p><Link to="/lobby">Back to lobby</Link></main>;

  const playerSlots = Array.from({ length: match.maxPlayers }, (_, i) => match.players[i] ?? null);
  const winner = match.players.find(
    (p) => String(p.userId?._id ?? p.userId) === String(match.winner)
  );
  const roundWinner = match.players.find(
    (p) => String(p.userId?._id ?? p.userId) === String(match.lastRoundWinnerId)
  );

  return (
    <main>
      <h1>Game</h1>
      <p>{formatVariant(match.variant)}</p>
      <p>Buy-in: {match.buyIn} points</p>

      {(match.status === "active" || match.roundPending) && (
        <p>Round {match.currentRound ?? 1} of {match.variant.rounds}</p>
      )}

      <div>
        {playerSlots.map((player, i) => (
          <div key={i}>
            <span>{player?.userId?.username ?? (i === 0 ? "Host" : "Waiting…")}</span>
            {player?.userId?.elo && <span> — Elo: {player.userId.elo}</span>}
            {player && <span> — Wins: {player.roundWins ?? 0}</span>}
          </div>
        ))}
      </div>

      {match.status === "waiting" && (
        <p>Waiting for players ({match.players.length}/{match.maxPlayers}) — refreshes every 15s</p>
      )}

      <div ref={boardContainerRef} style={{ display: match.status === "active" && !match.roundPending ? "block" : "none" }} />

      {match.roundPending && (
        <div>
          <h2>Round {match.currentRound} results</h2>
          {match.players.map((player) => (
            <div key={player.userId._id ?? player.userId}>
              <strong>{player.userId.username}</strong>
              <span> — {player.dice.map((d) => FACE[d]).join(" ")} — {getHandName(player.dice, match.variant.straightsAllowed)}</span>
            </div>
          ))}
          <p>
            {roundWinner
              ? `${roundWinner.userId.username} wins this round!`
              : "Tie — no round winner."}
          </p>
          <button onClick={handleStartNextRound}>Start Next Round</button>
        </div>
      )}

      {match.status === "finished" && (
        <div>
          <p>Game over!</p>
          {winner && <p>{winner.userId.username} wins the match!</p>}
          <Link to="/lobby">Back to lobby</Link>
        </div>
      )}
    </main>
  );
}

export default GamePage;
