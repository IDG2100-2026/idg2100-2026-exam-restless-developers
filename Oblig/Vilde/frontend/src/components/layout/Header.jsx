import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../../contexts/ThemeContext";
import AppearanceDropdown from "../AppearanceDropdown.jsx";
import "./Header.css";

function Header() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUsername, setCurrentUsername] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("currentUsername") || "";
    const savedUserId = localStorage.getItem("currentUserId") || "";

    setCurrentUsername(savedUsername);
    setCurrentUserId(savedUserId);
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUsername");

    setCurrentUsername("");
    setCurrentUserId("");
    setShowSettings(false);

    navigate("/login");
  }

  return (
    <header className="header-header">
      <nav className="header-nav-bar">
        <div className="header-left">
          <Link to="/">Home</Link>
          <Link to="/lobby">Lobby</Link>
          <Link to="/create">Create Match</Link>
        </div>

        <div className="header-right">
          <button className="theme-toggle-button" onClick={toggleTheme}>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          {currentUsername ? (
            <>
              <span className="header-greeting">Hello, {currentUsername}</span>

              <Link to={`/profile/${currentUserId}`} className="profile-button">
                Profile
              </Link>

              <button className="logout-button" onClick={handleLogout}>
                Log out
              </button>

              <div className="settings-wrapper">
                <button
                  className="settings-toggle"
                  onClick={() => setShowSettings((prev) => !prev)}
                >
                  Settings
                </button>

                {showSettings && <AppearanceDropdown />}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;