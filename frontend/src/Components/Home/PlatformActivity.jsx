import { useEffect, useState } from "react";

const API = "http://localhost:6767/api/v1";

export default function PlatformActivity() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API}/admin/dashboard`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Could not fetch dashboard");
        setData(json);
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
          <strong>{data.games.activePlayers}</strong>
          <span>Active players</span>
        </div>

        <div className="pa-card">
          <strong>{data.games.gamesPlayedLastWeek}</strong>
          <span>Games played (week)</span>
        </div>

        <div className="pa-card">
          <strong>{data.games.availableGames}</strong>
          <span>Available games now</span>
        </div>

        <div className="pa-card">
          <strong>{data.users.newProfilesLastWeek}</strong>
          <span>New profiles (week)</span>
        </div>
      </div>
    </aside>
  );
}