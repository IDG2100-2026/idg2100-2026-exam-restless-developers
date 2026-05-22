import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LobbyPage.css";
import QDice from "../assets/Q.svg";
import ADice from "../assets/A.svg";
import JDice from "../assets/J.svg";
import Dice7 from "../assets/7.svg";
import Dice8 from "../assets/8.svg";
import KDice from "../assets/K.svg";

const diceImages = [QDice, ADice, JDice, Dice7, Dice8, KDice ]

function LobbyPage() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinMessages, setJoinMessages] = useState({});

  useEffect(() => {
    async function fetchMatches() {
      try {
        const currentUserId = localStorage.getItem("currentUserId");

        const url = currentUserId
        ? `http://localhost:3000/api/v1/matches/lobby?viewerId=${currentUserId}`
        : "http://localhost:3000/api/v1/matches/lobby";
        const response = await axios.get(url);
        setMatches(response.data);
      } catch (error) {
        console.error(error);
        setError("Could not load lobby games");
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();

    function handleUpdate() {
      fetchMatches();
    }

    window.addEventListener("lobbyLimitChanged", handleUpdate);

    return () => {
      window.removeEventListener("lobbyLimitChanged", handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <main className="lobby-page">
        <p>Loading lobby...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="lobby-page">
        <p>{error}</p>
      </main>
    );
  }

  async function handleJoinMatch(matchId) {
    const currentUserId = localStorage.getItem("currentUserId");

    if (!currentUserId) {
      setJoinMessages((prev) => ({
        ...prev,
        [matchId]: "You must be logged in to join. Watch or login.",
      }));
      return;
    }

    try {
      setJoinMessages((prev) => ({
        ...prev,
        [matchId]: "",
      }));

      await axios.put(`http://localhost:3000/api/v1/matches/${matchId}/join`, {
        userId: currentUserId,
      });

      navigate(`/match/${matchId}`);
    } catch (error) {
      console.error("Could not join match:", error);
      setJoinMessages((prev) => ({
        ...prev,
        [matchId]: error.response?.data?.error || "Could not join match.",
      }));
    }
  }

    const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const lobbyLimit = Number(localStorage.getItem("lobbyLimit")) || 10;
    const visibleMatches = sortedMatches.slice(0, lobbyLimit);


  return (
    <main className="lobby-page">
      <h1 className="lobby-header">Lobby</h1>
      <p className="lobby-paragraph">Available games you can join or watch</p>

      <div className="lobby-page-list">
        {visibleMatches.map((match) => (
          <div className="lobby-page-card" key={match._id}>
                <div className="lobby-card-header">
                  <img src={diceImages[Math.floor(Math.random() * diceImages.length)]} className="lobby-dice-icon"/>  
                <h2>{match.category?.label || "Game variant"}</h2>
            </div>
            <p>
              Status: {match.players?.length < 2 ? "Waiting for players" : "In progress"}
            </p>

            <p>Players:</p>
            {match.players?.map((player) => (
              <p key={player._id}>
                {player.username} ({player.elo} Elo)
              </p>
            ))}

            <div className="lobby-page-button-row">
              <button
                className="lobby-page-button"
                onClick={() => handleJoinMatch(match._id)}
              >
                Join
              </button>

              <button
                className="lobby-page-button lobby-page-button-secondary"
                onClick={() => navigate(`/match/${match._id}`)}
              >
                Watch
              </button>
            </div>

            {joinMessages[match._id] && (
              <p className="lobby-page-message">{joinMessages[match._id]}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

export default LobbyPage;