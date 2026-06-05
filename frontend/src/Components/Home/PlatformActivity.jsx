import { useEffect, useState } from "react";
import "./PlatformActivity.css";

const API = "http://localhost:6767/api/v1";

export default function PlatformActivity() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError("");

      try {
        const p = await fetch(`${API}/platform`);
        if (p.ok) {
          const pj = await p.json();
          setInfo(pj);
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (token) {
          try {
            const r = await fetch(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
            if (r.ok) {
              const j = await r.json();
              setInfo(j);
              setLoading(false);
              return;
            }
          } catch (e) {
          }
        }

        const a = await fetch(`${API}/matches?status=active`);
        const w = await fetch(`${API}/matches?status=waiting`);
        const f = await fetch(`${API}/matches?status=finished`);
        const u = await fetch(`${API}/users`);

        const active = a.ok ? await a.json() : [];
        const waiting = w.ok ? await w.json() : [];
        const finished = f.ok ? await f.json() : [];
        const users = u.ok ? await u.json() : [];

        const activePlayers = Array.isArray(active) ? active.reduce(function (s, m) { return s + (m.players ? m.players.length : 0); }, 0) : 0;

        const out = {
          games: {
            activePlayers: activePlayers,
            gamesPlayedLastWeek: Array.isArray(finished) ? finished.length : 0,
            availableGames: Array.isArray(waiting) ? waiting.length : 0,
          },
          users: {
            newProfilesLastWeek: 0,
            totalUsers: Array.isArray(users) ? users.length : 0,
          },
        };

        setInfo(out);
      } catch (err) {
        setError(err.message || "Could not fetch dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <aside className="platform-activity">Loading activity…</aside>;
  if (error) return <aside className="platform-activity error">{error}</aside>;

  return (
    <aside className="platform-activity">
      <h2>Platform activity</h2>
      <div className="pa-grid">
        <div className="pa-card">
          <strong>{info && info.games ? info.games.activePlayers : 0}</strong>
          <span>Active players</span>
        </div>

        <div className="pa-card">
          <strong>{info && info.games ? info.games.gamesPlayedLastWeek : 0}</strong>
          <span>Games played (week)</span>
        </div>

        <div className="pa-card">
          <strong>{info && info.games ? info.games.availableGames : 0}</strong>
          <span>Available games now</span>
        </div>

        <div className="pa-card">
          <strong>{info && info.users ? info.users.newProfilesLastWeek : 0}</strong>
          <span>New profiles (week)</span>
        </div>
      </div>
    </aside>
  );
}