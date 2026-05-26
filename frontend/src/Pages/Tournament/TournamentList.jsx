import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./TournamentList.css";

function TournamentList() {
  const [tournaments, setTournaments] = useState([]);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const [visibleOngoing, setVisibleOngoing] = useState(8);
  const [visibleUpcoming, setVisibleUpcoming] = useState(8);
  const [visiblePast, setVisiblePast] = useState(8);

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

  function shortenText(text, maxLength = 85) {
    if (!text) {
      return "No description available.";
    }

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength)}...`;
  }

  function renderTournamentCard(tournament) {
    const hasTrophyImage =
      tournament.trophy?.imageUrl &&
      tournament.trophy.imageUrl.trim() !== "";

    return (
      <Link
        to={`/tournaments/${tournament._id}`}
        className="tournament-card"
        key={tournament._id}
      >
        <div className="tournament-card-status">
          <span className={`status-badge ${tournament.status}`}>
            {tournament.status}
          </span>
        </div>

        <div className="tournament-card-main">
          <h3>{tournament.title}</h3>
          <p>{shortenText(tournament.description)}</p>
        </div>

        <div className="tournament-card-date">
          <span>{formatDate(tournament.startDate)}</span>
        </div>

        <div className="tournament-card-stat">
          <strong>
            {tournament.players?.length || 0}/{tournament.maxPlayers}
          </strong>
          <span>Players</span>
        </div>

        <div className="tournament-card-stat">
          <strong>{tournament.buyIn}</strong>
          <span>Buy-in</span>
        </div>

        <div className="tournament-card-stat">
          <strong>{tournament.tournamentRounds}</strong>
          <span>Rounds</span>
        </div>

        <div className="tournament-card-trophy">
          {hasTrophyImage ? (
            <>
              <img
                src={tournament.trophy.imageUrl}
                alt={tournament.trophy?.title || "Tournament trophy"}
                className="trophy-image"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.nextElementSibling.style.display = "grid";
                }}
              />

              <div className="trophy-placeholder hidden-trophy-placeholder">
                🏆
              </div>
            </>
          ) : (
            <div className="trophy-placeholder">🏆</div>
          )}

          <div>
            <strong>{tournament.trophy?.title || "Champion Trophy"}</strong>
            <span>
              {shortenText(
                tournament.trophy?.description || "Awarded to the winner.",
                42
              )}
            </span>
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
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                >
                  Load more
                </button>
              )}

              {visibleCount > 8 && (
                <button
                  className="show-less-button"
                  onClick={() => setVisibleCount(8)}
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
      <section className="tournament-toolbar">
        <div className="toolbar-heading">
          <span className="toolbar-kicker">Tournaments</span>
          <h1>Spanish Poker Dice Arena</h1>
        </div>

        <div className="tournament-controls">
          <label>
            Search
            <input
              type="text"
              placeholder="Search tournaments..."
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
              <option value="players">Players</option>
            </select>
          </label>
        </div>
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