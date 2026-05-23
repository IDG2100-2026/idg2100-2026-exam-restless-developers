import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./navBar.module.css";
import AppearanceControls from "../themes/AppearanceControls.jsx";

const NavBar = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/" className={styles.logo}>
          Hocus Pokus, Spanish Pokus
        </Link>
      </div>

      <div className={styles.nav_links}>
        <NavLink to="/" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`} end>
          Home
        </NavLink>
        <NavLink to="/lobby" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
          Lobby
        </NavLink>
        <NavLink to="/game/create" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
          Create game
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
          About
        </NavLink>
        <NavLink to="/aboutGame" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
          About dice
        </NavLink>
      </div>

      <div className={styles.actions}>
        <AppearanceControls />

        <div className={styles.auth}>
          {user ? (
            <div className={styles.user_greeting}>
              <span className={styles.greeting}>Hello, {user.username}</span>
              <Link to="/profile" className={styles.profileLink}>
                Profile
              </Link>
              <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.auth_links}>
              <Link to="/login" className={styles.authLink}>
                Login
              </Link>
              <Link to="/register" className={styles.authLink}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;