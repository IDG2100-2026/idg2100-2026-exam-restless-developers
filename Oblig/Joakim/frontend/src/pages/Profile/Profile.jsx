import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMatches } from "../../api.js";
import styles from "./Profile.module.css";

const PROFILE_STORAGE_KEY = "profileExtrasByUser";

function readCurrentUser() {
    try {
        const raw = window.localStorage.getItem("user");
        if (!raw) {
            return null;
        }

        const user = JSON.parse(raw);
        return user;
    } catch (error) {
        console.log("Could not read current user:", error);
        return null;
    }
}

function formatVariant(variant) {
    if (!variant) {
        return "Unknown variant";
    }

    const rounds = variant.rounds || "?";
    const straights = variant.straightsAllowed ? "Straights" : "No straights";
    const timeControl = variant.timeControl || "?";
    const formatted = `Bo${rounds}, ${straights}, ${timeControl}s`;
    return formatted;
}

function getMatchDate(match) {
    if (match && match.endedAt) {
        return match.endedAt;
    }

    if (match && match.updatedAt) {
        return match.updatedAt;
    }

    if (match && match.createdAt) {
        return match.createdAt;
    }

    return "";
}

function formatDate(dateString) {
    if (!dateString) {
        return "Unknown date";
    }

    try {
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return "Unknown date";
        }

        return date.toLocaleDateString();
    } catch (error) {
        console.log("Could not format date:", error);
        return "Unknown date";
    }
}

function isSameUser(uidFromMatch, currentUser) {
    if (!uidFromMatch) {
        return false;
    }

    if (!currentUser) {
        return false;
    }

    const currentUid = currentUser.uid;
    const currentUserId = currentUser.userId;

    if (currentUid && Number(uidFromMatch) === Number(currentUid)) {
        return true;
    }

    if (currentUserId && Number(uidFromMatch) === Number(currentUserId)) {
        return true;
    }

    return false;
}

function isCurrentUserInMatch(player, currentUser) {
    if (!player) {
        return false;
    }

    if (!currentUser) {
        return false;
    }

    if (player.isAnonymous) {
        return false;
    }

    const playerUsername = player.userId && player.userId.username;
    const currentUsername = currentUser.username;
    if (playerUsername && currentUsername && playerUsername === currentUsername) {
        return true;
    }

    const playerUid = player.userId && player.userId.uid;
    if (playerUid && isSameUser(playerUid, currentUser)) {
        return true;
    }

    return false;
}

function isCurrentUserWinner(match, currentUser) {
    if (!match) {
        return false;
    }

    if (!match.winner) {
        return false;
    }

    if (!currentUser) {
        return false;
    }

    const winner = match.winner;

    if (winner.username && currentUser.username && winner.username === currentUser.username) {
        return true;
    }

    if (winner.uid && isSameUser(winner.uid, currentUser)) {
        return true;
    }

    return false;
}

function isCurrentUserLoser(match, currentUser) {
    if (!match) {
        return false;
    }

    if (!match.loser) {
        return false;
    }

    if (!currentUser) {
        return false;
    }

    const loser = match.loser;

    if (loser.username && currentUser.username && loser.username === currentUser.username) {
        return true;
    }

    if (loser.uid && isSameUser(loser.uid, currentUser)) {
        return true;
    }

    return false;
}

function getEloFromMatches(userMatches, currentUser) {
    for (let i = 0; i < userMatches.length; i = i + 1) {
        const match = userMatches[i];

        if (!match || !match.players) {
            continue;
        }

        if (!Array.isArray(match.players)) {
            continue;
        }

        for (let j = 0; j < match.players.length; j = j + 1) {
            const player = match.players[j];

            if (!isCurrentUserInMatch(player, currentUser)) {
                continue;
            }

            const playerData = player.userId;
            if (!playerData) {
                continue;
            }

            const elo = Number(playerData.elo);
            if (Number.isFinite(elo)) {
                return elo;
            }
        }
    }

    return 1200;
}

