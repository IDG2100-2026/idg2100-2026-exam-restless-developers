import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:6767/api/v1/users/login",
        {
          username: username.trim(),
          password,
        }
      );

      const user = res.data.user;

      localStorage.setItem("token", res.data.token);

      const idToStore = user.id;

      localStorage.setItem("currentUserId", idToStore);
      localStorage.setItem("currentUsername", user.username);

      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
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

        <div>
          <button type="submit">Log in</button>

          <button
            type="button"
            onClick={() => {
              const guestId = "guest-" + Date.now();

              localStorage.setItem("currentUserId", guestId);
              localStorage.setItem("currentUsername", "Guest");

              navigate("/profile");
            }}
          >
            Continue as Guest
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </main>
  );
}

export default Login;