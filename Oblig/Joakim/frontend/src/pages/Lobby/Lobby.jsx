import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMatches, joinMatch } from "../../api.js";
import styles from "./Lobby.module.css";

function readCurrentUser() {
  try {
    const raw = window.localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatVariant(variant) {
  if (!variant) return "Unknown variant";

  const rounds = variant.rounds || "?";
  const straights = variant.straightsAllowed ? "Straights allowed" : "No straights";
  const timeControl = variant.timeControl || "?";

  return `Best of ${rounds}, ${straights}, ${timeControl}s`;
}

function extractPlayerName(player, index) {
  if (!player) return `Player ${index + 1}`;
  if (player.isAnonymous) return player.nickname || `Guest ${index + 1}`;
  return player.userId?.username || `Player ${index + 1}`;
}

function getPlayerNames(players = []) {
  if (!Array.isArray(players) || players.length === 0) {
    return "No players yet";
  }

  return players.map((player, index) => extractPlayerName(player, index)).join(", ");
}

function getAverageElo(players = []) {
  if (!Array.isArray(players) || players.length === 0) {
    return null;
  }

  const values = players
    .map((player) => Number(player?.userId?.elo))
    .filter((elo) => Number.isFinite(elo));

  if (values.length === 0) {
    return null;
  }

  const sum = values.reduce((acc, current) => acc + current, 0);
  return Math.round(sum / values.length);
}

function isJoinable(match) {
  if (!match) return false;
  const playerCount = Array.isArray(match.players) ? match.players.length : 0;
  return !match.winner && playerCount < 2;
}

function passesVariantFilters(match, roundsFilter, straightsFilter, timeFilter) {
  const variant = match?.variant;

  if (roundsFilter !== "all" && Number(variant?.rounds) !== Number(roundsFilter)) {
    return false;
  }

  if (straightsFilter !== "all") {
    const expected = straightsFilter === "true";
    const actual = Boolean(variant?.straightsAllowed);
    if (actual !== expected) {
      return false;
    }
  }

  if (timeFilter !== "all" && Number(variant?.timeControl) !== Number(timeFilter)) {
    return false;
  }

  return true;
}

function passesEloFilter(match, eloOnly, registeredElo) {
  if (!eloOnly || !Number.isFinite(registeredElo)) {
    return true;
  }

  const avgElo = getAverageElo(match?.players || []);
  if (!Number.isFinite(avgElo)) {
    return true;
  }

  return Math.abs(avgElo - registeredElo) <= 400;
}

const Lobby = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState("");
  const [roundsFilter, setRoundsFilter] = useState("all");
  const [straightsFilter, setStraightsFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [eloOnly, setEloOnly] = useState(false);
  const user = readCurrentUser();

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      setError("");

      try {
        const response = await getMatches();
        setMatches(Array.isArray(response) ? response : []);
      } catch {
        setError("Could not load lobby games. Please try again.");
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const isGuest = !user;
  const registeredElo = Number(user && user.elo);

  const visibleMatches = matches.filter((match) => {
    if (!isJoinable(match)) return false;
    if (isGuest && !match.isAnonymousMatch) return false;
    if (!passesVariantFilters(match, roundsFilter, straightsFilter, timeFilter)) return false;
    if (!passesEloFilter(match, eloOnly, registeredElo)) return false;
    return true;
  });

  async function handleJoin(matchId) {
    setJoiningId(String(matchId));
    setError("");

    const payload = {
      ...(user?.userId ? { userId: user.userId } : {}),
      ...(typeof user?.uid !== "undefined" ? { uid: user.uid } : {}),
      ...(!user?.userId ? { nickname: "Guest" } : {}),
    };

    try {
      await joinMatch(matchId, payload);
      navigate(`/game/${matchId}`);
    } catch {
      setError("Could not join this game right now.");
    } finally {
      setJoiningId("");
    }
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>Lobby</h1>
        <p>Join an open game and start playing Spanish Poker Dice.</p>
      </header>

      <div className={styles.filters}>
        <label>
          Rounds
          <select value={roundsFilter} onChange={(event) => setRoundsFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="7">7</option>
          </select>
        </label>

        <label>
          Straights
          <select value={straightsFilter} onChange={(event) => setStraightsFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="true">Allowed</option>
            <option value="false">Not allowed</option>
          </select>
        </label>

        <label>
          Time control
          <select value={timeFilter} onChange={(event) => setTimeFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="5">5s</option>
            <option value="10">10s</option>
            <option value="15">15s</option>
          </select>
        </label>

        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={eloOnly} onChange={(event) => setEloOnly(event.target.checked)} />
          Show Elo-near games only
        </label>
      </div>

      {loading ? <p>Loading lobby...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      {!loading && visibleMatches.length === 0 ? <p>No joinable games with current filters.</p> : null}

      <div className={styles.grid}>
        {visibleMatches.map((match) => (
          <article className={styles.card} key={match._id}>
            <h2>{formatVariant(match.variant)}</h2>
            <p>Players: {getPlayerNames(match.players)}</p>
            <p>Average Elo: {getAverageElo(match.players) || "N/A"}</p>
            <button
              type="button"
              className={styles.joinButton}
              onClick={() => handleJoin(match._id)}
              disabled={joiningId === String(match._id)}
            >
              {joiningId === String(match._id) ? "Joining..." : "Join game"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Lobby;