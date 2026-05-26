import { Link } from "react-router-dom";

function Admin() {
  return (
    <main>
      <h1>Admin Dashboard</h1>

      <p>Manage tournaments, users, comments, and platform activity.</p>

      <section>
        <h2>Tournament administration</h2>

        <Link to="/admin/tournaments/create">
          Create Tournament
        </Link>
      </section>
    </main>
  );
}

export default Admin;