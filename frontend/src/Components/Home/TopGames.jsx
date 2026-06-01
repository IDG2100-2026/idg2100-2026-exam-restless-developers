import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:6767/api/v1";

export default function TopGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function dedupeById(list) {
    const seen = new Set();
    return list.filter((game) => {
      if (!game?._id || seen.has(game._id)) return false;
      seen.add(game._id);
      return true;
    });
  }

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setError("");

      try {
        const activeRes = await fetch(`${API}/matches?status=active`);
        const activeData = await activeRes.json();
        if (!activeRes.ok) throw new Error(activeData.message || "Could not fetch active games");

        const activeGames = Array.isArray(activeData) ? activeData.slice(0, 5) : [];

        if (activeGames.length >= 5) {
          setGames(activeGames);
          return;
        }

        const recentRes = await fetch(`${API}/matches`);
        const recentData = await recentRes.json();
        if (!recentRes.ok) throw new Error(recentData.message || "Could not fetch recent games");

        const recentGames = Array.isArray(recentData) ? recentData : [];
        const mergedGames = dedupeById([...activeGames, ...recentGames]).slice(0, 5);

        setGames(mergedGames);
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
