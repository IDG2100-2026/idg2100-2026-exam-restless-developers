import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QDice from "../assets/Q.svg";
import ADice from "../assets/A.svg";
import KDice from "../assets/K.svg";
import "./RegistrationPage.css";

function RegistrationPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      const response = await axios.post("http://localhost:3000/api/v1/users", {
        username,
        email,
        password,
        age: Number(age),
        role: "user",
      });

      const createdUser = response.data.user || response.data;

      localStorage.setItem("currentUserId", createdUser._id);
      localStorage.setItem("currentUsername", createdUser.username);

      navigate("/");
    } catch (error) {
      console.error("Could not register user:", error);
      setErrorMessage(
        error.response?.data?.error || "Could not register user."
      );
    }
  }

return (
  <main className="registration-page">
    <div className="registration-card">
      <div className="registration-dice-row" aria-hidden="true">
        <img src={KDice} alt="" className="registration-dice" />
        <img src={QDice} alt="" className="registration-dice" />
        <img src={ADice} alt="" className="registration-dice" />
      </div>

      <h1>Register</h1>

      <form className="registration-form" onSubmit={handleSubmit}>
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
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <label>
          Age
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="18"
            required
          />
        </label>

        <button type="submit">Register</button>

        {errorMessage && <p className="registration-error">{errorMessage}</p>}
      </form>
    </div>
  </main>
);
}

export default RegistrationPage;