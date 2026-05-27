import "./Hero.css";

function Hero({
  tournament,
  formatDate,
  renderCountdownLabel,
  timeLeft,
  renderTournamentAction,
  actionMessage,
}) {
  return (
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
  );
}

export default Hero;