import "./GameVariant.css";

function GameVariant({ tournament }) {
  return (
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
  );
}

export default GameVariant;