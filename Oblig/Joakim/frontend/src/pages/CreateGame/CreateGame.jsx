import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMatch } from "../../api.js";
import styles from "./CreateGame.module.css";

const roundOptions = [3, 5, 7];
const timeOptions = [5, 10, 15];

const CreateGame = () => {
  const navigate = useNavigate();
  let user = null;

  try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      user = JSON.parse(rawUser);
    }
  } catch {
    user = null;
  }

  const [rounds, setRounds] = useState(5);
  const [straightsAllowed, setStraightsAllowed] = useState(true);
  const [timeControl, setTimeControl] = useState(10);
  const [allowAnonymous, setAllowAnonymous] = useState(true);
  const [desiredOpponentElo, setDesiredOpponentElo] = useState(1200);
  const [anonymousNickname, setAnonymousNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const nickname = anonymousNickname.trim();

    if (!user && nickname.length < 2) {
      setError("Enter an anonymous nickname (at least 2 characters).");
      return;
    }

    let players = [{ isAnonymous: true, nickname }];
    if (user) {
      const uid = user.uid || user.userId;
      players = [{ uid, isAnonymous: false }];
    }

    const payload = {
      players,
      variant: {
        rounds,
        straightsAllowed,
        timeControl,
      },
      isAnonymousMatch: !user,
      desiredOpponentElo,
    };

    if (user) {
      payload.allowAnonymous = allowAnonymous;
    }

    try {
      setIsSubmitting(true);
      const response = await createMatch(payload);
      const matchId = response?.match?._id || response?.match?.id;

      if (matchId) {
        navigate(`/game/${matchId}`);
        return;
      }

      navigate("/lobby");
    } catch (submitError) {
      setError(submitError.message || "Could not create game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  let matchmakerField = (
    <label className={styles.field}>
      Anonymous nickname
      <input
        type="text"
        value={anonymousNickname}
        maxLength="24"
        onChange={(event) => setAnonymousNickname(event.target.value)}
        placeholder="GuestDice"
      />
    </label>
  );

  if (user) {
    matchmakerField = (
      <label className={styles.checkboxLine}>
        <input
          type="checkbox"
          checked={allowAnonymous}
          onChange={(event) => setAllowAnonymous(event.target.checked)}
        />
        Allow anonymous users to join this game
      </label>
    );
  }

  let submitText = "Create Game";
  if (isSubmitting) {
    submitText = "Creating...";
  }

  return (
    <section className={styles.page}>
      <h1>Create Game</h1>
      <p className={styles.subtitle}>Choose your game variant and matchmaking preferences.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.block}>
          <h2>Rounds</h2>
          <div className={styles.inlineChoices}>
            {roundOptions.map((value) => (
              <label key={value} className={styles.choice}>
                <input
                  type="radio"
                  name="rounds"
                  checked={rounds === value}
                  onChange={() => setRounds(value)}
                />
                Best of {value}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <h2>Straights</h2>
          <div className={styles.inlineChoices}>
            <label className={styles.choice}>
              <input
                type="radio"
                name="straights"
                checked={straightsAllowed}
                onChange={() => setStraightsAllowed(true)}
              />
              Allowed
            </label>
            <label className={styles.choice}>
              <input
                type="radio"
                name="straights"
                checked={!straightsAllowed}
                onChange={() => setStraightsAllowed(false)}
              />
              Not allowed
            </label>
          </div>
        </div>

        <div className={styles.block}>
          <h2>Time Per Move</h2>
          <div className={styles.inlineChoices}>
            {timeOptions.map((value) => (
              <label key={value} className={styles.choice}>
                <input
                  type="radio"
                  name="timeControl"
                  checked={timeControl === value}
                  onChange={() => setTimeControl(value)}
                />
                {value}s
              </label>
            ))}
          </div>
        </div>

        <div className={styles.block}>
          <h2>Matchmaking</h2>

          <label className={styles.field}>
            Desired opponent Elo
            <input
              type="number"
              min="800"
              max="2600"
              step="10"
              value={desiredOpponentElo}
              onChange={(event) => setDesiredOpponentElo(Number(event.target.value))}
            />
          </label>

          {matchmakerField}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {submitText}
        </button>
      </form>
    </section>
  );
};

export default CreateGame;
