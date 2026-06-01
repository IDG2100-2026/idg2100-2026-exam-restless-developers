
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./TournamentPage.css";

import Hero from "../../Components/Tournament/Hero";
import Comments from "../../Components/Tournament/Comments";
import Sidebar from "../../Components/Tournament/Sidebar";
import Standings from "../../Components/Tournament/Standings";
import Rounds from "../../Components/Tournament/Rounds";
import Settings from "../../Components/Tournament/Settings";
import GameVariant from "../../Components/Tournament/GameVariant";
import Rules from "../../Components/Tournament/Rules";

const socket = io("http://localhost:6767");

function TournamentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [hasRedirectedToGame, setHasRedirectedToGame] = useState(false);

  useEffect(() => {
    async function fetchTournament() {
      try {
        const response = await fetch(
          `http://localhost:6767/api/v1/tournaments/${id}`
        );

        if (!response.ok) {
          throw new Error("Could not fetch tournament");
        }

        const data = await response.json();
        setTournament(data);
      } catch (error) {
        setError(error.message);
      }
    }

    fetchTournament();
  }, [id]);


  useEffect(() => {
  if (!tournament || tournament.status !== "ongoing") return;

  const intervalId = setInterval(async () => {
    try {
      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}`
      );

      if (!response.ok) return;

      const data = await response.json();
      setTournament(data);
    } catch {
      // ignore
    }
  }, 1000);

  return () => clearInterval(intervalId);
}, [id, tournament?.status]);



  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(
          `http://localhost:6767/api/v1/comments/${id}`
        );

        if (!response.ok) {
          throw new Error("Could not fetch comments");
        }

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchComments();
  }, [id]);

  useEffect(() => {
    socket.on("new-tournament-comment", ({ tournamentId, comment }) => {
      if (tournamentId !== id) {
        return;
      }

      setComments((prevComments) => {
        const commentAlreadyExists = prevComments.some(
          (existingComment) => existingComment._id === comment._id
        );

        if (commentAlreadyExists) {
          return prevComments;
        }

        return [comment, ...prevComments];
      });
    });

    return () => {
      socket.off("new-tournament-comment");
    };
  }, [id]);

  useEffect(() => {
    socket.emit("join:tournament", id);

    socket.on("tournament:update", (updatedTournament) => {
      setTournament(updatedTournament);
      setHasRedirectedToGame(false);
    });

    return () => {
      socket.off("tournament:update");
    };
  }, [id]);

  function getCurrentUserId() {
    return localStorage.getItem("currentUserId");
  }

  function getCurrentUserRole() {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || null;
    } catch (error) {
      return null;
    }
  }

  function isCurrentUserAdmin() {
    return getCurrentUserRole() === "admin";
  }

  function isCurrentUserJoined() {
    const currentUserId = getCurrentUserId();

    if (!currentUserId || !tournament?.players) {
      return false;
    }

    return tournament.players.some((player) => {
      if (typeof player === "string") {
        return player.toString() === currentUserId.toString();
      }

      return player._id?.toString() === currentUserId.toString();
    });
  }



  async function goToTournamentGame() {
  try {
    if (hasRedirectedToGame) return;

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/401";
      return;
    }

    const currentUserId = getCurrentUserId();

    const currentRound = tournament.rounds.find(
      (round) => round.roundNumber === tournament.currentRound
    );

    const myPairing = currentRound?.pairings.find((pairing) =>
      pairing.players.some((player) =>
        String(player._id ?? player) === String(currentUserId)
      )
    );

    if (!myPairing) {
      setActionMessage("Could not find your pairing.");
      return;
    }

    if (myPairing.game) {
      const matchId =
        typeof myPairing.game === "object" ? myPairing.game._id : myPairing.game;

      setHasRedirectedToGame(true);
      navigate(`/game/${matchId}`);
      return;
    }

    const firstPlayerId = String(myPairing.players[0]?._id ?? myPairing.players[0]);

    if (String(currentUserId) !== firstPlayerId) {
      return;
    }

    const response = await fetch(
      `http://localhost:6767/api/v1/tournaments/${id}/matches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      window.location.href = "/401";
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Could not enter tournament game");
    }

    setHasRedirectedToGame(true);
    navigate(`/game/${data.matchId}`);
  } catch (error) {
    setActionMessage(error.message);
  }
}


  useEffect(() => {
    if (!tournament) return;

    function updateCountdown() {
      const now = new Date();
      let targetDate = null;

      if (tournament.status === "upcoming") {
        targetDate = tournament.startDate;
      }

      if (tournament.status === "ongoing" && tournament.nextRoundStart) {
        targetDate = tournament.nextRoundStart;
      }

      if (!targetDate) {
        setTimeLeft("No timer available");
        return;
      }

      const difference = new Date(targetDate) - now;

      if (difference <= 0) {
         if (tournament.status === "ongoing" && isCurrentUserJoined()) {
           setTimeLeft("Round starting now");
           goToTournamentGame();
           return;
         }

        setTimeLeft(
          tournament.status === "ongoing"
            ? "Round starting now"
            : "Tournament has started"
        );
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        days > 0
          ? `${days}d ${hours}h ${minutes}m`
          : `${hours}h ${minutes}m ${seconds}s`
      );
    }

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [tournament, hasRedirectedToGame]);

  function formatDate(date) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleJoinTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}/players`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not join tournament");
      }

      setTournament(data);
      setActionMessage("You joined the tournament!");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLeaveTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}/players`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not leave tournament");
      }

      setTournament(data);
      setActionMessage("You left the tournament.");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "ongoing",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not start tournament");
      }

      setTournament(data);
      setActionMessage("Tournament started.");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditTournament() {
    navigate(`/admin/tournaments/${id}/edit`);
  }

  async function handleCancelTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "cancelled",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not cancel tournament");
      }

      setTournament(data);
      setActionMessage("Tournament cancelled.");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTournament() {
    try {
      setActionMessage("");
      setIsSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/tournaments/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Could not delete tournament");
      }

      navigate("/tournaments");
    } catch (error) {
      setActionMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitComment(event) {
    event.preventDefault();

    try {
      setActionMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/401";
        return;
      }

      if (!commentInput.trim()) {
        setActionMessage("Comment cannot be empty.");
        return;
      }

      const response = await fetch(
        `http://localhost:6767/api/v1/comments/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: commentInput,
          }),
        }
      );

      await response.json();

      if (!response.ok) {
        throw new Error("Could not post comment");
      }

      setCommentInput("");
    } catch (error) {
      setActionMessage(error.message);
    }
  }

  function renderCountdownLabel() {
    if (tournament.status === "upcoming") return "Starts in";
    if (tournament.status === "ongoing") return "Next round in";
    return "Ended";
  }

  function renderTopAdminActions() {
    if (!isCurrentUserAdmin()) {
      return null;
    }

    return (
      <div className="inline-admin-actions">
        {tournament.status === "upcoming" && (
          <button
            className="primary-action-button small-action-button"
            type="button"
            onClick={handleStartTournament}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Starting..." : "Start"}
          </button>
        )}

        <button
          className="secondary-action-button small-action-button"
          type="button"
          onClick={handleEditTournament}
        >
          Edit
        </button>

        {tournament.status !== "finished" &&
          tournament.status !== "cancelled" && (
            <button
              className="secondary-action-button small-action-button"
              type="button"
              onClick={handleCancelTournament}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}

        <button
          className="danger-action-button small-action-button"
          type="button"
          onClick={handleDeleteTournament}
          disabled={isSubmitting}
        >
          Delete
        </button>
      </div>
    );
  }

  function renderTournamentAction() {
    const currentUserJoined = isCurrentUserJoined();

    if (tournament.status === "upcoming" && !currentUserJoined) {
      return (
        <button
          className="primary-action-button"
          onClick={handleJoinTournament}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Joining..." : "Join tournament"}
        </button>
      );
    }

    if (
      (tournament.status === "upcoming" || tournament.status === "ongoing") &&
      currentUserJoined
    ) {
      return (
        <button
          className="secondary-action-button"
          onClick={handleLeaveTournament}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Leaving..." : "Leave tournament"}
        </button>
      );
    }

    if (tournament.status === "ongoing") {
      return (
        <button className="primary-action-button" type="button">
          Spectate tournament
        </button>
      );
    }

    if (tournament.status === "cancelled") {
      return (
        <button className="disabled-action-button" disabled>
          Tournament cancelled
        </button>
      );
    }

    return (
      <button className="disabled-action-button" disabled>
        Tournament finished
      </button>
    );
  }

  if (error) {
    return <p className="tournament-page-error">{error}</p>;
  }

  if (!tournament) {
    return <p className="tournament-page-loading">Loading tournament...</p>;
  }

  const latestRound = tournament.rounds?.[tournament.rounds.length - 1];
  

  const sortedStandings = [...(tournament.standings || [])].sort(
    (a, b) => b.points - a.points
  );

  return (
    <main className="single-tournament-page">
      <div className="top-actions-row">
        <Link to="/tournaments" className="back-link">
          ← Back to tournaments
        </Link>

        {renderTopAdminActions()}
      </div>

      <Hero
        tournament={tournament}
        formatDate={formatDate}
        renderCountdownLabel={renderCountdownLabel}
        timeLeft={timeLeft}
        renderTournamentAction={renderTournamentAction}
        actionMessage={actionMessage}
      />

      <section className="tournament-layout">
        <div className="tournament-main-content">
          {tournament.status === "finished" && tournament.winner && (
            <section className="champion-card">
              <div className="champion-icon">🏆</div>

              <div>
                <span className="champion-label">Tournament Champion</span>

                <h2>{tournament.winner.username}</h2>

                <p>Winner of {tournament.title}</p>
              </div>
            </section>
          )}

          <Rules tournament={tournament} />

          <Settings tournament={tournament} />

          <GameVariant tournament={tournament} />

          {(tournament.status === "ongoing" ||
            tournament.status === "finished") && (
            <>
              <Rounds tournament={tournament} latestRound={latestRound} />

              <Standings
                sortedStandings={sortedStandings}
                tournament={tournament}
              />
            </>
          )}

          <Comments
            comments={comments}
            commentInput={commentInput}
            setCommentInput={setCommentInput}
            handleSubmitComment={handleSubmitComment}
          />
        </div>

        <Sidebar tournament={tournament} />
      </section>
    </main>
  );
}

export default TournamentPage;