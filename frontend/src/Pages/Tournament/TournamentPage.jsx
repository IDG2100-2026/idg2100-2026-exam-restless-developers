import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./TournamentPage.css";

function TournamentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    async function fetchTournament() {
      try {
        const response = await fetch(
          `http://localhost:6767/api/v1/tournaments/${id}`
        );

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

  useEffect(() => {
    if (!tournament) return;

    function updateCountdown() {
      const now = new Date();
      let targetDate = null;

      if (tournament.status === "upcoming") {
        targetDate = tournament.startDate;
      }

      if (tournament.status === "ongoing" && tournament.nextRoundStart) {
        targetDate = tournament.nextRoundStart;
      }

      if (!targetDate) {
        setTimeLeft("No timer available");
        return;
      }

      const difference = new Date(targetDate) - now;

      if (difference <= 0) {
        setTimeLeft(
          tournament.status === "ongoing"
            ? "Round starting now"
            : "Tournament has started"
        );
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        days > 0
          ? `${days}d ${hours}h ${minutes}m`
          : `${hours}h ${minutes}m ${seconds}s`
      );
    }

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [tournament]);

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getCurrentUserId() {
    return localStorage.getItem("currentUserId");
  }

  function getCurrentUserRole() {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || null;
    } catch (error) {
      return null;
    }
  }

  function isCurrentUserAdmin() {
    return getCurrentUserRole() === "admin";
  }

  function isCurrentUserJoined() {
    const currentUserId = getCurrentUserId();

    if (!currentUserId || !tournament?.players) {
      return false;
    }

    return tournament.players.some((player) => {
      if (typeof player === "string") {
        return player.toString() === currentUserId.toString();
      }

      return player._id?.toString() === currentUserId.toString();
    });
  }

  async function handleJoinTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}/players`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not join tournament");
      }

      setTournament(data);
      setActionMessage("You joined the tournament!");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLeaveTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}/players`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not leave tournament");
      }

      setTournament(data);
      setActionMessage("You left the tournament.");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "ongoing",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not start tournament");
      }

      setTournament(data);
      setActionMessage("Tournament started.");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditTournament() {
    navigate(`/admin/tournaments/${id}/edit`);
}

  async function handleCancelTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "cancelled",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not cancel tournament");
      }

      setTournament(data);
      setActionMessage("Tournament cancelled.");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Could not delete tournament");
      }

      navigate("/tournaments");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderCountdownLabel() {
    if (tournament.status === "upcoming") return "Starts in";
    if (tournament.status === "ongoing") return "Next round in";
    return "Ended";
  }

  function renderTopAdminActions() {
    if (!isCurrentUserAdmin()) {
      return null;
    }

    return (
      <div className="inline-admin-actions">
        {tournament.status === "upcoming" && (
          <button
            className="primary-action-button small-action-button"
            type="button"
            onClick={handleStartTournament}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting..." : "Start"}
          </button>
        )}

        <button
          className="secondary-action-button small-action-button"
          type="button"
          onClick={handleEditTournament}
        >
          Edit
        </button>

        {tournament.status !== "finished" &&
          tournament.status !== "cancelled" && (
            <button
              className="secondary-action-button small-action-button"
              type="button"
              onClick={handleCancelTournament}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}

        <button
          className="danger-action-button small-action-button"
          type="button"
          onClick={handleDeleteTournament}
          disabled={isSubmitting}
        >
          Delete
        </button>
      </div>
    );
  }

  function renderTournamentAction() {
    const currentUserJoined = isCurrentUserJoined();

    if (tournament.status === "upcoming" && !currentUserJoined) {
      return (
        <button
          className="primary-action-button"
          onClick={handleJoinTournament}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Joining..." : "Join tournament"}
        </button>
      );
    }

    if (
      (tournament.status === "upcoming" || tournament.status === "ongoing") &&
      currentUserJoined
    ) {
      return (
        <button
          className="secondary-action-button"
          onClick={handleLeaveTournament}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Leaving..." : "Leave tournament"}
        </button>
      );
    }

    if (tournament.status === "ongoing") {
      return (
        <button className="primary-action-button" type="button">
          Spectate tournament
        </button>
      );
    }

    if (tournament.status === "cancelled") {
      return (
        <button className="disabled-action-button" disabled>
          Tournament cancelled
        </button>
      );
    }

    return (
      <button className="disabled-action-button" disabled>
        Tournament finished
      </button>
    );
  }

  if (error) {
    return <p className="tournament-page-error">{error}</p>;
  }

  if (!tournament) {
    return <p className="tournament-page-loading">Loading tournament...</p>;
  }

  const latestRound = tournament.rounds?.[tournament.rounds.length - 1];

  const sortedStandings = [...(tournament.standings || [])].sort(
    (a, b) => b.points - a.points
  );

  return (
    <main className="single-tournament-page">
      <div className="top-actions-row">
        <Link to="/tournaments" className="back-link">
          ← Back to tournaments
        </Link>

        {renderTopAdminActions()}
      </div>

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

          <div className="countdown-box">
            <span>{renderCountdownLabel()}</span>
            <strong>{timeLeft}</strong>
          </div>

          {renderTournamentAction()}

          {actionMessage && <p className="join-message">{actionMessage}</p>}
        </div>
      </section>

      <section className="tournament-layout">
        <div className="tournament-main-content">
          {tournament.status === "finished" && tournament.winner && (
            <section className="champion-card">
              <div className="champion-icon">🏆</div>

              <div>
                <span className="champion-label">Tournament Champion</span>

                <h2>{tournament.winner.username}</h2>

                <p>Winner of {tournament.title}</p>
              </div>
            </section>
          )}

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

          {(tournament.status === "ongoing" ||
            tournament.status === "finished") && (
            <>
              <section className="detail-card">
                <div className="section-header-row">
                  <h2>
                    {tournament.status === "finished"
                      ? "Final Round"
                      : "Current Round"}
                  </h2>

                  <span className="round-indicator">
                    Round {tournament.currentRound} of{" "}
                    {tournament.tournamentRounds}
                  </span>
                </div>

                {latestRound?.pairings?.length > 0 ? (
                  <div className="pairings-list">
                    {latestRound.pairings.map((pairing) => (
                      <div className="pairing-card" key={pairing._id}>
                        <div className="pairing-players">
                          {pairing.players.map((player) => (
                            <span key={player._id || player}>
                              {player.username || "Unknown player"}
                            </span>
                          ))}
                        </div>

                        <span className="pairing-status">
                          {pairing.winner
                            ? `Winner: ${
                                pairing.winner.username || "Unknown player"
                              }`
                            : "Game pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No pairings available yet.</p>
                )}
              </section>

              <section className="detail-card">
                <h2>Standings</h2>

                {sortedStandings.length > 0 ? (
                  <div className="standings-table">
                    <div className="standings-header">
                      <span>#</span>
                      <span>Player</span>
                      <span>Points</span>
                      <span>Wins</span>
                      <span>Losses</span>
                    </div>

                    {sortedStandings.map((standing, index) => (
                      <div className="standings-row" key={standing._id}>
                        <span>{index + 1}</span>

                        <span className="standings-player">
                          {standing.player?.username || "Unknown"}

                          {tournament.winner?._id === standing.player?._id && (
                            <span className="winner-badge">Champion</span>
                          )}
                        </span>

                        <span>{standing.points}</span>
                        <span>{standing.wins}</span>
                        <span>{standing.losses}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No standings available yet.</p>
                )}
              </section>
            </>
          )}

          <section className="detail-card">
            <h2>Comments</h2>
            <p>Comments will be added here.</p>
          </section>
        </div>

        <aside className="tournament-sidebar">
          <section className="trophy-card">
            {tournament.trophy?.imageUrl ? (
              <img
                src={tournament.trophy.imageUrl}
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