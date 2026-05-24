import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <section>
      <h1>Forgot Password</h1>
      <p>Password reset is not implemented in this sprint.</p>
      <Link to="/login">Back to login</Link>
    </section>
  );
};

export default ForgotPassword;
