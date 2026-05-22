import "./TopGames.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function TopGames() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/matches");

        const matchesWithAvgElo = response.data.map((match) => {
          const avgElo =
            match.players && match.players.length > 0
              ? match.players.reduce(
                  (sum, player) => sum + (player.elo || 0),
                  0
                ) / match.players.length
              : 0;

          return {
            ...match,
            avgElo,
          };
        });

        const runningMatches = matchesWithAvgElo
          .filter((match) => match.players?.length === 2 && !match.endedAt)
          .sort((a, b) => b.avgElo - a.avgElo);

        const pastMatches = matchesWithAvgElo
          .filter((match) => match.endedAt)
          .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));

        const topFiveMatches = [...runningMatches, ...pastMatches].slice(0, 5);

        setMatches(topFiveMatches);
      } catch (error) {
        console.error("Could not fetch top games:", error);
        setErrorMessage("Could not load top games.");
      }
    }

    fetchMatches();
  }, []);

  if (errorMessage) {
    return (
      <section className="top-games">
        <h2>Top Games</h2>
        <p>{errorMessage}</p>
      </section>
    );
  }

  return (
    <section className="top-games">
      <h2 className="top-game-header">Top Games</h2>

      <div className="topGame-list">
        {matches.length === 0 ? (
          <p>No top games available yet.</p>
        ) : (
          matches.map((match) => (
            <div className="topGame-card" key={match._id}>

                <p className="topGame-variant">
                    Best of {match.category?.rounds} • {match.category?.timePerRound}s •{" "}
                    {match.category?.straightsAllowed ? "Straights" : "No straights"}
                </p>

                <div className="players">

                    {match.players?.map((player, index) => (
                    <div key={player._id}>
                        <span className="player-name">
                        {player.username}
                        </span>
                        <span className="player-elo">
                        ({player.elo})
                        </span>
                        {index === 0 && match.players.length === 2 && (
                        <div className="vs">vs</div>
                        )}
                    </div>
                    ))}
                </div>
                <p className="avg-elo">
                    Avg {Math.round(match.avgElo)}
                </p>
                <button className="topGame-button"
                    onClick={() => navigate(`/match/${match._id}`)}
                >
                    {match.players.length < 2 ? "JOIN" : "WATCH"}
                </button>

                </div>


          ))
        )}
      </div>
    </section>
  );
}

export default TopGames;