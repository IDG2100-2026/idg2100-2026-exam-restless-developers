import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./TournamentPage.css";

function TournamentPage() {
  const { id } = useParams();

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
    if (!tournament) {
      return;
    }

    function updateCountdown() {
      const now = new Date();

      let targetDate = null;

      if (tournament.status === "upcoming") {
        targetDate = tournament.startDate;
      }

      if (
        tournament.status === "ongoing" &&
        tournament.nextRoundStart
      ) {
        targetDate = tournament.nextRoundStart;
      }

      if (!targetDate) {
        setTimeLeft("No timer available");
        return;
      }

      const difference = new Date(targetDate) - now;

      if (difference <= 0) {
        if (tournament.status === "ongoing") {
          setTimeLeft("Round starting now");
        } else {
          setTimeLeft("Tournament has started");
        }

        return;
      }

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference / (1000 * 60 * 60)) % 24
      );

      const minutes = Math.floor(
        (difference / (1000 * 60)) % 60
      );

      const seconds = Math.floor(
        (difference / 1000) % 60
      );

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
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

  function renderCountdownLabel() {
    if (tournament.status === "upcoming") {
      return "Starts in";
    }

    if (tournament.status === "ongoing") {
      return "Next round in";
    }

    return "Ended";
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

    if (tournament.status === "upcoming" && currentUserJoined) {
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

    if (tournament.status === "ongoing" && currentUserJoined) {
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

  const latestRound = tournament.rounds?.[
    tournament.rounds.length - 1
  ];

  const sortedStandings = [...(tournament.standings || [])].sort(
    (a, b) => b.points - a.points
  );

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

          <div className="countdown-box">
            <span>{renderCountdownLabel()}</span>
            <strong>{timeLeft}</strong>
          </div>

          {renderTournamentAction()}

          {actionMessage && (
            <p className="join-message">{actionMessage}</p>
          )}
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
                  {tournament.players?.length || 0}/
                  {tournament.maxPlayers}
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
              {tournament.gameVariant?.maxPlayersPerGame} players
              per game.
            </p>

            <p>
              Straights:{" "}
              {tournament.gameVariant?.straightsAllowed
                ? "Allowed"
                : "Not allowed"}
            </p>
          </section>

          {tournament.status === "ongoing" && (
            <>
              <section className="detail-card">
                <div className="section-header-row">
                  <h2>Current Round</h2>

                  <span className="round-indicator">
                    Round {tournament.currentRound} of{" "}
                    {tournament.tournamentRounds}
                  </span>
                </div>

                {latestRound?.pairings?.length > 0 ? (
                  <div className="pairings-list">
                    {latestRound.pairings.map((pairing) => (
                      <div
                        className="pairing-card"
                        key={pairing._id}
                      >
                        <div className="pairing-players">
                          {pairing.players.map((player) => (
                            <span
                              key={player._id || player}
                            >
                              {player.username ||
                                "Unknown player"}
                            </span>
                          ))}
                        </div>

                        <span className="pairing-status">
                          {pairing.winner
                            ? `Winner: ${pairing.winner.username}`
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

                    {sortedStandings.map(
                      (standing, index) => (
                        <div
                          className="standings-row"
                          key={standing._id}
                        >
                          <span>{index + 1}</span>

                          <span>
                            {standing.player?.username ||
                              "Unknown"}
                          </span>

                          <span>{standing.points}</span>

                          <span>{standing.wins}</span>

                          <span>{standing.losses}</span>
                        </div>
                      )
                    )}
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
                alt={
                  tournament.trophy?.title ||
                  "Tournament trophy"
                }
              />
            ) : (
              <div className="large-trophy-placeholder">
                🏆
              </div>
            )}

            <h2>
              {tournament.trophy?.title ||
                "Champion Trophy"}
            </h2>

            <p>
              {tournament.trophy?.description ||
                "Awarded to the winner."}
            </p>
          </section>

          <section className="detail-card">
            <h2>Players Joined</h2>

            {tournament.players?.length > 0 ? (
              <ul className="players-list">
                {tournament.players.map((player) => (
                  <li key={player._id || player}>
                    {player.username ||
                      "Unknown player"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No players have joined yet.</p>
            )}
          </section>

          <section className="detail-card">
            <h2>Author</h2>
            <p>
              {tournament.author?.username || "Platform"}
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}

export default TournamentPage;