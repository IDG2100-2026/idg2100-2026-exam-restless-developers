import "./AboutSpanishDice.css";

function AboutSpanishDice() {
  return (
    <main>
      <h1>About Spanish Poker Dice</h1>

      <section>
        <p>
          Spanish Poker Dice is a fast-paced dice game inspired by traditional
          poker hands. Instead of cards, players roll dice to form combinations
          such as pairs, straights, full houses and more.
        </p>
      </section>

      <section>
        <h2>How the Game Works</h2>
        <p>
          Each match consists of a set number of rounds. Players roll their dice
          and choose which ones to keep. After the final roll, the best
          combination wins the round. Players can also bet points each round —
          match, raise, or fold.
        </p>
      </section>

      <section>
        <h2>Game Variants</h2>
        <p>
          The platform supports multiple rule sets, including straights allowed
          or not, different numbers of rounds (3, 5 or 7), and different time
          controls (10, 30 or 90 seconds per game).
        </p>
      </section>

      <section>
        <h2>Elo Rating</h2>
        <p>
          After each match, players gain or lose Elo points based on the result
          and their opponent's rating. The better your opponents, the more you
          gain from beating them.
        </p>
      </section>
    </main>
  );
}

export default AboutSpanishDice;
