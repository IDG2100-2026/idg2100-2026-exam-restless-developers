import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:6767/api/v1";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const initialCode = useMemo(() => searchParams.get("code") || "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim() || !code.trim() || !newPassword) {
      setError("Please complete all fields");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/users/reset-password`, {
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });

      setMessage(res.data.message || "Password reset successful");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Could not reset password");
    }
  }

  return (
    <main>
      <h1>Reset password</h1>

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

        <label>
          Reset code
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            aria-label="reset code"
          />
        </label>

        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            aria-label="new password"
          />
        </label>

        <div>
          <button type="submit">Reset password</button>
        </div>
      </form>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </main>
  );
}

export default ResetPassword;