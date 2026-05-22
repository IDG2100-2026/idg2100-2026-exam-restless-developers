import "./AboutUsPage.css";

function AboutUsPage() {
  return (
    <main className="about-container">
      <h1>About Us</h1>

      <section className="about-card">
        <p>
          Spanish Poker Dice is a student‑built project created to explore modern
          web development, game logic, and user‑focused design. My goal is to
          deliver a fun, simple and competitive dice‑based experience.
        </p>
      </section>

      <section className="about-card">
        <h2>Our Mission</h2>
        <p>
          I´ve aimed to create a clean, intuitive and responsive platform where
          players can challenge friends, track their progress and enjoy a
          polished gaming experience.
        </p>
      </section>

      <section className="about-card">
        <h2>Creator</h2>
        <p>
          This project was developed as part of a university assignment, focusing
          on full‑stack development, and modern frontend architecture.
        </p>
      </section>
    </main>
  );
}

export default AboutUsPage