// Worked on by: marte kaland

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Lobby.css";

const API = "http://localhost:6767/api/v1";

function formatVariant(variant) {
  if (!variant) return "—";
  const straights = variant.straightsAllowed ? "Straights" : "No straights";
  return `Best of ${variant.rounds} · ${variant.timeControl}s · ${straights}`;
}

function Lobby() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStraights, setFilterStraights] = useState("all");
  const [filterRounds, setFilterRounds] = useState("all");
  const [filterTime, setFilterTime] = useState("all");

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`${API}/matches?status=waiting`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Could not load lobby");
          return;
        }
        setMatches(data);
      } catch {
        setError("Could not load lobby");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  if (loading) return <main><p>Loading lobby...</p></main>;
  if (error) return <main><p>{error}</p></main>;

  const filtered = matches.filter((m) => {
    if (filterStraights !== "all" && String(m.variant?.straightsAllowed) !== filterStraights) return false;
    if (filterRounds !== "all" && String(m.variant?.rounds) !== filterRounds) return false;
    if (filterTime !== "all" && String(m.variant?.timeControl) !== filterTime) return false;
    return true;
  });

  return (
    <main className="lobby">
      <div className="lobby-actions">
        <h1>Lobby</h1>
        <Link to="/create-game" className="lobby-join-btn">Create new game</Link>
      </div>

      <div className="lobby-filters">
        <label>
          Straights
          <select value={filterStraights} onChange={e => setFilterStraights(e.target.value)}>
            <option value="all">All</option>
            <option value="true">Allowed</option>
            <option value="false">Not allowed</option>
          </select>
        </label>
        <label>
          Rounds
          <select value={filterRounds} onChange={e => setFilterRounds(e.target.value)}>
            <option value="all">All</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="7">7</option>
          </select>
        </label>
        <label>
          Time
          <select value={filterTime} onChange={e => setFilterTime(e.target.value)}>
            <option value="all">All</option>
            <option value="10">10s</option>
            <option value="30">30s</option>
            <option value="90">90s</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="lobby-empty">No open games right now.</p>
      ) : (
        <ul className="lobby-list">
          {filtered.map((match) => {
            const host = match.players[0]?.userId?.username ?? "Unknown";
            return (
              <li key={match._id} className="lobby-item">
                <span className="lobby-item-info">
                  <strong>{host}</strong>'s game — {formatVariant(match.variant)} — Buy-in: {match.buyIn} — {match.players.length}/{match.maxPlayers} players
                </span>
                <Link to={`/game/${match._id}`} className="lobby-join-btn">Join</Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default Lobby;
