import "./Rules.css";

function Rules({ tournament }) {
  return (
    <section className="detail-card">
      <h2>Rules</h2>
      <p>{tournament.rules}</p>
    </section>
  );
}

export default Rules;