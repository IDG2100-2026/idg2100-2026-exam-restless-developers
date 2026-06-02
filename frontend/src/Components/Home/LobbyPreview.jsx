import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LobbyPreview.css";

const API = "http://localhost:6767/api/v1";

function formatVariant(variant) {
  if (!variant) return "-";
  const straights = variant.straightsAllowed ? "Straights" : "No straights";
  return `Best of ${variant.rounds} · ${variant.timeControl}s · ${straights}`;
}

function LobbyPreview() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function fetchMatches() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/matches?status=waiting`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load lobby");

      const limit = Number(localStorage.getItem("lobbyLimit")) || 5;
      setMatches(Array.isArray(data) ? data.slice(0, limit) : []);
    } catch (err) {
      setError(err.message || "Could not load lobby");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatches();

    function handleLobbyLimit() {
      fetchMatches();
    }

    window.addEventListener("lobbyLimitChanged", handleLobbyLimit);
    return () => window.removeEventListener("lobbyLimitChanged", handleLobbyLimit);
  }, []);

  async function handleJoin(matchId) {
    const currentUserId = localStorage.getItem("currentUserId");
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API}/matches/${matchId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not join match");

      navigate(`/game/${matchId}`);
    } catch (err) {
      setError(err.message || "Could not join match");
    }
  }

  return (
    <aside className="lobby-preview">
      <div className="lobby-preview-header">
        <h2>Available games</h2>
        <Link to="/lobby" className="lobby-preview-all">View full lobby</Link>
      </div>

      {loading ? (
        <p>Loading games…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : matches.length === 0 ? (
        <p>No open games right now.</p>
      ) : (
        <ul className="lobby-preview-list">
          {matches.map((m) => (
            <li key={m._id} className="lobby-preview-item">
              <div className="lp-main">
                <strong>{m.players?.[0]?.userId?.username || "Host"}</strong>
                <div className="lp-variant">{formatVariant(m.variant)}</div>
                <div className="lp-meta">{m.players.length}/{m.maxPlayers} · Buy-in: {m.buyIn}</div>
              </div>

              <div className="lp-actions">
                <button onClick={() => handleJoin(m._id)} className="lp-join">Join</button>
                <Link to={`/game/${m._id}`} className="lp-watch">Open</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default LobbyPreview;