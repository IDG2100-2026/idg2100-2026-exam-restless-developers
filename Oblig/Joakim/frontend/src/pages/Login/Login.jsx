import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api.js";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await loginUser({ username, password });
      
      // store user data in localStorage
      const userData = {
        userId: response.user._id || response.user.id,
        username: response.user.username,
        email: response.user.email
      };
      localStorage.setItem("user", JSON.stringify(userData));
      
      setMessage("Login successful!");
      navigate("/");
    } catch (error) {
      setMessage(error.message || "Login failed");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Login</button>
      </form>

      <div>
        <Link to="/forgot-password">Forgot password?</Link>
      </div>

      {message && <p>{message}</p>}

      <div>
        <Link to="/register">Don't have an account? Register here.</Link>
      </div>
    </div>
  );
};

export default Login;