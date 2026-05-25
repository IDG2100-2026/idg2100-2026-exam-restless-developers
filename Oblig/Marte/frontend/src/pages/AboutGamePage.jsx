function AboutGamePage() {
  return (
    <div className="page">
      <h1>About Spanish Poker Dice</h1>
      <section className="section">
        <h2>What is Spanish Poker Dice?</h2>
        <p>
          Spanish Poker Dice is a traditional dice game popular in Spain and Latin America. Players
          roll five dice and try to form poker-like hands like; pairs, three of a kind, full house, and
          more. The game combines luck with strategy, as players choose which dice to keep and which
          to re-roll across multiple rounds.
        </p>
      </section>
      <section className="section">
        <h2>How to Play</h2>
        <p>
          Each round, a player rolls all five dice. Then they can hold any number of dice and re-roll
          the rest up to two re-rolls per turn. The goal is to end the turn with the best possible
          hand. After both players have taken their turn, hands are compared and the higher hand wins
          the round.
        </p>
      </section>
      <section className="section">
        <h2>Hands (Highest to Lowest)</h2>
        <ul className="hands-list">
          <li><strong>Five of a Kind</strong> - all five dice showing the same value</li>
          <li><strong>Four of a Kind</strong> — four dice showing the same value</li>
          <li><strong>Full House</strong> — three of a kind plus a pair</li>
          <li><strong>Straight</strong> — five consecutive values (when allowed)</li>
          <li><strong>Three of a Kind</strong> — three dice showing the same value</li>
          <li><strong>Two Pair</strong> — two different pairs</li>
          <li><strong>One Pair</strong> — two dice showing the same value</li>
          <li><strong>High Die</strong> — no matching dice; highest single die wins</li>
        </ul>
      </section>
      <section className="section">
        <h2>Game Variants</h2>
        <p>
          On this platform, games come in 18 variants based on three settings: number of rounds
          (best of 3, 5, or 7), whether straights are allowed, and the time limit per round
          (5, 10, or 15 seconds).
        </p>
      </section>
    </div>
  )
}

export default AboutGamePage
