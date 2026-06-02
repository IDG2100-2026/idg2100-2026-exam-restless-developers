import TournamentOverview from "../../Components/Tournament/tournamentOverview.jsx";
import LobbyPreview from "../../Components/Home/LobbyPreview.jsx";
import PlatformActivity from "../../Components/Home/PlatformActivity.jsx";
import TopGames from "../../Components/Home/TopGames.jsx";
import { Link } from "react-router-dom";
import "./Homepage.css";

function Homepage() {
  return (
    <main className="homepage">
      <section className="homepage-grid">
        <section className="homepage-about">
          <span className="homepage-kicker">Welcome</span>

          <h1>Spanish Poker Dice</h1>

          <p>
            Create matches, bluff opponents, join tournaments,
            spectate games and climb the rankings.
          </p>

          <div className="homepage-links">
            <Link to="/create-game">Create Match</Link>
            <Link to="/lobby">Lobby</Link>
            <Link to="/tournaments">Tournaments</Link>
          </div>
        </section>

        <TopGames />

        <TournamentOverview />

        <LobbyPreview />

        <div className="homepage-activity">
          <PlatformActivity />
        </div>
      </section>
    </main>
  );
}

export default Homepage;