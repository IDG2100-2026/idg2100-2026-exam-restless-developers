import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

import KQJDiceImage from "../assets/KQJ.svg";
import EightA7DiceImage from "../assets/8A7.svg";

function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const response = await axios.get("http://localhost:3000/api/v1/users");
      const users = response.data.users;

      const foundUser = users.find(
        (user) => user.username.toLowerCase() === username.toLowerCase()
      );

      if (!foundUser) {
        setErrorMessage("User not found.");
        return;
      }

      localStorage.setItem("currentUserId", foundUser._id);
      localStorage.setItem("currentUsername", foundUser.username);

      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMessage("Login failed.");
    }
  }

  async function handleGuestLogin() {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/users");
      const users = response.data.users;
      const guestUser = users.find((user) => user.role === "anonymous");

      if (!guestUser) {
        setErrorMessage("Guest user not found.");
        return;
      }

      localStorage.setItem("currentUserId", guestUser._id);
      localStorage.setItem("currentUsername", guestUser.username);

      navigate("/");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not login as guest.");
    }
  }

  return (
    <main className="login-page">
      <div className="login-layout">

        {/* VENSTRE BILDE */}
        <img
          src={KQJDiceImage}
          alt="Dice left"
          className="login-image-left"
        />

        {/* LOGIN-KORT */}
        <div className="login-card">
          <h1>Login</h1>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit">Log in</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>

          <p>
            Don’t have a user? <Link to="/register">Register</Link>
          </p>
          <p>Or</p>

          <button
            type="button"
            className="guest-button"
            onClick={handleGuestLogin}
          >
            Continue as guest
          </button>
        </div>

        {/* HØYRE BILDE */}
        <img
          src={EightA7DiceImage}
          alt="Dice right"
          className="login-image-right"
        />

      </div>
    </main>
  );
}

export default LoginPage;