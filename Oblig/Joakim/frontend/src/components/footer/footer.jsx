
import { Link } from "react-router-dom";
import styles from "./footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.branding}>
        <span className={styles.name}>Hocus Pokus, Spanish Pokus</span>
        <p className={styles.copy}>&copy; 2026 - 2026</p>
      </div>
      <nav className={styles.links} aria-label="Footer navigation">
        <Link to="/about" className={styles.link}>About us</Link>
        <Link to="/aboutGame" className={styles.link}>About Spanish Dice</Link>
        <Link to="/privacy-policy" className={styles.link}>Privacy Policy</Link>
        <Link to="/terms" className={styles.link}>Terms and Conditions</Link>
      </nav>
    </footer>
  );
};

export default Footer;