import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TopGames.css";

function dedupeById(items) {
  const seen = new Set();
  return items.filter((it) => {
    if (seen.has(it._id)) return false;
    seen.add(it._id);
    return true;
  });
}

function TopGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const limit = 5;

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // Try active games first
        const activeRes = await fetch("http://localhost:6767/api/v1/matches?status=active");
        const active = activeRes.ok ? await activeRes.json() : [];

        if (!mounted) return;

        if (active.length >= limit) {
          setGames(active.slice(0, limit));
          setLoading(false);
          return;
        }

        // Fallback: fetch recent matches and merge
        const recentRes = await fetch("http://localhost:6767/api/v1/matches");
        const recent = recentRes.ok ? await recentRes.json() : [];

        const merged = dedupeById([...active, ...recent]).slice(0, limit);
        setGames(merged);
      } catch (err) {
        console.error("TopGames load error", err);
        setGames([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return (
    <section className="top-games">
      <div className="top-games-header">
        <h3>Top games</h3>
        <Link to="/matches" className="view-all-games">
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
              <Link to={`/matches/${g._id}`}>
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
