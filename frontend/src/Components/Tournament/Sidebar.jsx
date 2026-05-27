import "./Sidebar.css";

function Sidebar({ tournament }) {
  return (
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

        <p>
          {tournament.trophy?.description || "Awarded to the winner."}
        </p>
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
  );
}

export default Sidebar;