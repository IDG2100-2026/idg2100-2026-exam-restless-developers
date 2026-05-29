// Made by: marte kaland
// Contains code from Joakim's oblig3 (radio button form structure, handleSubmit pattern)
// Contains code from Vilde's oblig3 (isLoggedIn check, login button instead of disabled form)

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function CreateGame() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("currentUserId");
  // From Vilde's oblig3
  const isLoggedIn = Boolean(currentUserId);

  const [rounds, setRounds] = useState(3);
  const [straightsAllowed, setStraightsAllowed] = useState(true);
  const [timeControl, setTimeControl] = useState(10);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [buyIn, setBuyIn] = useState(1);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);

      const res = await fetch("http://localhost:6767/api/v1/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rounds, straightsAllowed, timeControl, maxPlayers, buyIn, userId: currentUserId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not create game");
        return;
      }

      navigate(`/game/${data._id}`);
    } catch (err) {
      setError("Could not create game");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Create Game</h1>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Rounds</legend>
          {[3, 5, 7].map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="rounds"
                checked={rounds === value}
                onChange={() => setRounds(value)}
              />
              Best of {value}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Straights</legend>
          <label>
            <input
              type="radio"
              name="straights"
              checked={straightsAllowed}
              onChange={() => setStraightsAllowed(true)}
            />
            Allowed
          </label>
          <label>
            <input
              type="radio"
              name="straights"
              checked={!straightsAllowed}
              onChange={() => setStraightsAllowed(false)}
            />
            Not allowed
          </label>
        </fieldset>

        <fieldset>
          <legend>Time control (seconds total)</legend>
          {[10, 30, 90].map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="timeControl"
                checked={timeControl === value}
                onChange={() => setTimeControl(value)}
              />
              {value}s
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Number of players</legend>
          {[2, 3, 5].map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="maxPlayers"
                checked={maxPlayers === value}
                onChange={() => setMaxPlayers(value)}
              />
              {value} players
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Buy-in (points)</legend>
          {[1, 10, 50].map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="buyIn"
                checked={buyIn === value}
                onChange={() => setBuyIn(value)}
              />
              {value} points
            </label>
          ))}
        </fieldset>

        {error && <p>{error}</p>}

        {/* From Vilde's oblig3: show login button instead of disabled form */}
        {isLoggedIn ? (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create game"}
          </button>
        ) : (
          <Link to="/login">Log in to create a game</Link>
        )}
      </form>
    </main>
  );
}

export default CreateGame;
