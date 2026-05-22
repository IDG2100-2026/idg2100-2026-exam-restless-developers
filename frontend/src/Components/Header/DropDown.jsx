import { useEffect, useState } from "react";
import "./DropDown.css";

function DropDown() {
  const [boardColor, setBoardColor] = useState(
    localStorage.getItem("boardColor") || "#facc15"
  );

  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") === "true"
  );

  const [lobbyLimit, setLobbyLimit] = useState(
    Number(localStorage.getItem("lobbyLimit")) || 5
  );

  useEffect(() => {
    localStorage.setItem("boardColor", boardColor);
  }, [boardColor]);

  useEffect(() => {
    localStorage.setItem("soundEnabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("lobbyLimit", lobbyLimit.toString());
    window.dispatchEvent(new Event("lobbyLimitChanged"));
  }, [lobbyLimit]);

  return (
    <div className="dropdown-menu">
      <h3>Settings</h3>

      <label className="dropdown-field">
        Board color
        <input
          type="color"
          value={boardColor}
          onChange={(event) => setBoardColor(event.target.value)}
        />
      </label>

      <div className="dropdown-field">
        <span>Sound</span>
        <button
          className="dropdown-button"
          onClick={() => setSoundEnabled((prev) => !prev)}
        >
          {soundEnabled ? "Disable sound" : "Enable sound"}
        </button>
      </div>

      <label className="dropdown-field">
        Lobby games: {lobbyLimit}
        <input
          type="range"
          min="5"
          max="20"
          value={lobbyLimit}
          onChange={(event) => setLobbyLimit(Number(event.target.value))}
        />
      </label>
    </div>
  );
}

export default DropDown;