import "./Rounds.css";

function Rounds({ tournament, latestRound }) {
  return (
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
  );
}

export default Rounds;