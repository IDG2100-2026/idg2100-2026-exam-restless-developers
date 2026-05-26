import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TournamentList.css";

function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const [visibleOngoing, setVisibleOngoing] = useState(3);
  const [visibleUpcoming, setVisibleUpcoming] = useState(3);
  const [visiblePast, setVisiblePast] = useState(3);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        const response = await fetch("http://localhost:6767/api/v1/tournaments");

        if (!response.ok) {
          throw new Error("Could not fetch tournaments");
        }

        const data = await response.json();
        setTournaments(data);
      } catch (error) {
        setError(error.message);
      }
    }

    fetchTournaments();
  }, []);

  function getFilteredAndSortedTournaments() {
    let filteredTournaments = tournaments;

    if (searchTerm.trim().length >= 3) {
      filteredTournaments = filteredTournaments.filter((tournament) =>
        tournament.title
          ?.toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      );
    }

    return [...filteredTournaments].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === "players") {
        return (b.players?.length || 0) - (a.players?.length || 0);
      }

      return new Date(a.startDate) - new Date(b.startDate);
    });
  }

  const filteredAndSortedTournaments = getFilteredAndSortedTournaments();

  const ongoingTournaments = filteredAndSortedTournaments.filter(
    (tournament) => tournament.status === "ongoing"
  );

  const upcomingTournaments = filteredAndSortedTournaments.filter(
    (tournament) => tournament.status === "upcoming"
  );

  const pastTournaments = filteredAndSortedTournaments.filter(
    (tournament) => tournament.status === "finished"
  );

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function shortenText(text, maxLength = 90) {
    if (!text) {
      return "No description available.";
    }

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength)}...`;
  }

  function renderTournamentCard(tournament) {
    return (
      <Link
        to={`/tournaments/${tournament._id}`}
        className="tournament-card"
        key={tournament._id}
      >
        <div className="tournament-card-header">
          <span className={`status-badge ${tournament.status}`}>
            {tournament.status}
          </span>

          <span>{formatDate(tournament.startDate)}</span>
        </div>

        <h3>{tournament.title}</h3>

        <p className="tournament-description">
          {shortenText(tournament.description)}
        </p>

        <div className="tournament-stats">
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
            <span>Rounds</span>
          </div>
        </div>

        <div className="tournament-meta">
          <p>
            <strong>Rules:</strong> {tournament.rules}
          </p>

          <p>
            <strong>Author:</strong>{" "}
            {tournament.author?.username || "Platform"}
          </p>
        </div>

        <div className="trophy-box">
          {tournament.trophy?.imageUrl ? (
            <img
              src={tournament.trophy.imageUrl}
              alt={tournament.trophy?.title || "Tournament trophy"}
              className="trophy-image"
            />
          ) : (
            <div className="trophy-placeholder">🏆</div>
          )}

          <div>
            <strong>{tournament.trophy?.title || "Champion Trophy"}</strong>
            <p>
              {shortenText(
                tournament.trophy?.description || "Awarded to the winner.",
                70
              )}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  function TournamentSection({
    title,
    subtitle,
    tournaments,
    visibleCount,
    setVisibleCount,
    emptyMessage,
  }) {
    return (
      <section className="tournament-section">
        <div className="section-heading">
          <div>
            <div className="section-title-row">
              <h2>{title}</h2>
              <span className="section-count">{tournaments.length}</span>
            </div>

            <p>{subtitle}</p>
          </div>
        </div>

        {tournaments.length === 0 ? (
          <p className="empty-message">{emptyMessage}</p>
        ) : (
          <>
            <div className="tournament-grid">
              {tournaments.slice(0, visibleCount).map(renderTournamentCard)}
            </div>

            <div className="tournament-buttons">
              {visibleCount < tournaments.length && (
                <button
                  className="load-more-button"
                  onClick={() => setVisibleCount((prev) => prev + 3)}
                >
                  Load more
                </button>
              )}

              {visibleCount > 3 && (
                <button
                  className="show-less-button"
                  onClick={() => setVisibleCount(3)}
                >
                  Show less
                </button>
              )}
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <main className="tournament-page">
      <section className="tournament-hero">
        <span className="hero-kicker">Spanish Poker Dice Arena</span>

        <p>
          Join upcoming tournaments, spectate live battles, or explore previous
          winners and trophies.
        </p>
      </section>

      <section className="tournament-controls">
        <label>
          Search tournaments
          <input
            type="text"
            placeholder="Type at least 3 characters..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>

        <label>
          Sort by
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="players">Number of players</option>
          </select>
        </label>
      </section>

      {error && <p className="tournament-error">{error}</p>}

      <TournamentSection
        title="Live Now"
        subtitle="Ongoing tournaments you can spectate right now."
        tournaments={ongoingTournaments}
        visibleCount={visibleOngoing}
        setVisibleCount={setVisibleOngoing}
        emptyMessage="No live tournaments found."
      />

      <TournamentSection
        title="Upcoming Tournaments"
        subtitle="Register before the tournament starts."
        tournaments={upcomingTournaments}
        visibleCount={visibleUpcoming}
        setVisibleCount={setVisibleUpcoming}
        emptyMessage="No upcoming tournaments found."
      />

      <TournamentSection
        title="Past Tournaments"
        subtitle="View previous tournaments and trophies."
        tournaments={pastTournaments}
        visibleCount={visiblePast}
        setVisibleCount={setVisiblePast}
        emptyMessage="No past tournaments found."
      />
    </main>
  );
}

export default TournamentList;