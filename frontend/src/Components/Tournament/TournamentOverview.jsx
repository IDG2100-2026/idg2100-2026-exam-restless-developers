import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TournamentOverview.css";

function TournamentOverview() {
  const [tournaments, setTournaments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API = "http://localhost:6767/api/v1";

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch("http://localhost:6767/api/v1/tournaments");

        if (!response.ok) {
          throw new Error("Could not fetch tournaments");
        }

        const data = await response.json();

        const upcomingTournaments = data
          .filter((tournament) => tournament.status === "upcoming")
          .slice(0, 5);

        setTournaments(upcomingTournaments);
      } catch (error) {
        setError(error.message);
      }
    }

    fetchTournaments();
  }, []);

  // simple ticking clock for countdowns
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatVariant(variant) {
    if (!variant) return "—";
    const straights = variant.straightsAllowed ? "Straights" : "No straights";
    return `Best of ${variant.rounds} · ${variant.timeControl}s · ${straights}`;
  }

  function formatCountdown(startDate) {
    const diff = new Date(startDate).getTime() - now;
    if (isNaN(diff)) return "";
    if (diff <= 0) return "Started";
    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (days > 0) return `${days}d ${String(hours).padStart(2, "0")}h`;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return (
    <section className="tournament-overview">
      <div className="tournament-overview-header">
        <div>
          <span className="tournament-overview-kicker">Tournaments</span>
          <h2>Upcoming tournaments</h2>
        </div>

        <Link to="/tournaments" className="view-all-tournaments">
          View all
        </Link>
      </div>

      {error && <p className="tournament-overview-error">{error}</p>}

      {tournaments.length === 0 ? (
        <p className="empty-tournaments">No upcoming tournaments yet.</p>
      ) : (
        <div className="tournament-overview-list">
          {tournaments.map((tournament) => (
            <div className="tournament-overview-item" key={tournament._id}>
              <div className="tournament-overview-main">
                <Link to={`/tournaments/${tournament._id}`}>
                  <h3>{tournament.title}</h3>
                </Link>
                <p className="to-date">{formatDate(tournament.startDate)}</p>
                <p className="to-variant">{formatVariant(tournament.variant)}</p>
                {tournament.buyIn != null && (
                  <p className="to-buyin">Buy-in: {tournament.buyIn} pts</p>
                )}
                <p className="to-countdown">{formatCountdown(tournament.startDate)}</p>
              </div>

              <div className="overview-tournament-meta">
                <strong>
                  {tournament.players?.length || 0}/{tournament.maxPlayers}
                </strong>
                <span>players</span>
              </div>

              <div className="tournament-actions">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentUserId = localStorage.getItem("currentUserId");
                    if (!currentUserId) {
                      navigate("/login");
                      return;
                    }

                    try {
                      const res = await fetch(`${API}/tournaments/${tournament._id}/join`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: currentUserId }),
                      });

                      const json = await res.json();
                      if (!res.ok) throw new Error(json.message || "Could not join tournament");

                      navigate(`/tournaments/${tournament._id}`);
                    } catch (err) {
                      setError(err.message || "Could not join tournament");
                    }
                  }}
                >
                  Join
                </button>

                <Link to={`/tournaments/${tournament._id}`}>Spectate</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TournamentOverview;