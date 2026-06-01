import { Link } from "react-router-dom";
import "./AdminHeader.css";

function AdminHeader() {
  return (
    <header className="admin-header">
      <Link to="/" className="admin-header__logo">
        Logo
      </Link>

      <nav className="admin-header__nav">
        <Link to="/admin" className="admin-header__link">
          Dashboard
        </Link>

        <Link to="/admin/users" className="admin-header__link">
          Users
        </Link>

        <Link to="/admin/comments" className="admin-header__link">
          Comments
        </Link>

        <Link
          to="/admin/tournaments/create"
          className="admin-header__link"
        >
          Create Tournament
        </Link>
      </nav>
    </header>
  );
}

export default AdminHeader;