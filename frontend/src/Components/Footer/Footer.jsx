import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p className="footer-title">Spanish Poker Dice</p>

        <nav className="footer-links">
          <Link to="/about-us">About Us</Link>
          <Link to="/about-spanish-dice">About Spanish Dice</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </nav>

        <p className="footer-copy">
          © 2026 Spanish Poker Dice Platform
        </p>
      </div>
    </footer>
  );
}

export default Footer;