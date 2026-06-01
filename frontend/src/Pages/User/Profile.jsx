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

function buildProfileData(user, fallback = {}) {
  const source = user || {};
  const defaultSource = fallback || {};

  return {
    email: source.email ?? defaultSource.email ?? "",
    aboutMe: source.aboutMe ?? defaultSource.aboutMe ?? "",
    imageData: source.profileImage ?? defaultSource.imageData ?? "",
    elo: Number(source.elo ?? defaultSource.elo ?? 0),
    wins: Number(source.wins ?? defaultSource.wins ?? 0),
    losses: Number(source.losses ?? defaultSource.losses ?? 0),
    totalGames: Number(source.totalGames ?? defaultSource.totalGames ?? 0),
  };
}

function countRecentMatches(matches = [], userId = "") {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const currentUserId = String(userId);

  return matches.reduce(
    (accumulator, match) => {
      if (!match || match.status !== "finished" || !match.createdAt) {
        return accumulator;
      }

      const createdAt = new Date(match.createdAt).getTime();
      if (Number.isNaN(createdAt) || createdAt < cutoff) {
        return accumulator;
      }

      if (String(match.winner || "") === currentUserId) {
        accumulator.winsLastMonth += 1;
      }

      if (String(match.loser || "") === currentUserId) {
        accumulator.lossesLastMonth += 1;
      }

      return accumulator;
    },
    { winsLastMonth: 0, lossesLastMonth: 0 }
  );
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
  const [currentUser, setCurrentUser] = useState(() => readCurrentUser());
  const [username, setUsername] = useState(() => readCurrentUser()?.username || "");
  const [userId, setUserId] = useState(() => readCurrentUser()?.userId || "");
  const [profileData, setProfileData] = useState(() => {
    const user = readCurrentUser();
    const storedProfile = user?.username ? readStoredProfile(user.username) : null;
    return buildProfileData(storedProfile);
  });
  const [recentStats, setRecentStats] = useState({
    winsLastMonth: 0,
    lossesLastMonth: 0,
  });
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [form, setForm] = useState({
    email: profileData.email,
    aboutMe: profileData.aboutMe,
    newPassword: "",
    imageData: profileData.imageData,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const user = readCurrentUser();
      if (cancelled) {
        return;
      }

      setCurrentUser(user);

      if (!user?.username) {
        return;
      }

      setUsername(user.username);
      setUserId(user.userId || "");

      const stored = readStoredProfile(user.username);
      const storedProfile = buildProfileData(stored);

      setForm({
        email: storedProfile.email,
        aboutMe: storedProfile.aboutMe,
        newPassword: "",
        imageData: storedProfile.imageData,
      });

      setProfileData(storedProfile);

      const userKey = user.userId || user.username;

      if (!userKey || String(userKey).startsWith("guest-")) {
        return;
      }

      try {
        const userResponse = await axios.get(`${API_BASE}/users/${userKey}`);
        const apiUser = userResponse.data;
        const apiProfile = buildProfileData(apiUser, storedProfile);

        setForm((current) => ({
          ...current,
          email: apiProfile.email,
          aboutMe: apiProfile.aboutMe,
          imageData: apiProfile.imageData,
        }));
        setProfileData(apiProfile);

        try {
          const matchesResponse = await axios.get(`${API_BASE}/matches`);
          setRecentStats(countRecentMatches(matchesResponse.data, userKey));
        } catch {
          setRecentStats({ winsLastMonth: 0, lossesLastMonth: 0 });
        }
      } catch {
        setError("Could not load profile data from backend.");
      }
    }

    loadProfile();

    function handleFocus() {
      loadProfile();
    }

    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleFocus);
    };
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
      const updatedProfile = buildProfileData(updatedUser, profileData);

      saveStoredProfile(username, {
        email: updatedProfile.email,
        aboutMe: updatedProfile.aboutMe,
        imageData: updatedProfile.imageData,
      });

      setForm((current) => ({
        ...current,
        email: updatedProfile.email,
        aboutMe: updatedProfile.aboutMe,
        imageData: updatedProfile.imageData,
        newPassword: "",
      }));

      setProfileData(updatedProfile);

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
              placeholder="Leave blank to keep your current password"
            />
          </label>

          <button type="submit" className="profile-button">
            Save profile
          </button>
          <p className="profile-note">Password changes are sent to the backend when you save the profile.</p>
        </form>

        <div className="profile-info-column">
          <section className="profile-box">
            <h2>Stats</h2>
            <div className="profile-stats-grid">
              <div>
                <strong>{profileData.elo}</strong>
                <span>Elo</span>
              </div>
              <div>
                <strong>{profileData.totalGames}</strong>
                <span>Total games</span>
              </div>
              <div>
                <strong>{profileData.wins}</strong>
                <span>Wins</span>
              </div>
              <div>
                <strong>{profileData.losses}</strong>
                <span>Losses</span>
              </div>
              <div>
                <strong>{recentStats.winsLastMonth}</strong>
                <span>Wins last month</span>
              </div>
              <div>
                <strong>{recentStats.lossesLastMonth}</strong>
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