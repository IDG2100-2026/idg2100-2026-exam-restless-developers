import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const API_BASE = "http://localhost:6767/api/v1";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(event) {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !password || !repeatPassword || !trimmedEmail || !dob) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    try {
      setError("");

      await axios.post(`${API_BASE}/users`, {
        username: trimmedUsername,
        password,
        email: trimmedEmail,
        dob: Number(dob),
      });

      navigate("/login");
    } catch (err) {
      const validationErrors = err.response?.data?.errors;

      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        setError(validationErrors.map((item) => item.msg).join(" "));
        return;
      }

      setError(err.response?.data?.error || "Registration failed");
    }
  }

  return (
    <main className="registration-page">
      <section className="registration-card">
        <div className="registration-copy">
          <p className="eyebrow">Create account</p>
          <h1>Registration</h1>
          <p className="lead">
            Register with a username, email, password, and date of birth. Once
            the account is created, you can log in right away.
          </p>
          <p className="lead">
            Passwords must be at least 8 characters and include uppercase,
            lowercase, numbers, and symbols.
          </p>
        </div>

        <form className="registration-form" onSubmit={handleRegister}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Date of birth
            <input
              type="number"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
              min="1900"
              max={new Date().getFullYear() - 18}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>

          <label>
            Repeat password
            <input
              type="password"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              autoComplete="new-password"
            />
          </label>

          <label className="terms-row">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(event) => setAgreeTerms(event.target.checked)}
            />
            I agree to the terms and conditions
          </label>

          <button type="submit">Register</button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </section>
    </main>
  );
}

export default Register;