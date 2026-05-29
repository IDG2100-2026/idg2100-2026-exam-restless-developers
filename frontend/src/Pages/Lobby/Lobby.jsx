// Worked on by: marte kaland

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  return (
    <main>
      <h1>Lobby</h1>
      <Link to="/create-game">Create new game</Link>

      {matches.length === 0 ? (
        <p>No open games right now.</p>
      ) : (
        <ul>
          {matches.map((match) => {
            const host = match.players[0]?.userId?.username ?? "Unknown";
            return (
              <li key={match._id}>
                <strong>{host}</strong>'s game —{" "}
                {formatVariant(match.variant)} — Buy-in: {match.buyIn} —{" "}
                {match.players.length}/{match.maxPlayers} players{" "}
                <Link to={`/game/${match._id}`}>Join</Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default Lobby;
