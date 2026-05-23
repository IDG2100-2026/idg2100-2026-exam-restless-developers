import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api.js";
import Style from "./Registration.module.css";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const result = await createUser({ username, password, email, dob: Number(dob) });
      console.log("Registration successful:", result);

      const userData = {
        userId: result.newUserUID || result.user?.id,
        username: username,
        email: email,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/");
    } catch (err) {
      console.log("ERROR RAW:", err);
      console.log("ERROR RESPONSE:", err.response?.data);
      setError(err.response?.data || err.message);
    }
  };

  return (
    <div className={Style.registration}>
      <h1>Registration</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          Repeat password:
          <input
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Date of Birth:
          <input
            type="number"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </label>
        <label className={Style.checkboxRow}>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          I agree to the terms and conditions
        </label>
        <button type="submit">Register</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default Registration;