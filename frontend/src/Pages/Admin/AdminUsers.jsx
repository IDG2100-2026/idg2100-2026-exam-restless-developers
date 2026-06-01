import { useEffect, useState } from "react";
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("http://localhost:6767/api/v1/users");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not fetch users");
        }

        setUsers(data);
      } catch (error) {
        setError(error.message);
      }
    }

    fetchUsers();
  }, []);

  async function handleRoleToggle(user) {
    const nextRole = user.role === "admin" ? "user" : "admin";
    const userIdentifier = user.uid || user._id;

    setError("");
    setUpdatingUserId(userIdentifier);

    try {
      const response = await fetch(
        `http://localhost:6767/api/v1/users/${userIdentifier}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: nextRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Could not update user");
      }

      setUsers((previousUsers) =>
        previousUsers.map((currentUser) =>
          (currentUser.uid || currentUser._id) === userIdentifier
            ? data.user
            : currentUser
        )
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleBanToggle(user) {
  const userIdentifier = user.uid || user._id;

  setError("");
    setUpdatingUserId(userIdentifier);

    try {
        const response = await fetch(
        `http://localhost:6767/api/v1/users/${userIdentifier}`,
        {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
            isBanned: !user.isBanned,
            }),
        }
        );

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.message || data.error || "Could not update user");
        }

        setUsers((previousUsers) =>
        previousUsers.map((currentUser) =>
            (currentUser.uid || currentUser._id) === userIdentifier
            ? data.user
            : currentUser
        )
        );
    } catch (error) {
        setError(error.message);
    } finally {
        setUpdatingUserId(null);
    }
    }

  const filteredUsers = users.filter((user) => {
    const search = searchValue.toLowerCase();

    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  });

  return (
    <main className="admin-dashboard-page">
      <h1>User Administration</h1>

      <p>Search users and manage administrator permissions.</p>

      <section className="admin-card admin-search-section">
        <label className="admin-search-label">
          Search users
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by username, email, or role"
          />
        </label>
      </section>

      {error && <p className="admin-page-error">{error}</p>}

      <section className="admin-card">
        <h2>Users</h2>

        {filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Elo</th>
                  <th>Total games</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const userIdentifier = user.uid || user._id;
                  const isUpdating = updatingUserId === userIdentifier;

                  return (
                    <tr key={userIdentifier}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.isBanned ? "Banned" : "Active"}</td>
                      <td>{user.elo}</td>
                      <td>{user.totalGames}</td>
                      <td>
                        <button
                          className="admin-action-button"
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleRoleToggle(user)}
                        >
                          {isUpdating
                            ? "Saving..."
                            : user.role === "admin"
                              ? "Remove admin"
                              : "Make admin"}
                        </button>

                        <button
                            className="admin-action-button"
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleBanToggle(user)}
                            >
                            {isUpdating
                                ? "Saving..."
                                : user.isBanned
                                ? "Unban user"
                                : "Ban user"}
                        </button>

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminUsers;