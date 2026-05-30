import TournamentOverview from "../../Components/Tournament/tournamentOverview.jsx";
import LobbyPreview from "../../Components/Home/LobbyPreview.jsx";
import PlatformActivity from "../../Components/Home/PlatformActivity.jsx";
import { Link } from "react-router-dom";
import "./Homepage.css";

function Homepage() {
  return (
    <main className="homepage">
      <section className="homepage-hero">
        <h1>Spanish Poker Dice</h1>
        <p className="homepage-description">
          Spanish Poker Dice is a friendly, fast online dice‑poker game for 2–5 players. Create or join matches, place bets and bluff, enter round‑based tournaments, or spectate live tables. Earn weekly points, climb the leaderboards, and chat with other players in real time.
        </p>

        <div className="homepage-ctas">
          <Link to="/create-game" className="homepage-cta">Create match</Link>
          <Link to="/lobby" className="homepage-cta">Go to lobby</Link>
          <Link to="/tournaments" className="homepage-cta">View tournaments</Link>
        </div>
      </section>

      <div className="homepage-widgets">
        <div className="homepage-left">
          <LobbyPreview />
          <PlatformActivity />
        </div>

        <div className="homepage-right">
          <TournamentOverview />
        </div>
      </div>
    </main>
  );
}

export default Homepage;