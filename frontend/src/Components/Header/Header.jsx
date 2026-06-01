import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import DropDown from "./DropDown.jsx";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentUsername = localStorage.getItem("currentUsername");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUsername");
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("isAdmin");
    setMenuOpen(false);
    navigate("/login");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link to="/" className="header-logo" onClick={closeMenu}>
        <div className="logo-placeholder">Logo</div>
        <span>Spanish Poker Dice</span>
      </Link>

      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? "Close" : "Menu"}
      </button>

      <div className={`header-menu ${menuOpen ? "open" : ""}`}>
        <nav className="header-nav">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/lobby" onClick={closeMenu}>Lobby</Link>
          <Link to="/tournaments" onClick={closeMenu}>Tournaments</Link>
          <Link to="/profile" onClick={closeMenu}>Profile</Link>
          {isAdmin && <Link to="/admin" onClick={closeMenu}>Admin</Link>}
        </nav>

        <div className="header-actions">
          <div className="settings-container">
            <button
              className="header-button"
              onClick={() => setShowSettings((prev) => !prev)}
            >
              Settings
            </button>

            {showSettings && <DropDown />}
          </div>

          {currentUsername ? (
            <>
              <span className="header-greeting">Hi, {currentUsername}</span>
              <button className="header-button logout" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-button" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="header-button primary" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;