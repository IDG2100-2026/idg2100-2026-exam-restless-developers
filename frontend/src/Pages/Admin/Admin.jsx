import "./Admin.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Admin() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:6767/api/v1/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not fetch dashboard data");
        }

        setDashboardData(data);
      } catch (error) {
        setError(error.message);
      }
    }

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-page-error">
          <h1>Admin Dashboard</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-page-loading">
          <h1>Admin Dashboard</h1>
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">
      <h1>Admin Dashboard</h1>

      <p>Manage users, comments, tournaments, and platform activity.</p>

      <div className="admin-dashboard-grid">
        <section className="admin-card">
          <h2>User statistics</h2>
          <p>Total users: {dashboardData.users.totalUsers}</p>
          <p>
            New profiles last week: {dashboardData.users.newProfilesLastWeek}
          </p>
          <p>Admin users: {dashboardData.users.adminUsers}</p>
        </section>

        <section className="admin-card">
          <h2>Platform activity</h2>
          <p>Active players: {dashboardData.games.activePlayers}</p>
          <p>
            Games played last week: {dashboardData.games.gamesPlayedLastWeek}
          </p>
          <p>Available games right now: {dashboardData.games.availableGames}</p>
        </section>

        <section className="admin-card">
          <h2>Security incidents</h2>
          <p>
            API limit incidents:{" "}
            {dashboardData.security.rateLimitIncidents.length}
          </p>
          <p>
            IP change incidents:{" "}
            {dashboardData.security.ipChangeIncidents.length}
          </p>
        </section>

        <section className="admin-card">
          <h2>Administration</h2>

          <nav className="admin-link-grid">
            <Link className="secondary-action-button" to="/admin/users">
              User Administration
            </Link>

            <Link className="secondary-action-button" to="/admin/comments">
              Comment Administration
            </Link>

            <Link
              className="primary-action-button"
              to="/admin/tournaments/create"
            >
              Create Tournament
            </Link>
          </nav>
        </section>
      </div>
    </main>
  );
}

export default Admin;