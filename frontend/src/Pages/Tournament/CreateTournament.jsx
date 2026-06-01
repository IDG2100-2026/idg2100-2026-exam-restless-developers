import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateTournament.css";

function CreateTournament() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minStartDate = tomorrow.toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    straightsAllowed: true,
    rounds: "5",
    timeControl: "30",
    maxPlayersPerGame: "2",
    tournamentRounds: "3",
    buyIn: "10",
    maxPlayers: "16",
    rules: "",
    minElo: "0",
    maxElo: "3000",
    trophyTitle: "",
    trophyDescription: "",
    trophyImageUrl: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTournament() {
      if (!isEditMode) return;

      try {
        const response = await fetch(
          `http://localhost:6767/api/v1/tournaments/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not fetch tournament");
        }

        setFormData({
          title: data.title || "",
          description: data.description || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          straightsAllowed: data.gameVariant?.straightsAllowed ?? true,
          rounds: String(data.gameVariant?.rounds || 5),
          timeControl: String(data.gameVariant?.timeControl || 30),
          maxPlayersPerGame: String(data.gameVariant?.maxPlayersPerGame || 2),
          tournamentRounds: String(data.tournamentRounds || 3),
          buyIn: String(data.buyIn || 10),
          maxPlayers: String(data.maxPlayers || 16),
          rules: data.rules || "",
          minElo: String(data.minElo || 0),
          maxElo: String(data.maxElo || 3000),
          trophyTitle: data.trophy?.title || "",
          trophyDescription: data.trophy?.description || "",
          trophyImageUrl: data.trophy?.imageUrl || "",
        });
      } catch (error) {
        setError(error.message);
      }
    }

    fetchTournament();
  }, [id, isEditMode]);

  const handleChange = (event) => {
    const { name, value, type, checked, min, max } = event.target;

    if (type === "number" && value !== "") {
      const numberValue = Number(value);

      if (max && numberValue > Number(max)) return;
      if (min && numberValue < Number(min)) return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (Number(formData.minElo) > Number(formData.maxElo)) {
      setError("Minimum Elo cannot be higher than maximum Elo.");
      return;
    }

    if (!isEditMode && formData.startDate <= minStartDate) {
      setError("Start date must be at least one day in the future.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const tournamentData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      startDate: formData.startDate,
      gameVariant: {
        straightsAllowed: formData.straightsAllowed,
        rounds: Number(formData.rounds),
        timeControl: Number(formData.timeControl),
        maxPlayersPerGame: Number(formData.maxPlayersPerGame),
      },
      tournamentRounds: Number(formData.tournamentRounds),
      buyIn: Number(formData.buyIn),
      maxPlayers: Number(formData.maxPlayers),
      rules: formData.rules.trim(),
      minElo: Number(formData.minElo),
      maxElo: Number(formData.maxElo),
      trophy: {
        title: formData.trophyTitle.trim(),
        description: formData.trophyDescription.trim(),
        imageUrl: formData.trophyImageUrl.trim(),
      },
    };

    try {
      const response = await fetch(
        isEditMode
          ? `http://localhost:6767/api/v1/tournaments/${id}`
          : "http://localhost:6767/api/v1/tournaments",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(tournamentData),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/401";
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditMode
              ? "Failed to update tournament"
              : "Failed to create tournament")
        );
      }

      navigate(`/tournaments/${data._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-tournament-container">
      <h1>{isEditMode ? "Edit Tournament" : "Create Tournament"}</h1>

      <p className="create-tournament-intro">
        {isEditMode
          ? "Edit the tournament details below."
          : "Create a new tournament for players to join."}
      </p>

      {error && <p className="form-error">{error}</p>}

      <form className="create-tournament-form" onSubmit={handleSubmit}>
        <label>
          Tournament title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            minLength="3"
            maxLength="80"
            pattern="[A-Za-zÆØÅæøå0-9\s\-_:!?.]+"
            title="Only letters, numbers, spaces, and - _ : ! ? . are allowed."
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            minLength="10"
            maxLength="2000"
            required
          />
        </label>

        <label>
          Start date
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={isEditMode ? undefined : minStartDate}
            required
          />
        </label>

        <label>
          Straights allowed
          <input
            type="checkbox"
            name="straightsAllowed"
            checked={formData.straightsAllowed}
            onChange={handleChange}
          />
        </label>

        <label>
          Game rounds
          <select name="rounds" value={formData.rounds} onChange={handleChange}>
            <option value="3">3 rounds</option>
            <option value="5">5 rounds</option>
            <option value="7">7 rounds</option>
          </select>
        </label>

        <label>
          Time control
          <select
            name="timeControl"
            value={formData.timeControl}
            onChange={handleChange}
          >
            <option value="10">10 seconds</option>
            <option value="30">30 seconds</option>
            <option value="90">90 seconds</option>
          </select>
        </label>

        <label>
          Players per game
          <select
            name="maxPlayersPerGame"
            value={formData.maxPlayersPerGame}
            onChange={handleChange}
          >
            <option value="2">2 players</option>
            <option value="3">3 players</option>
            <option value="5">5 players</option>
          </select>
        </label>

        <label>
          Tournament rounds
          <input
            type="number"
            name="tournamentRounds"
            value={formData.tournamentRounds}
            onChange={handleChange}
            min="1"
            max="10"
            required
          />
        </label>

        <label>
          Buy-in
          <select name="buyIn" value={formData.buyIn} onChange={handleChange}>
            <option value="1">1 point</option>
            <option value="10">10 points</option>
            <option value="50">50 points</option>
          </select>
        </label>

        <label>
          Max players
          <input
            type="number"
            name="maxPlayers"
            value={formData.maxPlayers}
            onChange={handleChange}
            min="2"
            max="64"
            required
          />
        </label>

        <label>
          Rules
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            minLength="10"
            maxLength="1500"
            required
          />
        </label>

        <label>
          Minimum Elo
          <input
            type="number"
            name="minElo"
            value={formData.minElo}
            onChange={handleChange}
            min="0"
            max="3000"
          />
        </label>

        <label>
          Maximum Elo
          <input
            type="number"
            name="maxElo"
            value={formData.maxElo}
            onChange={handleChange}
            min="0"
            max="3000"
          />
        </label>

        <label>
          Trophy title
          <input
            type="text"
            name="trophyTitle"
            value={formData.trophyTitle}
            onChange={handleChange}
            maxLength="80"
            pattern="[A-Za-zÆØÅæøå0-9\s\-_:!?.]+"
            title="Only letters, numbers, spaces, and - _ : ! ? . are allowed."
          />
        </label>

        <label>
          Trophy description
          <textarea
            name="trophyDescription"
            value={formData.trophyDescription}
            onChange={handleChange}
            maxLength="500"
          />
        </label>

        <label>
          Trophy image URL
          <input
            type="url"
            name="trophyImageUrl"
            value={formData.trophyImageUrl}
            onChange={handleChange}
            maxLength="500"
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
              ? "Save Changes"
              : "Create Tournament"}
        </button>
      </form>
    </div>
  );
}

export default CreateTournament;