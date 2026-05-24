import { useEffect, useMemo, useState } from "react";
import styles from "./AppearanceControls.module.css";

const STORAGE_KEY = "appearancePreferences";

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const boardColorOptions = [
  { value: "sand", label: "Sand", color: "#d6a65d" },
  { value: "sea", label: "Sea", color: "#4e8fbc" },
  { value: "forest", label: "Forest", color: "#4c8b68" },
  { value: "ember", label: "Ember", color: "#c55b3d" },
];

const defaultPreferences = {
  theme: "light",
  boardColor: "sand",
  soundOn: true,
  lobbyCount: 5,
};

const boardColorMap = boardColorOptions.reduce((accumulator, option) => {
  accumulator[option.value] = option.color;
  return accumulator;
}, {});

function readPreferences() {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function writePreferences(preferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function applyPreferences(preferences) {
  const root = document.documentElement;
  root.dataset.theme = preferences.theme;
  root.style.setProperty("--board-color", boardColorMap[preferences.boardColor] || boardColorMap.sand);
}

const AppearanceControls = () => {
  const initialPreferences = useMemo(() => readPreferences(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState(initialPreferences);

  useEffect(() => {
    applyPreferences(preferences);
    writePreferences(preferences);
  }, [preferences]);

  const updatePreference = (name, value) => {
    setPreferences((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className={styles.appearance}>
      <button
        type="button"
        className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ""}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        <span className={styles.toggleIcon} aria-hidden="true">
          <span className={styles.toggleOrb} />
        </span>
        <span className={styles.toggleText}>Appearance</span>
        <span className={styles.toggleArrow} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className={styles.panel} role="group" aria-label="Appearance settings">
          <div className={styles.group}>
            <span className={styles.groupLabel}>Theme</span>
            <div className={styles.buttonRow}>
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.chip} ${preferences.theme === option.value ? styles.chipActive : ""}`}
                  onClick={() => updatePreference("theme", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.groupLabel}>Board color</span>
            <div className={styles.colorGrid}>
              {boardColorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.colorSwatch} ${preferences.boardColor === option.value ? styles.colorSwatchActive : ""}`}
                  title={option.label}
                  aria-label={option.label}
                  style={{ backgroundColor: option.color }}
                  onClick={() => updatePreference("boardColor", option.value)}
                />
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={styles.groupLabel}>Sound</span>
            <button
              type="button"
              className={`${styles.chip} ${preferences.soundOn ? styles.chipActive : ""}`}
              onClick={() => updatePreference("soundOn", !preferences.soundOn)}
            >
              {preferences.soundOn ? "On" : "Off"}
            </button>
          </div>

          <div className={styles.group}>
            <label className={styles.groupLabel} htmlFor="lobby-count">
              Lobby games shown: {preferences.lobbyCount}
            </label>
            <input
              id="lobby-count"
              className={styles.slider}
              type="range"
              min="3"
              max="12"
              step="1"
              value={preferences.lobbyCount}
              onChange={(event) => updatePreference("lobbyCount", Number(event.target.value))}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AppearanceControls;