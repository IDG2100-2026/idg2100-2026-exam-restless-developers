import "./LobbyBox.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function LobbyBox() {

    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        async function fetchMatches() {
            try {
                const currentUserId = localStorage.getItem("currentUserId");

                const url = currentUserId
                ? `http://localhost:3000/api/v1/matches/lobby?viewerId=${currentUserId}`
                : "http://localhost:3000/api/v1/matches/lobby";

                const response = await axios.get(url);
                setMatches(response.data.slice(0, 3));
            } catch (error) {
                console.error(error);
            }
        }
        fetchMatches();
    }, []);

    async function handleJoinMatch(matchId) {
    try {
        const currentUserId = localStorage.getItem("currentUserId");

        if (!currentUserId) {
        alert("You must be logged in to join a match.");
        return;
        }
    

        await axios.put(`http://localhost:3000/api/v1/matches/${matchId}/join`, {
        userId: currentUserId
        });

        navigate(`/match/${matchId}`);

    } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Could not join match.");
    }
    }

    return (
        <aside className="lobby-box">
            <h2 className="lobbybox-header">Available games</h2>
            {matches.length === 0 && (
                <p>No open games yet. Create one!</p>
)}
            {matches.map(match => (
                <div className="lobby-game" key={match._id}>
                    <p>{match.category?.label}</p>
                    <p>Status: Waiting for players</p>

                    {match.players.map(player => (
                        <div key={player._id}>
                            <p>Player: {player.username}</p>
                            <p>ELO: {player.elo}</p>
                        </div>
                    ))}
                <button className="lobby-joinButton" onClick={() => handleJoinMatch(match._id)}>JOIN</button>
                </div>
            ))}
        </aside>
    );
}

export default LobbyBox;
