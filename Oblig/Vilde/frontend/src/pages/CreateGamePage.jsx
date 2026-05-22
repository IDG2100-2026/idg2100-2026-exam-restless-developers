import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CreateGamePage.css";

import QDice from "../assets/Q.svg";
import ADice from "../assets/A.svg";
import KDice from "../assets/K.svg";

function CreateGamePage() {
  const navigate = useNavigate();

  const [bestOf, setBestOf] = useState(3);
  const [timePerRound, setTimePerRound] = useState(3);
  const [straightsAllowed, setStraightsAllowed] = useState(true);
  const [desiredElo, setDesiredElo] = useState("");
  const [allowAnonymousUsers, setAllowAnonymousUsers] = useState(true);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const currentUserId = localStorage.getItem("currentUserId");
  const isLoggedIn = Boolean(currentUserId);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/api/v1/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setErrorMessage("Could not load game variants.");
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const selectedCategory = categories.find(
        (category) =>
          Number(category.rounds) === Number(bestOf) &&
          Number(category.timePerRound) === Number(timePerRound) &&
          String(category.straightsAllowed) === String(straightsAllowed)
      );

      if (!selectedCategory) {
        setErrorMessage("No matching category found.");
        return;
      }

      if (!isLoggedIn) {
        setErrorMessage("You must be logged in to create a match.");
        return;
      }

      const response = await axios.post("http://localhost:3000/api/v1/matches", {
        players: [currentUserId],
        categoryId: selectedCategory._id,
        allowAnonymousPlayers: allowAnonymousUsers,
      });

      const createdMatch = response.data;
      navigate(`/match/${createdMatch._id}`);
    } catch (error) {
      console.error("Could not create match:", error);
      setErrorMessage(error.response?.data?.error || "Could not create match.");
    }
  }

  if (loading) {
    return (
      <main className="create-game-page">
        <section className="create-game-shell">
          <h1>Create Match</h1>
          <p>Loading game variants...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="create-game-page">
      <section className="create-game-shell">
        <div className="create-game-intro">
          <div className="create-game-dice-row" aria-hidden="true">
            <img src={KDice} alt="" className="create-game-dice" />
            <img src={QDice} alt="" className="create-game-dice" />
            <img src={ADice} alt="" className="create-game-dice" />
          </div>

          <h1>Create Match</h1>
          <p className="create-game-subtitle">
            Choose your variant and open a new game in the lobby.
          </p>
        </div>

        <form className="create-game-form" onSubmit={handleSubmit}>
          <label>
            Best of
            <select
              disabled={!isLoggedIn}
              value={bestOf}
              onChange={(e) => setBestOf(Number(e.target.value))}
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
            </select>
          </label>

          <label>
            Seconds per round
            <select
              disabled={!isLoggedIn}
              value={timePerRound}
              onChange={(e) => setTimePerRound(Number(e.target.value))}
            >
              <option value={3}>3s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
            </select>
          </label>

          <label>
            Straights allowed
            <select
              disabled={!isLoggedIn}
              value={straightsAllowed.toString()}
              onChange={(e) => setStraightsAllowed(e.target.value === "true")}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label>
            Desired opponent Elo
            <input
              disabled={!isLoggedIn}
              type="number"
              value={desiredElo}
              onChange={(e) => setDesiredElo(e.target.value)}
              placeholder="Optional"
              min="0"
            />
          </label>

          <label>
            Allow anonymous users
            <select
              disabled={!isLoggedIn}
              value={allowAnonymousUsers.toString()}
              onChange={(e) => setAllowAnonymousUsers(e.target.value === "true")}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          {errorMessage && <p className="create-game-error">{errorMessage}</p>}

          {isLoggedIn ? (
            <button type="submit" className="create-game-button">
              Create Match
            </button>
          ) : (
            <button
              type="button"
              className="login-button"
              onClick={() => navigate("/login")}
            >
              Log in to create match
            </button>
          )}
        </form>
      </section>
    </main>
  );
}

export default CreateGamePage;