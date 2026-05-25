// Made by: marte kaland
// Contains code from Marte's oblig3 (formatVariant, CommentsList, optimistic comment update)
// Contains code from Joakim's oblig3 (playerLabel, setInterval polling with useRef)

import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

function formatVariant(variant) {
  if (!variant) return "—";
  const straights = variant.straightsAllowed ? "Straights" : "No straights";
  return `Best of ${variant.rounds} · ${variant.timeControl}s · ${straights}`;
}

function playerLabel(player, index) {
  if (player && player.isAnonymous) {
    return player.nickname || `Guest ${index + 1}`;
  }
  if (player && player.userId && player.userId.username) {
    return player.userId.username;
  }
  return `Player ${index + 1}`;
}

function CommentsList({ comments }) {
  if (!comments?.length) return <p>No comments yet.</p>;
  return (
    <ul>
      {comments.map((c, index) => (
        <li key={c._id || index}>
          <strong>{c.author?.username ?? "Anonymous"}</strong>
          <span> — {new Date(c.createdAt).toLocaleString()}</span>
          <p>{c.text}</p>
        </li>
      ))}
    </ul>
  );
}

function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");

  const intervalRef = useRef(null);

  const currentUserId = localStorage.getItem("currentUserId");

  async function fetchMatch() {
    try {
      const res = await fetch(`http://localhost:6767/api/v1/matches/${id}`);
      if (!res.ok) throw new Error("Could not load game");
      const data = await res.json();
      setMatch(data);
      return data;
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    async function init() {
      await fetchMatch();
      setLoading(false);
    }

    init();

    intervalRef.current = setInterval(() => {
      setMatch((prev) => {
        if (prev && !prev.winner) fetchMatch();
        return prev;
      });
    }, 15000);

    return () => clearInterval(intervalRef.current);
  }, [id]);

  async function handleJoin() {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    const res = await fetch(`http://localhost:6767/api/v1/matches/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Could not join game");
      return;
    }

    setMatch(data);
    setMessage("You joined the game!");
  }

  async function handleLeave() {
    const res = await fetch(`http://localhost:6767/api/v1/matches/${id}/leave`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Could not leave game");
      return;
    }

    setMatch(data);
    setMessage("You left the game.");
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUserId) {
      setMessage("You must be logged in to comment.");
      return;
    }

    const res = await fetch(`http://localhost:6767/api/v1/matches/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, text: commentText }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.message || "Could not post comment");
      return;
    }

    setMatch((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), data.comment],
    }));
    setCommentText("");
  }

  if (loading) return <p>Loading game...</p>;
  if (error) return <p>{error}</p>;
  if (!match) return <p>Game not found.</p>;

  const isJoined = match.players?.some(
    (p) => (p.userId?._id || p.userId)?.toString() === currentUserId
  );
  const isWaiting = !match.winner && match.players?.length < (match.maxPlayers || 2);

  return (
    <main>
      <Link to="/lobby">← Back to lobby</Link>

      <section>
        <h1>Game</h1>
        <p>{formatVariant(match.variant)}</p>
        <p>Players: {match.players?.length} / {match.maxPlayers || 2}</p>

        {isWaiting && !isJoined && (
          <button onClick={handleJoin}>Join game</button>
        )}
        {isWaiting && isJoined && (
          <button onClick={handleLeave}>Leave game</button>
        )}
        {match.winner && <p>Winner: {match.winner.username || "Unknown"}</p>}
        {message && <p>{message}</p>}
      </section>

      <div className="game-layout">
        <div>
          <h2>Players</h2>
          <ul>
            {match.players?.map((player, index) => (
              <li key={player.userId?._id || index}>
                {playerLabel(player, index)} — Elo: {player.userId?.elo ?? "N/A"}
              </li>
            ))}
          </ul>

          <h2>Game board</h2>
          <div>
            <p>Game board goes here (Web Components).</p>
            {isWaiting && <p>Waiting for players before the game starts.</p>}
          </div>
        </div>

        <aside>
          <h2>Comments</h2>
          <CommentsList comments={match.comments} />

          <form onSubmit={handleComment}>
            <label htmlFor="comment">Leave a comment</label>
            <textarea
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
            />
            <button type="submit">Post comment</button>
          </form>
        </aside>
      </div>
    </main>
  );
}

export default GamePage;
