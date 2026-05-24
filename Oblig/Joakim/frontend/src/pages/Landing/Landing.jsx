import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMatches, getPlatformActivity, joinMatch } from "../../api.js";
import styles from "./Landing.module.css";

const APPEARANCE_STORAGE_KEY = "appearancePreferences";

function getLobbyCountPreference() {
  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) {
      return 5;
    }

    const parsed = JSON.parse(raw);
    const count = Number(parsed?.lobbyCount);
    if (!Number.isFinite(count)) {
      return 5;
    }

    return Math.max(3, Math.min(12, count));
  } catch {
    return 5;
  }
}

function formatVariant(variant) {
  if (!variant) {
    return "Unknown variant";
  }

  const rounds = variant.rounds || "?";
  const straights = variant.straightsAllowed ? "Straights allowed" : "No straights";
  const timeControl = variant.timeControl || "?";
  return `Best of ${rounds}, ${straights}, ${timeControl}s`;
}

function extractPlayerName(player, index) {
  if (player?.isAnonymous) {
    return player?.nickname || `Guest ${index + 1}`;
  }

  if (player?.userId?.username) {
    return player.userId.username;
  }

  return `Player ${index + 1}`;
}

function getPlayerNames(players = []) {
  if (!Array.isArray(players) || players.length === 0) {
    return "No players yet";
  }

  return players.map((player, index) => extractPlayerName(player, index)).join(", ");
}

function getAverageElo(players = []) {
  if (!Array.isArray(players) || players.length === 0) {
    return "N/A";
  }

  const values = [];
  for (const player of players) {
    const elo = Number(player?.userId?.elo);
    if (Number.isFinite(elo)) {
      values.push(elo);
    }
  }

  if (values.length === 0) {
    return "N/A";
  }

  const sum = values.reduce((acc, current) => acc + current, 0);
  return Math.round(sum / values.length);
}

const Landing = () => {
  const navigate = useNavigate();
  const [lobbyCount, setLobbyCount] = useState(5);
  const [matches, setMatches] = useState([]);
  const [platformData, setPlatformData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [joiningId, setJoiningId] = useState("");

  useEffect(() => {
    setLobbyCount(getLobbyCountPreference());

    async function loadData() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [matchList, activity] = await Promise.all([
          getMatches(),
          getPlatformActivity(),
        ]);

        if (Array.isArray(matchList)) {
          setMatches(matchList);
        } else {
          setMatches([]);
        }

        setPlatformData(activity || null);
      } catch (error) {
        setErrorMessage("Could not load homepage data. Please try again.");
        setMatches([]);
        setPlatformData(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const lobbyPreviewGames = useMemo(() => {
    const waitingMatches = matches.filter((match) => {
      const hasWinner = Boolean(match?.winner);
      const playerCount = Array.isArray(match?.players) ? match.players.length : 0;
      return !hasWinner && playerCount < 2;
    });

    return waitingMatches.slice(0, lobbyCount);
  }, [matches, lobbyCount]);

  const topGames = useMemo(() => {
    const ongoingGames = matches
      .filter((match) => !match?.winner)
      .map((match) => ({
        ...match,
        avgElo: getAverageElo(match.players),
      }))
      .sort((a, b) => {
        const aElo = Number.isFinite(Number(a.avgElo)) ? Number(a.avgElo) : -1;
        const bElo = Number.isFinite(Number(b.avgElo)) ? Number(b.avgElo) : -1;
        return bElo - aElo;
      });

    return ongoingGames.slice(0, 5);
  }, [matches]);

  const recentGames = useMemo(() => {
    if (!platformData?.recentGames || !Array.isArray(platformData.recentGames)) {
      return [];
    }

    return platformData.recentGames.slice(0, 5);
  }, [platformData]);

  async function handleJoinAndOpen(matchId) {
    setJoiningId(String(matchId));

    try {
      await joinMatch(matchId);
    } catch {
      // Navigate even if join fails so the user can still open the game page.
    } finally {
      setJoiningId("");
      navigate(`/game/${matchId}`);
    }
  }

  return (
    <div className={styles.landing}>
      <h1>Welcome to Spanish Poker Dice</h1>
      <p>Play fast-paced dice poker games online.</p>
      <Link className={styles.primaryAction} to="/game/create">
        Create Game
      </Link>

      {loading ? <p>Loading homepage data...</p> : null}
      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <h2>Lobby Preview</h2>
      {!loading && lobbyPreviewGames.length === 0 ? <p>No open games right now.</p> : null}
      <div className={styles.grid}>
        {lobbyPreviewGames.map((game) => (
          <article key={game._id} className={styles.card}>
            <h3>{formatVariant(game.variant)}</h3>
            <p>Players: {getPlayerNames(game.players)}</p>
            <p>Avg Elo: {getAverageElo(game.players)}</p>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => handleJoinAndOpen(game._id)}
              disabled={joiningId === String(game._id)}
            >
              {joiningId === String(game._id) ? "Joining..." : "Join Game"}
            </button>
          </article>
        ))}
      </div>

      <h2>Top 5 Games</h2>
      {!loading && topGames.length === 0 ? <p>No active top games yet.</p> : null}
      <div className={styles.grid}>
        {topGames.map((game) => (
          <article key={game._id} className={styles.card}>
            <h3>{formatVariant(game.variant)}</h3>
            <p>Players: {getPlayerNames(game.players)}</p>
            <p>Avg Elo: {game.avgElo}</p>
            <Link className={styles.secondaryActionLink} to={`/game/${game._id}`}>
              View Game
            </Link>
          </article>
        ))}
      </div>

      {!loading && topGames.length < 5 && recentGames.length > 0 ? (
        <>
          <h3>Recent Games</h3>
          <div className={styles.grid}>
            {recentGames.map((game) => (
              <article key={game._id} className={styles.card}>
                <h4>{formatVariant(game.variant)}</h4>
                <p>Players: {getPlayerNames(game.players)}</p>
                <Link className={styles.secondaryActionLink} to={`/game/${game._id}`}>
                  Open Game
                </Link>
              </article>
            ))}
          </div>
        </>
      ) : null}

      <h2>Upcoming Tournaments</h2>
      <p>Tournament preview will be added after tournament routes are wired in the frontend and backend.</p>
    </div>
  );
};

export default Landing;