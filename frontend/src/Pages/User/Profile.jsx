import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

const PROFILE_STORAGE_KEY = "profileExtrasByUser";
const API_BASE = "http://localhost:6767/api/v1";

function parseTokenPayload(token) {
  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    return JSON.parse(atob(payloadPart));
  } catch {
    return null;
  }
}

function readCurrentUser() {
  const usernameFromStorage = localStorage.getItem("currentUsername") || "";
  const userIdFromStorage = localStorage.getItem("currentUserId") || "";
  const token = localStorage.getItem("token") || "";
  const payload = parseTokenPayload(token);

  const username = usernameFromStorage || payload?.username || "";
  const uid = payload?.uid ? String(payload.uid) : "";
  const role = payload?.role || "user";

  if (!username && !userIdFromStorage && !uid) {
    return null;
  }

  return {
    username,
    userId: userIdFromStorage || uid,
    role,
  };
}

function readStoredProfile(username) {
  if (!username) {
    return null;
  }

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const allProfiles = JSON.parse(raw);
    if (!allProfiles || typeof allProfiles !== "object") {
      return null;
    }

    return allProfiles[username] || null;
  } catch {
    return null;
  }
}

function saveStoredProfile(username, data) {
  if (!username) {
    return;
  }

  let allProfiles = {};
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        allProfiles = parsed;
      }
    }
  } catch {
    allProfiles = {};
  }

  allProfiles[username] = data;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(allProfiles));
}

function Profile() {
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [form, setForm] = useState({
    email: "",
    aboutMe: "",
    newPassword: "",
    imageData: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const user = readCurrentUser();
      setCurrentUser(user);

      if (!user?.username) {
        setLoading(false);
        return;
      }

      setUsername(user.username);
      setUserId(user.userId || "");

      const stored = readStoredProfile(user.username);

      setForm({
        email: stored?.email || "",
        aboutMe: stored?.aboutMe || "",
        newPassword: "",
        imageData: stored?.imageData || "",
      });

      const userKey = user.userId || user.username;

      if (!userKey || String(userKey).startsWith("guest-")) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE}/users/${userKey}`);
        const apiUser = response.data;

        setForm((current) => ({
          ...current,
          email: apiUser.email || current.email,
          aboutMe: apiUser.aboutMe || "",
          imageData: apiUser.profileImage || "",
        }));
      } catch {
        setError("Could not load profile data from backend.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const initial = username ? username.slice(0, 1).toUpperCase() : "U";

  function handleImageChange(event) {
    const file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        imageData: String(reader.result || ""),
      }));
    };

    reader.readAsDataURL(file);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaveMessage("");
    setError("");

    if (!currentUser?.username) {
      setSaveMessage("No logged in user found.");
      return;
    }

    const userKey = userId || username;
    if (!userKey || String(userKey).startsWith("guest-")) {
      setError("Guest profiles cannot be saved to backend.");
      return;
    }

    const payload = {
      email: form.email,
      aboutMe: form.aboutMe,
      profileImage: form.imageData,
    };

    if (form.newPassword.trim()) {
      payload.password = form.newPassword.trim();
    }

    try {
      const response = await axios.put(`${API_BASE}/users/${userKey}`, payload);
      const updatedUser = response.data.user;

      saveStoredProfile(username, {
        email: updatedUser?.email || form.email,
        aboutMe: updatedUser?.aboutMe || form.aboutMe,
        imageData: updatedUser?.profileImage || form.imageData,
      });

      setForm((current) => ({
        ...current,
        email: updatedUser?.email || current.email,
        aboutMe: updatedUser?.aboutMe || current.aboutMe,
        imageData: updatedUser?.profileImage || current.imageData,
        newPassword: "",
      }));

      setSaveMessage("Profile saved to backend.");
    } catch (saveError) {
      const errors = saveError.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        setError(errors.map((item) => item.msg).join(" "));
        return;
      }

      setError(saveError.response?.data?.error || "Could not save profile.");
    }
  }

  if (loading) {
    return (
      <section className="profile-page">
        <h1>Your Profile</h1>
        <p>Loading profile...</p>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="profile-page">
        <h1>Profile</h1>
        <p>You need to log in first.</p>
        <Link to="/login" className="profile-button">
          Go to login
        </Link>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <header className="profile-header">
        <h1>Your Profile</h1>
        {error && <p className="profile-error">{error}</p>}
        {saveMessage && <p className="profile-success">{saveMessage}</p>}
      </header>

      <div className="profile-layout">
        <form className="profile-card" onSubmit={handleSave}>
          <h2>Account</h2>

          <div className="profile-avatar-wrap">
            {form.imageData ? (
              <img src={form.imageData} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">{initial}</div>
            )}

            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <label>
            Username
            <input type="text" value={username || ""} disabled />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>

          <label>
            About me
            <textarea
              rows="4"
              value={form.aboutMe}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  aboutMe: event.target.value,
                }))
              }
              placeholder="Tell other players about yourself"
            />
          </label>

          <label>
            New password
            <input
              type="password"
              value={form.newPassword}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
              placeholder="UI only for now"
            />
          </label>

          <button type="submit" className="profile-button">
            Save profile
          </button>
          <p className="profile-note">Password changes are not connected to backend yet.</p>
        </form>

        <div className="profile-info-column">
          <section className="profile-box">
            <h2>Stats</h2>
            <div className="profile-stats-grid">
              <div>
                <strong>1000</strong>
                <span>Elo (5s)</span>
              </div>
              <div>
                <strong>1000</strong>
                <span>Elo (10s)</span>
              </div>
              <div>
                <strong>1000</strong>
                <span>Elo (15s)</span>
              </div>
              <div>
                <strong>0</strong>
                <span>Total games</span>
              </div>
              <div>
                <strong>0</strong>
                <span>Wins last month</span>
              </div>
              <div>
                <strong>0</strong>
                <span>Losses last month</span>
              </div>
            </div>
          </section>

          <section className="profile-box">
            <h2>Trophies</h2>
            <ul className="profile-list">
              <li>No trophies yet</li>
            </ul>
          </section>

          <section className="profile-box">
            <h2>Last 10 games</h2>
            <p>No games yet.</p>
            <Link to="/lobby" className="profile-link">
              Browse available games
            </Link>
          </section>
        </div>
      </div>
    </section>
  );
}

export default Profile;