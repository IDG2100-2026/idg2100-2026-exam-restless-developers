import "./Terms.css";

function Terms() {
  return (
    <div className="terms-container">
      <h1>Terms and Conditions</h1>

      <p className="terms-updated">
        Last updated: April 2026
      </p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using the Spanish Poker Dice platform, you agree to these Terms and Conditions.
          If you do not agree, you may not use the service.
        </p>
      </section>

      <section>
        <h2>2. Use of the Platform</h2>
        <p>You agree to:</p>
        <ul>
          <li>Use the platform responsibly and respectfully</li>
          <li>Not attempt to hack, exploit, or disrupt the service</li>
          <li>Not impersonate other users</li>
          <li>Follow all applicable laws</li>
        </ul>
      </section>

      <section>
        <h2>3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account information.
          We are not liable for unauthorized access caused by your actions.
        </p>
      </section>

      <section>
        <h2>4. Match Data and Gameplay</h2>
        <p>
          Match results, statistics, and gameplay data may be stored to provide platform features such as leaderboards,
          profiles, and match history.
        </p>
      </section>

      <section>
        <h2>5. Termination</h2>
        <p>
          We reserve the right to suspend or terminate accounts that violate these terms or misuse the platform.
        </p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>
          The platform is provided “as is”. We are not responsible for losses caused by downtime,
          bugs, or misuse of the service.
        </p>
      </section>

      <section>
        <h2>7. Changes to Terms</h2>
        <p>
          We may update these Terms and Conditions at any time. Continued use of the platform means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          For questions about these Terms and Conditions, please contact us through the support section of the platform.
        </p>
      </section>
    </div>
  );
}

export default Terms;