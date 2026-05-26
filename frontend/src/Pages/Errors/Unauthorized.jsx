import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <main>
      <h1>401 - Unauthorized</h1>
      <p>You are not authorized to access this page.</p>
      <Link to="/login">Go to Login</Link>
    </main>
  );
}

export default Unauthorized;