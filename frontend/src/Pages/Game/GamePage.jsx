// Worked on by: marte kaland
// Contains code from marte kaland's oblig3 (formatVariant, polling pattern, joinedRef, player card layout)

import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { io as socketIO } from "socket.io-client";
import "../../WebComponents/GameBoard.js";
import Comments from "../../Components/Tournament/Comments";
import "./GamePage.css";

const API = "http://localhost:6767/api/v1";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function playSound(frequency, duration = 0.1) {
  if (localStorage.getItem("soundEnabled") !== "true") return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

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

function HiddenDie({ held }) {
  return (
    <div className={`die die--hidden${held ? " die--held" : ""}`}>?</div>
  );
}

function RevealedDie({ value }) {
  const isRed = [2, 5, 6].includes(value);
  return (
    <div className={`die die--revealed${isRed ? " die--red" : ""}`}>
      {FACE[value] || "?"}
    </div>
  );
}

function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("currentUserId");

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const joinedRef = useRef(false);
  const boardContainerRef = useRef(null);
  const boardElementRef = useRef(null);
  const timerRef = useRef(null);

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
          const joinRes = await fetch(`${API}/matches/${id}/join`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ userId: currentUserId }),
          });
          if (!joinRes.ok) {
            const joinData = await joinRes.json();
            setError(joinData.message || "Could not join match");
            return;
          }
          await fetchMatch();
        } catch (err) {
          console.error(err);
        }
      }
    }

    init();

    const socket = socketIO("http://localhost:6767");
    socket.emit("join:match", id);
    socket.on("match:update", (updatedMatch) => {
      setMatch(updatedMatch);
      setLoading(false);
    });

    socket.on("new-match-comment", ({ matchId, comment }) => {
      if (matchId !== id) return;
      setComments(prev => {
        if (prev.some(c => c._id === comment._id)) return prev;
        return [comment, ...prev];
      });
    });

    return () => socket.disconnect();
  }, [id]);

  useEffect(() => {
    fetch(`${API}/comments/match/${id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setComments(data); })
      .catch(() => {});
  }, [id]);

  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      await fetch(`${API}/comments/match/${id}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content: commentInput }),
      });
      setCommentInput("");
    } catch (err) {
      console.error(err);
    }
  }



  useEffect(() => {
  const intervalId = setInterval(() => {
    fetchMatch();
  }, 1000);

  return () => clearInterval(intervalId);
}, [id]);


  // Mount the game-board web component once the loading screen is gone
  useEffect(() => {
  if (loading || !boardContainerRef.current) return;

  boardContainerRef.current.innerHTML = "";

  const board = document.createElement("game-board");
  board.setAttribute("board-color", localStorage.getItem("boardColor") || "#facc15");
  boardElementRef.current = board;
  boardContainerRef.current.appendChild(board);

  const handleRoll = async (e) => {
    const { held } = e.detail;

    try {
      const res = await fetch(`${API}/matches/${id}/roll`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId: currentUserId, held }),
      });

      const data = await res.json();
      if (res.ok) {
        setMatch(data);
        playSound(440, 0.08);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndTurn = async () => {
    try {
      const res = await fetch(`${API}/matches/${id}/end-turn`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMatch(data);
        playSound(300, 0.3);
      }
    } catch (err) {
      console.error(err);
    }
  };

  boardContainerRef.current.addEventListener("board-roll", handleRoll);
  boardContainerRef.current.addEventListener("board-end-turn", handleEndTurn);

  return () => {
    if (boardContainerRef.current) {
      boardContainerRef.current.removeEventListener("board-roll", handleRoll);
      boardContainerRef.current.removeEventListener("board-end-turn", handleEndTurn);
      boardContainerRef.current.innerHTML = "";
    }

    boardElementRef.current = null;
  };
}, [loading, id, currentUserId]);


  useEffect(() => {
    function handleColorChange() {
      if (!boardElementRef.current) return;
      boardElementRef.current.setAttribute("board-color", localStorage.getItem("boardColor") || "#facc15");
    }
    window.addEventListener("boardColorChanged", handleColorChange);
    return () => window.removeEventListener("boardColorChanged", handleColorChange);
  }, []);

  // Push updated match state into the web component
  useEffect(() => {
    const board = boardElementRef.current;
    if (!board || match?.status !== "active" || match?.roundPending) return;

    const currentTurnId = match.currentTurn?._id ?? match.currentTurn;
    const isMyTurn = Boolean(currentTurnId) && String(currentTurnId) === String(currentUserId);
    const myPlayer = match.players.find(
      (p) => String(p.userId?._id ?? p.userId) === String(currentUserId)
    );

    board.setAttribute("board-color", localStorage.getItem("boardColor") || "#facc15");
    board.setAttribute("dice", JSON.stringify(myPlayer?.dice?.length ? myPlayer.dice : [1, 1, 1, 1, 1]));
    board.setAttribute("held", JSON.stringify(myPlayer?.held?.length ? myPlayer.held : [false, false, false, false, false]));
    board.setAttribute("rolls-left", String(myPlayer?.rollsLeft ?? 3));
    board.setAttribute("my-turn", isMyTurn ? "true" : "false");
  }, [match]);


  useEffect(() => {
    if (match?.status !== "finished") return;
    if (!match?.tournamentId) return;

    const tournamentId =
      typeof match.tournamentId === "object"
        ? match.tournamentId._id
        : match.tournamentId;

    if (!tournamentId) return;

    const timeout = setTimeout(() => {
      navigate(`/tournaments/${tournamentId}`);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [match?.status, match?.tournamentId, navigate]);

  useEffect(() => {
    if (match?.status === "finished") playSound(880, 0.5);
  }, [match?.status]);


  const currentTurnId = match ? String(match.currentTurn?._id ?? match.currentTurn ?? "") : "";

  useEffect(() => {
    if (!match || match.status !== "active" || match.bettingPhase || match.roundPending) {
      setTimeLeft(null);
      clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(match.variant.timeControl);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentTurnId, match?.status, match?.bettingPhase, match?.roundPending]);

  const [betAmount, setBetAmount] = useState(1);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  async function handleBet(action) {
    try {
      const res = await fetch(`${API}/matches/${id}/bet`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId: currentUserId, action, amount: betAmount }),
      });
      const data = await res.json();
      if (res.ok) setMatch(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStartNextRound() {
    try {
      const res = await fetch(`${API}/matches/${id}/next-round`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ userId: currentUserId }),
      });
      const data = await res.json();
      if (res.ok) setMatch(data);
    } catch (err) {
      console.error(err);
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
    <main className="game-page">
      <h1>Game</h1>
      <p>{formatVariant(match.variant)}</p>
      <p>Buy-in: {match.buyIn} points</p>

      {(match.status === "active" || match.bettingPhase || match.roundPending) && (
        <p>Round {match.currentRound ?? 1} of {match.variant.rounds}</p>
      )}

      {match.status === "active" && !match.bettingPhase && !match.roundPending && timeLeft !== null && (
        <p>Time left: {timeLeft}s</p>
      )}

      <div className="game-section">
        <h2>Players</h2>
        <ul className="player-list">
          {playerSlots.map((player, i) => (
            <li key={i}>
              <strong>{player?.userId?.username ?? (i === 0 ? "Host" : "Waiting…")}</strong>
              {player?.userId?.elo && <span> — Elo: {player.userId.elo}</span>}
              {player && <span> — Wins: {player.roundWins ?? 0}</span>}
            </li>
          ))}
        </ul>
      </div>

      {match.status === "waiting" && (
        <div>
          <p>Waiting for players ({match.players.length}/{match.maxPlayers})</p>
          {match.players.some(p => String(p.userId?._id ?? p.userId) === String(currentUserId)) && (
            <button onClick={async () => {
              try {
                const res = await fetch(`${API}/matches/${id}/leave`, {
                  method: "POST",
                  headers: authHeaders(),
                  body: JSON.stringify({ userId: currentUserId }),
                });
                if (res.ok) navigate("/lobby");
              } catch { /* ignore */ }
            }}>
              Leave game
            </button>
          )}
        </div>
      )}

      {(match.status === "active" || match.bettingPhase || match.roundPending) && (
        match.players
          .filter(p => String(p.userId?._id ?? p.userId) !== String(currentUserId))
          .map(opponent => {
            const oppId = String(opponent.userId?._id ?? opponent.userId);
            const isTheirTurn = !match.roundPending && !match.bettingPhase &&
              String(match.currentTurn?._id ?? match.currentTurn) === oppId;
            return (
              <div key={oppId}>
                <p>
                  <strong>{opponent.userId?.username}</strong>
                  {isTheirTurn ? " — taking their turn..." : ""}
                  {" — Round wins: "}{opponent.roundWins ?? 0}
                  {match.roundPending && (
                    <span> — {getHandName(opponent.dice, match.variant.straightsAllowed)}</span>
                  )}
                </p>
                <div className="dice-row">
                  {match.roundPending
                    ? opponent.dice.map((d, i) => <RevealedDie key={i} value={d} />)
                    : [0, 1, 2, 3, 4].map(i => <HiddenDie key={i} held={opponent.held?.[i] ?? false} />)
                  }
                </div>
              </div>
            );
          })
      )}

      <div ref={boardContainerRef} className={match.status === "active" && !match.bettingPhase && !match.roundPending ? "" : "board-container--hidden"} />

      {match.bettingPhase && (() => {
        const bettingTurnId = String(match.bettingTurn?._id ?? match.bettingTurn ?? "");
        const isMyBettingTurn = bettingTurnId === String(currentUserId);
        const myPlayer = match.players.find(p => String(p.userId?._id ?? p.userId) === String(currentUserId));
        const canCheck = isMyBettingTurn && (myPlayer?.currentBet ?? 0) >= match.currentHighBet;
        const canCall = isMyBettingTurn && (myPlayer?.currentBet ?? 0) < match.currentHighBet;
        const callAmount = Math.min(match.currentHighBet - (myPlayer?.currentBet ?? 0), myPlayer?.stack ?? 0);

        return (
          <div className="game-section">
            <h2>Betting</h2>
            <p>Pot: {match.pot} points</p>

            <div>
              {match.players.map(p => {
                const pId = String(p.userId?._id ?? p.userId);
                const isTurn = pId === bettingTurnId;
                return (
                  <div key={pId}>
                    <strong>{p.userId?.username}</strong>
                    {p.hasFolded ? " — Folded" : ` — Stack: ${p.stack ?? 0}  Bet: ${p.currentBet ?? 0}`}
                    {isTurn && !p.hasFolded && " ◀"}
                  </div>
                );
              })}
            </div>

            {isMyBettingTurn && !myPlayer?.hasFolded && (
              <div>
                {canCheck && (
                  <button className="game-btn" onClick={() => handleBet("check")}>Check</button>
                )}
                {canCall && (
                  <button className="game-btn" onClick={() => handleBet("call")}>Call {callAmount}</button>
                )}
                <button className="game-btn game-btn--danger" onClick={() => handleBet("fold")}>Fold</button>
                <div className="bet-controls">
                  <button
                    className="game-btn"
                    onClick={() => setBetAmount(a => Math.max(1, a - 1))}
                    disabled={betAmount <= 1}
                  >-</button>
                  <input
                    type="number"
                    min={1}
                    max={myPlayer?.stack ?? 0}
                    value={betAmount}
                    onFocus={e => e.target.select()}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 0) setBetAmount(val);
                    }}
                  />
                  <button
                    className="game-btn"
                    onClick={() => setBetAmount(a => Math.min(myPlayer?.stack ?? 0, a + 1))}
                    disabled={betAmount >= (myPlayer?.stack ?? 0)}
                  >+</button>
                  <button
                    className="game-btn"
                    onClick={() => handleBet("bet")}
                    disabled={betAmount <= 0 || betAmount > (myPlayer?.stack ?? 0)}
                  >
                    {match.currentHighBet > 0 ? "Raise" : "Bet"}
                  </button>
                </div>
              </div>
            )}

            {!isMyBettingTurn && (
              <p>
                Waiting for{" "}
                {match.players.find(p => String(p.userId?._id ?? p.userId) === bettingTurnId)?.userId?.username ?? "opponent"}{" "}
                to act...
              </p>
            )}
          </div>
        );
      })()}

      {match.roundPending && (
        <div className="game-section">
          <h2>Round {match.currentRound} results</h2>
          <p>
            {roundWinner
              ? `${roundWinner.userId.username} wins this round!`
              : "Tie — no round winner."}
          </p>
          <button className="game-btn" onClick={handleStartNextRound}>Start Next Round</button>
        </div>
      )}

      {match.status === "finished" && (
        <div className="game-section">
          <h2>Game over!</h2>
          {winner && <p>{winner.userId.username} wins the match!</p>}
          <Link to="/lobby" className="game-btn">Back to lobby</Link>
        </div>
      )}

      <Comments
        comments={comments}
        commentInput={commentInput}
        setCommentInput={setCommentInput}
        handleSubmitComment={handleSubmitComment}
      />
    </main>
  );
}

export default GamePage;