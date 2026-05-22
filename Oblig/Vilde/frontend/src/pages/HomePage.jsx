import "./HomePage.css";
import LobbyBox from "../components/Something/HomePage/LobbyBox";
import TopGames from "../components/Something/HomePage/TopGames";
import { useNavigate } from "react-router-dom";
import diceGameImage from "../assets/DICE.svg";

function HomePage() {
  const navigate = useNavigate();

  return (
        <div className="home-container">
          <div className="home-top">

            <div className="home-intro">
                <h1 className="home-header">Spanish Poker Dice</h1>
                <p className="home-paragraph">
                  Create a game, invite a friend to play or join tournaments!
                </p>

                <img src={diceGameImage} alt="" className="home-dice-image" />
              </div>

              <div className="home-button-row">
                <button className="home-createMatch-button" onClick={()=> navigate("/create")}>
                  CREATE MATCH
                </button>
                <button className="home-visit-button" onClick={()=> navigate("/lobby")}>
                  LOBBY
                </button>
              </div>

              <LobbyBox/>

          </div>
          <TopGames/>
        </div>
  )
}

export default HomePage;


