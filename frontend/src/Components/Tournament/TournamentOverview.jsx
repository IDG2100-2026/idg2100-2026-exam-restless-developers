import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TournamentOverview.css";

function TournamentOverview() {
  const [tournaments, setTournaments] = useState([]);
  const [error, setError] = useState("");

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

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            <Link
              to={`/tournaments/${tournament._id}`}
              className="tournament-overview-item"
              key={tournament._id}
            >
              <div className="tournament-overview-main">
                <h3>{tournament.title}</h3>
                <p>{formatDate(tournament.startDate)}</p>
              </div>

              <div className="overview-tournament-meta">
                <strong>
                  {tournament.players?.length || 0}/{tournament.maxPlayers}
                </strong>
                <span>players</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default TournamentOverview;