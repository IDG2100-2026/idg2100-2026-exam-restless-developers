import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./IndividualGamePage.css";

function IndividualGamePage() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

useEffect(() => {
  async function fetchGameAndComments() {
    try {
      const [gameResponse, commentsResponse] = await Promise.all([
        axios.get(`http://localhost:3000/api/v1/matches/${id}`),
        axios.get(`http://localhost:3000/api/v1/comments?match=${id}`)
      ]);

      setGame(gameResponse.data);
      setComments(commentsResponse.data.comments || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Could not fetch game or comments:", error);
      setErrorMessage("Could not load game.");
    } finally {
      setLoading(false);
    }
  }

  fetchGameAndComments();
  const intervalId = setInterval(() => {
    fetchGameAndComments();
  }, 15000);
  
  return () => clearInterval(intervalId);
}, [id]);

  async function handleCommentSubmit() {
    try {
      setCommentError("");
      const currentUserId = localStorage.getItem("currentUserId");

      if (!currentUserId) {
        setCommentError("You must be logged in to write a comment.");
        return;
      }

      if (!commentText.trim()) {
        setCommentError("Comment cannot be empty.");
        return;
      }

      await axios.post("http://localhost:3000/api/v1/comments", {
        author: currentUserId,
        text: commentText,
        type: "match",
        match: id,
      });

    const commentsResponse = await axios.get(
      `http://localhost:3000/api/v1/comments?match=${id}`
    );

    setComments(commentsResponse.data.comments || []);
    setCommentText("");
  } catch (error) {
    console.error("Could not create comment:", error);
    setCommentError(
      error.response?.data?.error || "Could not create comment."
    );
  }
}

if (loading) {
  return (
    <main className="individual-gamePage">
      <h1>Loading game...</h1>
    </main>
  );
}

if (errorMessage) {
  return (
    <main className="individual-gamePage">
      <h1>{errorMessage}</h1>
    </main>
  );
}

if (!game) {
  return (
    <main className="individual-gamePage">
      <h1>Game not found</h1>
    </main>
  );
}

  return (
    <main className="individual-gamePage">
      <section className="game-header">
        <h1>Game #{game._id}</h1>
        <p className="game-status">
          {game.players?.length < (game.maxPlayers || 2) ? "Waiting for other players" : "Ready"}
        </p>
      </section>

      <section className="game-infoBar">
        <div className="game-variant">
          <p>Best of {game.category?.rounds}</p>
          <p>{game.category?.timePerRound} seconds per round</p>
          <p>
            Straights {game.category?.straightsAllowed ? "allowed" : "not allowed"}
          </p>
        </div>

        <div className="game-players">
          {game.players?.map((player) => (
            <div className="player-card" key={player._id}>
              <p className="player-name">{player.username}</p>
              <p className="player-elo">{player.elo} Elo</p>
            </div>
          ))}
        </div>
      </section>

      <section className="game-layout">
        <div className="game-board-area">
          <h2>Game board</h2>

          <div className="gameboard-placeholder">
            {game.players?.length < (game.maxPlayers || 2) && (
              <div className="waiting-overlay">Waiting for other players</div>
            )}
          </div>
        </div>

        <aside className="game-sidebar">
          <h2 className="gameSidebar-header">Comments</h2>

        <div className="comments-placeholder">
        {comments.length === 0 ? (
            <p>No comments yet</p>
        ) : (
            comments.map((comment) => (
            <div className="comment-card" key={comment._id}>
                <p className="comment-author">
                {comment.author?.username || "Unknown user"}
                </p>
                <p className="comment-date">
                {new Date(comment.createdAt).toLocaleString()}
                </p>
                <p className="comment-text">{comment.text}</p>
            </div>
            ))
        )}
        </div>

        <textarea
            className="comment-input"
            placeholder="Write a comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
        />

            <button type="button" className="comment-button" onClick={handleCommentSubmit}>
            Write a comment
            </button>

            {commentError && <p className="comment-error">{commentError}</p>}
        </aside>
      </section>
    </main>
  );
}

export default IndividualGamePage;

