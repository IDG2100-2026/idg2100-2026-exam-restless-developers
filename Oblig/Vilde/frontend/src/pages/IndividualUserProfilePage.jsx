import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./IndividualUserProfilePage.css";

function IndividualUserProfilePage() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    age: "",
    aboutMe: "",
    profileImage: "",
    password: "",
  });

    const currentUserId = localStorage.getItem("currentUserId");
    const currentUsername = localStorage.getItem("currentUsername");

    const isOwnProfile = String(currentUserId) === String(id);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  async function fetchUserProfile() {
    setLoading(true);
    setErrorMessage("");
    setSaveMessage("");

    try {
      const userResponse = await axios.get(
        `http://localhost:3000/api/v1/users/${id}`
      );

      const userData = userResponse.data;
      setUser(userData);

      setFormData({
        email: userData.email || "",
        age: userData.age || "",
        aboutMe: userData.aboutMe || "",
        profileImage: userData.profileImage || "",
        password: "",
      });

      await fetchRecentMatches(userData.playedMatches || []);
    } catch (error) {
      console.error("Could not fetch user:", error);
      setErrorMessage("Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecentMatches(playedMatches) {
    if (!playedMatches.length) {
      setMatches([]);
      return;
    }

    setMatchesLoading(true);

    try {
      const recentMatchIds = playedMatches.slice(-10).reverse();

      const matchResponses = await Promise.all(
        recentMatchIds.map((matchId) =>
          axios.get(`http://localhost:3000/api/v1/matches/${matchId}`)
        )
      );

      setMatches(matchResponses.map((response) => response.data));
    } catch (error) {
      console.error("Could not fetch matches:", error);
      setMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleEditToggle() {
    setIsEditing(true);
    setSaveMessage("");
    setErrorMessage("");
  }

  function handleCancelEdit() {
    if (!user) return;

    setFormData({
      email: user.email || "",
      age: user.age || "",
      aboutMe: user.aboutMe || "",
      profileImage: user.profileImage || "",
      password: "",
    });

    setIsEditing(false);
    setSaveMessage("");
    setErrorMessage("");
  }

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSaveMessage("");

    try {
      const payload = {
        email: formData.email,
        age: Number(formData.age),
        aboutMe: formData.aboutMe,
        profileImage: formData.profileImage,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const response = await axios.put(
        `http://localhost:3000/api/v1/users/${id}`,
        payload
      );

      setUser(response.data);
      setIsEditing(false);
      setSaveMessage("Profile updated successfully.");

      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } catch (error) {
      console.error("Could not update user:", error);
      setErrorMessage("Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="profile-page">
        <h1 className="profile-page-title">Loading profile...</h1>
      </main>
    );
  }

  if (errorMessage && !user) {
    return (
      <main className="profile-page">
        <h1 className="profile-page-title">{errorMessage}</h1>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <h1 className="profile-page-title">User not found</h1>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-image-wrapper">
          <img
            src={user.profileImage || "/default-user.png"}
            alt={`${user.username} profile`}
            className="profile-image"
            onError={(e) => {
                e.currentTarget.src = "/default-user.png";
            }}
          />
        </div>

        <div className="profile-hero-text">
        <h1 className="profile-page-title">{user.username}'s Profile</h1>
        <p className="profile-role">{user.role}</p>

        {!isEditing && (
            <div className="profile-top-actions">
            {isOwnProfile && (
                <button className="profile-button" onClick={handleEditToggle}>
                Edit profile
                </button>
            )}
            </div>
        )}
        </div>
      </section>

      {errorMessage && <p className="profile-message profile-error">{errorMessage}</p>}
      {saveMessage && <p className="profile-message profile-success">{saveMessage}</p>}

      <section className="profile-grid">
        <section className="profile-card">
          <h2>Profile information</h2>

          {isEditing ? (
            <form className="profile-form" onSubmit={handleSave}>
              <label className="profile-label">
                Profile image URL
                <input
                  className="profile-input"
                  type="text"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  placeholder="Paste image URL here"
                />
              </label>

              <label className="profile-label">
                Email
                <input
                  className="profile-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </label>

              <label className="profile-label">
                Age
                <input
                  className="profile-input"
                  type="number"
                  name="age"
                  min="18"
                  value={formData.age}
                  onChange={handleChange}
                />
              </label>

              <label className="profile-label">
                About me
                <textarea
                  className="profile-textarea"
                  name="aboutMe"
                  rows="5"
                  maxLength="500"
                  value={formData.aboutMe}
                  onChange={handleChange}
                  placeholder="Tell other players a little about yourself"
                />
              </label>

              <label className="profile-label">
                New password
                <input
                  className="profile-input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave empty to keep current password"
                />
              </label>

              <div className="profile-form-actions">
                <button className="profile-button" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>

                <button
                  className="profile-button profile-button-secondary"
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-list">
              <p>
                <strong>Username:</strong> {user.username}
              </p>

              {isOwnProfile && (
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              )}

              <p>
                <strong>Age:</strong> {user.age}
              </p>

              <p>
                <strong>Elo:</strong> {user.elo}
              </p>

              <p>
                <strong>Wins:</strong> {user.stats?.wins ?? 0}
              </p>

              <p>
                <strong>Losses:</strong> {user.stats?.losses ?? 0}
              </p>

              <p>
                <strong>Wins (last month):</strong> {user.winsLastMonth ?? 0}
                </p>

                <p>
                <strong>Losses (last month):</strong> {user.lossesLastMonth ?? 0}
                </p>

              <p>
                <strong>Games played:</strong> {user.playedMatches?.length ?? 0}
                </p>
              <p>
                <strong>About me:</strong>{" "}
                {user.aboutMe?.trim() ? user.aboutMe : "No description added yet."}
              </p>
            </div>
          )}
        </section>

        <section className="profile-card">
          <h2>Trophies</h2>

          {user.trophies?.length > 0 ? (
            <div className="trophy-list">
              {user.trophies.map((trophy, index) => (
                <div className="trophy-card" key={index}>
                  <img
                    className="trophy-image"
                    src={trophy.image || "/default-trophy.jpg"}
                    alt={trophy.title || "Trophy"}
                    onError={(e) => {
                        e.currentTarget.src = "/default-trophy.jpg";
                    }}
                  />
                  <p className="trophy-title">{trophy.title || "Unnamed trophy"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No trophies yet.</p>
          )}
        </section>
      </section>

      <section className="profile-card">
        <h2>Recent games</h2>

        {matchesLoading ? (
          <p>Loading recent games...</p>
        ) : matches.length === 0 ? (
          <p>No games played yet.</p>
        ) : (
          <div className="recent-games-list">
            {matches.map((match) => (
              <div className="profile-match-card" key={match._id}>
                <p>
                  <strong>Variant:</strong> {match.category?.label || "Unknown"}
                </p>
                <p>
                  <strong>Players:</strong>{" "}
                  {match.players?.map((player) => player.username).join(" vs ") ||
                    "Unknown players"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {match.endedAt ? "Finished" : "In progress"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default IndividualUserProfilePage;