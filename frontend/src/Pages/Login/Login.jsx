import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_BASE = "http://localhost:6767/api/v1";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/users/login`, {
        username: username.trim(),
        password,
      });

      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("currentUserId", user.id);
      localStorage.setItem("currentUsername", user.username);

      const tokenPayload = JSON.parse(atob(res.data.token.split(".")[1]));
      localStorage.setItem("isAdmin", String(tokenPayload?.role === "admin"));

      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
   <main className="login-page">
  <section className="login-card">
    <div className="login-copy">
      <p className="eyebrow">Welcome back</p>
      <h1>Login</h1>
      <p className="lead">
        Log in with your username and password to access your profile and tournaments.
      </p>
    </div>

    <form className="login-form" onSubmit={handleSubmit}>
      <label>
        Username
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="username"
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="password"
        />
      </label>

      <div className="login-buttons">
        <button type="submit">Log in</button>

        <button
          type="button"
          className="guest-button"
          onClick={() => {
            const guestId = "guest-" + Date.now();

            localStorage.removeItem("token");
            localStorage.setItem("isAdmin", "false");

            localStorage.setItem("currentUserId", guestId);
            localStorage.setItem("currentUsername", "Guest");

            navigate("/profile");
          }}
        >
          Continue as Guest
        </button>
      </div>

      <div className="login-links">
        <p>
          No account yet? <Link to="/register">Register here</Link>
        </p>

        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}
    </form>
  </section>
</main>
  );
}

export default Login;