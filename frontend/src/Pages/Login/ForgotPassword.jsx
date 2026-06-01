import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:6767/api/v1";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setDevLink("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/users/forgot-password`, {
        email: email.trim(),
      });

      setMessage(res.data.message || "Reset request submitted.");
      if (res.data.resetLink) {
        setDevLink(res.data.resetLink);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit request");
    }
  }

  return (
    <main>
      <h1>Forgot password</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-label="email"
          />
        </label>

        <div>
          <button type="submit">Send reset code</button>
        </div>
      </form>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {devLink && (
        <p>
          Dev link: <a href={devLink}>{devLink}</a>
        </p>
      )}

      <p>
        Remembered your password? <Link to="/login">Back to login</Link>
      </p>
    </main>
  );
}

export default ForgotPassword;
