import "./Standings.css";

function Standings({ sortedStandings, tournament }) {
  return (
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
  );
}

export default Standings;