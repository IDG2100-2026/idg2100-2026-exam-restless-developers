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
    window.dispatchEvent(new Event("boardColorChanged"));
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

      <div className="dropdown-field">
        <span>Board color</span>
        <div className="color-swatches">
          {[
            { color: "#facc15", label: "Yellow" },
            { color: "#22c55e", label: "Green" },
            { color: "#3b82f6", label: "Blue" },
            { color: "#ef4444", label: "Red" },
            { color: "#a855f7", label: "Purple" },
            { color: "#f97316", label: "Orange" },
          ].map(({ color, label }) => (
            <button
              key={color}
              className={`color-swatch${boardColor === color ? " color-swatch--active" : ""}`}
              style={{ background: color }}
              title={label}
              onClick={() => setBoardColor(color)}
            />
          ))}
        </div>
      </div>

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