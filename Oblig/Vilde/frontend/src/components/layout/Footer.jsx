import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {

  return (

    <footer className="footer">

      <p className="footer-title">
        Spanish Poker Dice © 2026
      </p>

      <div className="footer-links">

        <Link to="/about">
          About us
        </Link>

        <Link to="/about-dice">
          About Spanish Poker Dice
        </Link>

        <Link to="/privacy">
          Privacy Policy
        </Link>

        <Link to="/terms">
          Terms and Conditions
        </Link>

      </div>

    </footer>

  );

}

export default Footer;