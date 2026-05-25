import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-brand">Spanish Poker Dice © 2024–2026</p>
        <nav className="footer-nav">
          <Link to="/about">About Us</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </nav>
      </div>
    </footer>
  )
}

export default Footer
