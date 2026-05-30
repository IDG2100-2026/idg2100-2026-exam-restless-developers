import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:6767/api/v1";

export default function TopGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API}/matches?status=active`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not fetch active games");

        setGames(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        setError(err.message || "Could not fetch active games");
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  function getPlayersLabel(g) {
    if (!g || !g.players || g.players.length === 0) return "Table";
    const names = g.players
      .map((p) => {
        if (p.userId && p.userId.username) return p.userId.username;
        if (p.nickname) return p.nickname;
        return "Anon";
      })
      .filter(Boolean);
    if (names.length === 0) return "Table";
    return names.join(", ");
  }

  let content;
  if (loading) {
    content = <p>Loading top games…</p>;
  } else if (error) {
    content = <p className="error">{error}</p>;
  } else if (games.length === 0) {
    content = <p>No active top games right now.</p>;
  } else {
    content = (
      <ul>
        {games.map((g) => (
          <li key={g._id}>
            <strong>{getPlayersLabel(g)}</strong>
            <div>
              {g.variant?.rounds}R · {g.variant?.timeControl}s · {g.players.length}/{g.maxPlayers}
            </div>
            <div>
              <Link to={`/game/${g._id}`}>Spectate</Link>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="top-games">
      <h2>Top games</h2>
      {content}
    </section>
  );
}
