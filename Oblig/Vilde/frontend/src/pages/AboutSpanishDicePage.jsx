import "./AboutSpanishDicePage.css";

function AboutDicePage() {
  return (
    <main className="dice-container">
      <h1>About Spanish Poker Dice</h1>

      <section className="dice-card">
        <p>
          Spanish Poker Dice is a fast‑paced dice game inspired by traditional
          poker hands. Instead of cards, players roll dice to form combinations
          such as pairs, straights, full houses and more.
        </p>
      </section>

      <section className="dice-card">
        <h2>How the Game Works</h2>
        <p>
          Each match consists of a set number of rounds. Players roll their dice
          and choose which ones to keep. After the final roll, the best
          combination wins the round.
        </p>
      </section>

      <section className="dice-card">
        <h2>Game Variants</h2>
        <p>
          The platform supports multiple rule sets, including “Straights
          Allowed”, “Best of 3”, and custom match settings chosen by the host.
        </p>
      </section>
    </main>
  );
}

export default AboutDicePage;