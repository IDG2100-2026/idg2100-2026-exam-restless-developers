import { useEffect, useState } from "react";
import "./AppearanceDropdown.css";

function AppearanceDropdown() {
  const [boardColor, setBoardColor] = useState(
    localStorage.getItem("boardColor") || "#f5c542"
  );

  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") === "true"
  );

  const [lobbyLimit, setLobbyLimit] = useState(
    Number(localStorage.getItem("lobbyLimit")) || 10
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

  function handleSoundToggle() {
    setSoundEnabled((prev) => !prev);
  }

  function handleLobbyChange(event) {
    setLobbyLimit(Number(event.target.value));
  }

  return (
    <div className="appearance-dropdown">
      <h3>Settings</h3>

      <div className="dropdown-section">
        <p>Board color</p>
        <input
          type="color"
          value={boardColor}
          onChange={(event) => setBoardColor(event.target.value)}
        />
      </div>

      <div className="dropdown-section">
        <p>Sound</p>
        <button onClick={handleSoundToggle}>
          {soundEnabled ? "Disable sound" : "Enable sound"}
        </button>
      </div>

      <div className="dropdown-section">
        <p>Lobby games: {lobbyLimit}</p>
        <input
          type="range"
          min="5"
          max="20"
          value={lobbyLimit}
          onChange={handleLobbyChange}
        />
      </div>
    </div>
  );
}

export default AppearanceDropdown;