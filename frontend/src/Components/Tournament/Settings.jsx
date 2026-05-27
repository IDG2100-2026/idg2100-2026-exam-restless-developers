import "./Settings.css";

function Settings({ tournament }) {
  return (
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
  );
}

export default Settings;