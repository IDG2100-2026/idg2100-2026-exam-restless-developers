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
        const response = await fetch(
          "http://localhost:6767/api/v1/tournaments",
        );

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

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(function () {
      setNow(Date.now());
    }, 1000);
    return function () {
      clearInterval(t);
    };
  }, []);

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

      {(() => {
        let listContent;
        if (tournaments.length === 0) {
          listContent = (
            <p className="empty-tournaments">No upcoming tournaments yet.</p>
          );
        } else {
          listContent = (
            <div className="tournament-overview-list">
              {tournaments.map((tournament) => {
                let dateStr = "";
                if (tournament.startDate) {
                  dateStr = new Date(tournament.startDate).toLocaleString();
                }

                let varStr = "—";
                if (tournament.variant) {
                  varStr = "Best of " + (tournament.variant.rounds || "?");
                  if (tournament.variant.timeControl) {
                    varStr =
                      varStr + " · " + tournament.variant.timeControl + "s";
                  }
                }

                let diff = NaN;
                if (tournament.startDate) {
                  diff = new Date(tournament.startDate).getTime() - now;
                }

                let cd = "";
                if (!isNaN(diff)) {
                  if (diff <= 0) {
                    cd = "Started";
                  } else {
                    cd = Math.floor(diff / 1000 / 3600) + "h";
                  }
                }

                return (
                  <div
                    className="tournament-overview-item"
                    key={tournament._id}
                  >
                    <div className="tournament-overview-main">
                      <Link to={`/tournaments/${tournament._id}`}>
                        <h3>{tournament.title}</h3>
                      </Link>
                      <p className="to-date">{dateStr}</p>
                      <p className="to-variant">{varStr}</p>
                      {tournament.buyIn != null && (
                        <p className="to-buyin">
                          Buy-in: {tournament.buyIn} pts
                        </p>
                      )}
                      <p className="to-countdown">{cd}</p>
                    </div>

                    <div className="overview-tournament-meta">
                      <strong>
                        {tournament.players?.length || 0}/
                        {tournament.maxPlayers}
                      </strong>
                      <span>players</span>
                    </div>

                    <div className="tournament-actions">
                      <Link
                        to={`/tournaments/${tournament._id}`}
                        className="btn-join"
                      >
                        Open
                      </Link>
                      <Link to={`/tournaments/${tournament._id}`}>
                        Spectate
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        return listContent;
      })()}
    </section>
  );
}

export default TournamentOverview;
