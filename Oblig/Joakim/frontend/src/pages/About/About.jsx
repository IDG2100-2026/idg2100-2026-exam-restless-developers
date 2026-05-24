import styles from './About.module.css';
import { Link } from 'react-router-dom';
function About() {
  return (
    <div className={styles.about}>
      <h1>About Us</h1>
      <p>Welcome to our Spanish Dice Poker site!</p>
      <p>We are a group of passionate poker enthusiasts who love to play Spanish Dice Poker!</p>
      <p>Thank you for visiting our site, and we hope you have a great experience!</p>
    </div>

  );
}

export default About;
