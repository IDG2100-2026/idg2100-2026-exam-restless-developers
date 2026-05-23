import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./TournamentPage.css";

function TournamentPage() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState("");
  const [joinMessage, setJoinMessage] = useState("");

  useEffect(() => {
    async function fetchTournament() {
      try {
        const response = await fetch(`http://localhost:6767/tournaments/${id}`);

        if (!response.ok) {
          throw new Error("Could not fetch tournament");
        }

        const data = await response.json();
        setTournament(data);
      } catch (error) {
        setError(error.message);
      }
    }

    fetchTournament();
  }, [id]);

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isCurrentUserJoined() {
    const currentUserId = localStorage.getItem("currentUserId");

    if (!currentUserId || !tournament?.players) {
      return false;
    }

    return tournament.players.some((player) => {
      if (typeof player === "string") {
        return player === currentUserId;
      }

      return player._id === currentUserId;
    });
  }

  async function handleJoinTournament() {
    try {
      setJoinMessage("");

      const currentUserId = localStorage.getItem("currentUserId");

      if (!currentUserId) {
        setJoinMessage("You must be logged in to join a tournament.");
        return;
      }

      const response = await fetch(
        `http://localhost:6767/tournaments/${id}/players`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUserId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not join tournament");
      }

      setTournament(data);
      setJoinMessage("You joined the tournament!");
    } catch (error) {
      setJoinMessage(error.message);
    }
  }

  if (error) {
    return <p className="tournament-page-error">{error}</p>;
  }

  if (!tournament) {
    return <p className="tournament-page-loading">Loading tournament...</p>;
  }

  const currentUserJoined = isCurrentUserJoined();

  return (
    <main className="single-tournament-page">
      <Link to="/tournaments" className="back-link">
        ← Back to tournaments
      </Link>

      <section className="single-tournament-hero">
        <div>
          <span className={`status-badge ${tournament.status}`}>
            {tournament.status}
          </span>

          <h1>{tournament.title}</h1>

          <p>{tournament.description}</p>
        </div>

        <div className="hero-actions">
          <p>{formatDate(tournament.startDate)}</p>

          {tournament.status === "upcoming" && !currentUserJoined && (
            <button
              className="primary-action-button"
              onClick={handleJoinTournament}
            >
              Join tournament
            </button>
          )}

          {tournament.status === "upcoming" && currentUserJoined && (
            <button className="disabled-action-button" disabled>
              Already joined
            </button>
          )}

          {tournament.status === "ongoing" && (
            <button className="primary-action-button">
              Spectate tournament
            </button>
          )}

          {tournament.status === "finished" && (
            <button className="disabled-action-button" disabled>
              Tournament finished
            </button>
          )}

          {joinMessage && <p className="join-message">{joinMessage}</p>}
        </div>
      </section>

      <section className="tournament-layout">
        <div className="tournament-main-content">
          <section className="detail-card">
            <h2>Rules</h2>
            <p>{tournament.rules}</p>
          </section>

          <section className="detail-card">
            <h2>Tournament Settings</h2>

            <div className="settings-grid">
              <div>
                <strong>
                  {tournament.players?.length || 0}/{tournament.maxPlayers}
                </strong>
                <span>Players</span>
              </div>

              <div>
                <strong>{tournament.buyIn}</strong>
                <span>Buy-in</span>
              </div>

              <div>
                <strong>{tournament.tournamentRounds}</strong>
                <span>Tournament rounds</span>
              </div>

              <div>
                <strong>
                  {tournament.minElo}–{tournament.maxElo}
                </strong>
                <span>Elo range</span>
              </div>
            </div>
          </section>

          <section className="detail-card">
            <h2>Game Variant</h2>

            <p>
              {tournament.gameVariant?.rounds} rounds,{" "}
              {tournament.gameVariant?.timeControl}s,{" "}
              {tournament.gameVariant?.maxPlayersPerGame} players per game.
            </p>

            <p>
              Straights:{" "}
              {tournament.gameVariant?.straightsAllowed
                ? "Allowed"
                : "Not allowed"}
            </p>
          </section>
        </div>

        <aside className="tournament-sidebar">
          <section className="trophy-card">
            {tournament.trophy?.image ? (
              <img
                src={tournament.trophy.image}
                alt={tournament.trophy?.title || "Tournament trophy"}
              />
            ) : (
              <div className="large-trophy-placeholder">🏆</div>
            )}

            <h2>{tournament.trophy?.title || "Champion Trophy"}</h2>
            <p>{tournament.trophy?.description || "Awarded to the winner."}</p>
          </section>

          <section className="detail-card">
            <h2>Players Joined</h2>

            {tournament.players?.length > 0 ? (
              <ul className="players-list">
                {tournament.players.map((player) => (
                  <li key={player._id || player}>
                    {player.username || "Unknown player"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No players have joined yet.</p>
            )}
          </section>

          <section className="detail-card">
            <h2>Author</h2>
            <p>{tournament.author?.username || "Platform"}</p>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default TournamentPage;