import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TopGames.css";

function dedupeById(items) {
  const out = [];
  const ids = {};
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it || !it._id) continue;
    if (ids[it._id]) continue;
    ids[it._id] = true;
    out.push(it);
  }
  return out;
}

function TopGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const limit = 5;

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const a = await fetch("http://localhost:6767/api/v1/matches?status=active");
        const active = a.ok ? await a.json() : [];

        if (!alive) return;

        if (active && active.length >= limit) {
          setGames(active.slice(0, limit));
          setLoading(false);
          return;
        }

        const r = await fetch("http://localhost:6767/api/v1/matches");
        const recent = r.ok ? await r.json() : [];

        const merged = dedupeById(active.concat(recent)).slice(0, limit);
        setGames(merged);
      } catch (err) {
        console.log("TopGames error", err);
        setGames([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => (alive = false);
  }, []);

  return (
    <section className="top-games">
      <div className="top-games-header">
        <h3>Top games</h3>
        <Link to="/lobby" className="view-all-games">
          View all
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : games.length === 0 ? (
        <p>No active top games yet.</p>
      ) : (
        <ul className="top-games-list">
          {games.map((g) => (
            <li key={g._id} className="top-games-item">
              <Link to={`/game/${g._id}`}>
                <strong>{g.name || `Match ${g._id.slice(-4)}`}</strong>
                <div className="meta">{g.players?.length || 0} players</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TopGames;
