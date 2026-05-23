import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addMatchComment, getMatch, joinMatch } from "../../api.js";
import styles from "./Game.module.css";

function readCurrentUser() {
  try {
    const raw = window.localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatVariant(variant) {
  if (!variant) {
    return "Unknown variant";
  }

  let rounds = "?";
  let straights = "No straights";
  let timeControl = "?";

  if (variant.rounds) {
    rounds = variant.rounds;
  }

  if (variant.straightsAllowed) {
    straights = "Straights allowed";
  }

  if (variant.timeControl) {
    timeControl = variant.timeControl;
  }

  return `Best of ${rounds}, ${straights}, ${timeControl}s`;
}

function playerLabel(player, index) {
  if (player && player.isAnonymous) {
    if (player.nickname) {
      return player.nickname;
    }

    return `Guest ${index + 1}`;
  }

  if (player && player.userId && player.userId.username) {
    return player.userId.username;
  }

  return `Player ${index + 1}`;
}

function playerElo(player) {
  if (!player) {
    return "N/A";
  }

  if (!player.userId) {
    return "N/A";
  }

  const elo = Number(player.userId.elo);
  if (Number.isFinite(elo)) {
    return elo;
  }

  return "N/A";
}

function commentAuthor(comment) {
  if (comment && comment.user && comment.user.username) {
    return comment.user.username;
  }

  return "Guest";
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

const Game = () => {
  const { gameId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [joining, setJoining] = useState(false);

  const user = readCurrentUser();

  useEffect(() => {
    let isMounted = true;

    async function loadMatch(silent = false) {
      if (!silent) {
        setLoading(true);
        setError("");
      }

      try {
        const response = await getMatch(gameId);
        if (isMounted) {
          if (response) {
            setMatch(response);
          } else {
            setMatch(null);
          }
        }
      } catch {
        if (isMounted) {
          setError("Could not load the game. Please try again.");
        }
      } finally {
        if (!silent && isMounted) {
          setLoading(false);
        }
      }
    }

    loadMatch();
    const intervalId = window.setInterval(() => {
      loadMatch(true);
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [gameId]);

  let players = [];
  if (match && Array.isArray(match.players)) {
    players = match.players;
  }

  let comments = [];
  if (match && Array.isArray(match.comments)) {
    comments = match.comments;
  }

  let isWaitingForPlayers = false;
  if (match && !match.winner && players.length < 2) {
    isWaitingForPlayers = true;
  }

  async function handleJoinGame() {
    setJoining(true);
    setError("");

    const payload = {};
    if (user && user.userId) {
      payload.userId = user.userId;
    }
    if (user && typeof user.uid !== "undefined") {
      payload.uid = user.uid;
    }
    if (!user || !user.userId) {
      payload.nickname = "Guest";
    }

    try {
      const response = await joinMatch(gameId, payload);
      if (response && response.match) {
        setMatch(response.match);
      }
    } catch {
      setError("Could not join this game right now.");
    } finally {
      setJoining(false);
    }
  }

  async function handleSubmitComment(event) {
    event.preventDefault();
    const trimmed = commentText.trim();

    if (!trimmed) {
      return;
    }

    setSubmittingComment(true);
    setError("");

    const payload = { text: trimmed };
    if (user && user.userId) {
      payload.userId = user.userId;
    }
    if (user && typeof user.uid !== "undefined") {
      payload.uid = user.uid;
    }

    try {
      const response = await addMatchComment(gameId, payload);
      if (response && response.match) {
        setMatch(response.match);
      }
      setCommentText("");
    } catch {
      setError("Could not post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading) {
    return <p className={styles.loading}>Loading game...</p>;
  }

  if (error && !match) {
    return (
      <section className={styles.page}>
        <p className={styles.error}>{error}</p>
        <Link to="/lobby" className={styles.linkButton}>
          Back to lobby
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>Game</h1>
        <p>{match ? formatVariant(match.variant) : "Unknown variant"}</p>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.layout}>
        <div className={styles.boardPanel}>
          <h2>Players</h2>
          {players.length === 0 ? <p>No players joined yet.</p> : null}
          <ul className={styles.playerList}>
            {players.map((player, index) => (
              <li key={`${playerLabel(player, index)}-${index}`} className={styles.playerItem}>
                <span>{playerLabel(player, index)}</span>
                <span>Elo: {playerElo(player)}</span>
              </li>
            ))}
          </ul>

          {isWaitingForPlayers ? (
            <div className={styles.waitingOverlay}>
              <p>Waiting for other players...</p>
              <button type="button" onClick={handleJoinGame} disabled={joining} className={styles.actionButton}>
                {joining ? "Joining..." : "Join this game"}
              </button>
            </div>
          ) : null}

          <div className={styles.boardPlaceholder}>
            <h3>Game board area</h3>
            <p>The interactive dice board will be implemented in a later sprint.</p>
          </div>
        </div>

        <aside className={styles.commentsPanel}>
          <h2>Comments</h2>
          {comments.length === 0 ? <p>No comments yet.</p> : null}
          <ul className={styles.commentList}>
            {comments.map((comment, index) => (
              <li key={`${comment.createdAt || index}-${index}`} className={styles.commentItem}>
                <p className={styles.commentMeta}>{commentAuthor(comment)}</p>
                {formatDate(comment.createdAt) ? <p className={styles.commentMeta}>{formatDate(comment.createdAt)}</p> : null}
                <p>{comment.text}</p>
              </li>
            ))}
          </ul>

          <form className={styles.commentForm} onSubmit={handleSubmitComment}>
            <label htmlFor="game-comment">Leave a comment</label>
            <textarea
              id="game-comment"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              rows="4"
              placeholder="Write your comment"
            />
            <button type="submit" disabled={submittingComment} className={styles.actionButton}>
              {submittingComment ? "Posting..." : "Post comment"}
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
};

export default Game;