function getStoredProfileData(username) {
    if (!username) {
        return null;
    }

    try {
        const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        const all = JSON.parse(raw);
        if (!all) {
            return null;
        }

        if (typeof all !== "object") {
            return null;
        }

        const userProfileData = all[username];
        return userProfileData || null;
    } catch (error) {
        console.log("Could not get stored profile data:", error);
        return null;
    }
}

function saveProfileData(username, profileData) {
    if (!username) {
        return;
    }

    let allProfileData = {};
    try {
        const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                allProfileData = parsed;
            }
        }
    } catch (error) {
        console.log("Could not parse stored profile data:", error);
        allProfileData = {};
    }

    allProfileData[username] = profileData;

    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(allProfileData));
}

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [userMatches, setUserMatches] = useState([]);
    const [stats, setStats] = useState({
        elo5: 1200,
        elo10: 1200,
        elo15: 1200,
        totalGames: 0,
        winsLastMonth: 0,
        lossesLastMonth: 0,
    });
    const [profileForm, setProfileForm] = useState({
        email: "",
        aboutMe: "",
        newPassword: "",
        imageData: "",
    });

    useEffect(() => {
        async function loadProfileData() {
            setLoading(true);
            setError("");

            const user = readCurrentUser();
            setCurrentUser(user);

            if (!user) {
                setLoading(false);
                return;
            }

            const storedExtras = getStoredProfileData(user.username);
            setProfileForm({
                email: storedExtras?.email || user.email || "",
                aboutMe: storedExtras?.aboutMe || "",
                newPassword: "",
                imageData: storedExtras?.imageData || "",
            });

            try {
                const matches = await getMatches();
                const list = Array.isArray(matches) ? matches : [];

                const mine = [];
                for (let i = 0; i < list.length; i = i + 1) {
                    const match = list[i];
                    if (!Array.isArray(match?.players)) {
                        continue;
                    }

                    let include = false;
                    for (let j = 0; j < match.players.length; j = j + 1) {
                        if (isCurrentUserInMatch(match.players[j], user)) {
                            include = true;
                            break;
                        }
                    }

                    if (include) {
                        mine.push(match);
                    }
                }

                mine.sort((a, b) => {
                    const dateA = new Date(getMatchDate(a)).getTime();
                    const dateB = new Date(getMatchDate(b)).getTime();
                    return dateB - dateA;
                });

                setUserMatches(mine);

                const baseElo = getEloFromMatches(mine, user);
                const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                let winsLastMonth = 0;
                let lossesLastMonth = 0;

                for (let i = 0; i < mine.length; i = i + 1) {
                    const match = mine[i];
                    const matchDate = new Date(getMatchDate(match)).getTime();
                    if (!Number.isFinite(matchDate) || matchDate < oneMonthAgo) {
                        continue;
                    }

                    if (isCurrentUserWinner(match, user)) {
                        winsLastMonth = winsLastMonth + 1;
                    }

                    if (isCurrentUserLoser(match, user)) {
                        lossesLastMonth = lossesLastMonth + 1;
                    }
                }

                setStats({
                    elo5: baseElo,
                    elo10: baseElo,
                    elo15: baseElo,
                    totalGames: mine.length,
                    winsLastMonth,
                    lossesLastMonth,
                });
            } catch (err) {
                setError("Could not load profile stats from matches.");
                setUserMatches([]);
            } finally {
                setLoading(false);
            }
        }

        loadProfileData();
    }, []);

    function handleImageChange(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setProfileForm((current) => ({ ...current, imageData: String(reader.result || "") }));
        };
        reader.readAsDataURL(file);
    }

    function handleSaveProfile(event) {
        event.preventDefault();
        setSaveMessage("");

        if (!currentUser?.username) {
            setSaveMessage("No logged-in user found.");
            return;
        }

        const extras = {
            email: profileForm.email,
            aboutMe: profileForm.aboutMe,
            imageData: profileForm.imageData,
        };

        saveProfileData(currentUser.username, extras);

        const newLocalUser = {
            ...currentUser,
            email: profileForm.email,
        };
        window.localStorage.setItem("user", JSON.stringify(newLocalUser));
        setCurrentUser(newLocalUser);

        setProfileForm((current) => ({ ...current, newPassword: "" }));
        setSaveMessage("Profile saved locally.");
    }

    function getRecentGameResult(match) {
        if (isCurrentUserWinner(match, currentUser)) {
            return "Win";
        }

        if (isCurrentUserLoser(match, currentUser)) {
            return "Loss";
        }

        return "In progress";
    }

    const recentMatches = userMatches.slice(0, 10);
    const trophies = [];

    if (stats.totalGames > 0) {
        trophies.push("First Match Played");
    }
    if (stats.winsLastMonth >= 1) {
        trophies.push("Monthly Winner");
    }
    if (trophies.length === 0) {
        trophies.push("No trophies yet");
    }

    if (loading) {
        return <p className={styles.loading}>Loading profile...</p>;
    }

    if (!currentUser) {
        return (
            <section className={styles.page}>
                <h1>Profile</h1>
                <p>You need to log in first.</p>
                <Link to="/login" className={styles.primaryButton}>
                    Go to login
                </Link>
            </section>
        );
    }

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <h1>Profile</h1>
                {error ? <p className={styles.error}>{error}</p> : null}
                {saveMessage ? <p className={styles.success}>{saveMessage}</p> : null}
            </header>

            <div className={styles.layout}>
                <form className={styles.profileCard} onSubmit={handleSaveProfile}>
                    <h2>Account</h2>

                    <div className={styles.avatarWrap}>
                        {profileForm.imageData ? (
                            <img src={profileForm.imageData} alt="Profile" className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>{currentUser.username?.slice(0, 1)?.toUpperCase() || "U"}</div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    <label>
                        Username
                        <input type="text" value={currentUser.username || ""} disabled />
                    </label>

                    <label>
                        Email
                        <input
                            type="email"
                            value={profileForm.email}
                            onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                        />
                    </label>

                    <label>
                        About me
                        <textarea
                            rows="4"
                            value={profileForm.aboutMe}
                            onChange={(event) => setProfileForm((current) => ({ ...current, aboutMe: event.target.value }))}
                            placeholder="Tell other players about yourself"
                        />
                    </label>

                    <label>
                        New password
                        <input
                            type="password"
                            value={profileForm.newPassword}
                            onChange={(event) => setProfileForm((current) => ({ ...current, newPassword: event.target.value }))}
                            placeholder="Leave empty to keep old password"
                        />
                    </label>

                    <button type="submit" className={styles.primaryButton}>Save profile</button>
                    <p className={styles.note}>Password field is UI-only in this sprint.</p>
                </form>

                <div className={styles.infoColumn}>
                    <section className={styles.card}>
                        <h2>Stats</h2>
                        <div className={styles.statsGrid}>
                            <div><strong>{stats.elo5}</strong><span>Elo (5s)</span></div>
                            <div><strong>{stats.elo10}</strong><span>Elo (10s)</span></div>
                            <div><strong>{stats.elo15}</strong><span>Elo (15s)</span></div>
                            <div><strong>{stats.totalGames}</strong><span>Total games</span></div>
                            <div><strong>{stats.winsLastMonth}</strong><span>Wins last month</span></div>
                            <div><strong>{stats.lossesLastMonth}</strong><span>Losses last month</span></div>
                        </div>
                    </section>

                    <section className={styles.card}>
                        <h2>Trophies</h2>
                        <ul className={styles.simpleList}>
                            {trophies.map((trophy) => (
                                <li key={trophy}>{trophy}</li>
                            ))}
                        </ul>
                    </section>

                    <section className={styles.card}>
                        <h2>Last 10 games</h2>
                        {recentMatches.length === 0 ? <p>No games yet.</p> : null}
                        <ul className={styles.simpleList}>
                            {recentMatches.map((match) => (
                                <li key={match._id}>
                                    <span>{formatDate(getMatchDate(match))}</span>
                                    <span>{formatVariant(match.variant)}</span>
                                    <strong>{getRecentGameResult(match)}</strong>
                                </li>
                            ))}
                        </ul>
                        <Link to="/lobby" className={styles.inlineLink}>View all games</Link>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default Profile;
