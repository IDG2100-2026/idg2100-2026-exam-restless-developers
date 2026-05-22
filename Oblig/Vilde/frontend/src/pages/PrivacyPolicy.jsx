import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>

      <p className="privacy-updated">
        Last updated: April 2026
      </p>

      <section>
        <h2>1. Introduction</h2>
        <p>
          We value your privacy and are committed to protecting your personal information.
          This Privacy Policy explains what data we collect, how we use it, and what rights you have.
        </p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <p>We may collect the following information when you use our platform:</p>
        <ul>
          <li>Account information (username, email)</li>
          <li>Match history and gameplay statistics</li>
          <li>Browser and device information</li>
          <li>Optional profile details you choose to share</li>
        </ul>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>Your data is used to:</p>
        <ul>
          <li>Provide access to matches and game features</li>
          <li>Display your profile and statistics</li>
          <li>Improve platform performance and user experience</li>
          <li>Maintain account security and prevent misuse</li>
        </ul>
      </section>

      <section>
        <h2>4. Data Sharing</h2>
        <p>
          We do not sell your personal information.  
          Data may be shared only when required by law or to maintain platform security.
        </p>
      </section>

      <section>
        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your stored information</li>
          <li>Request deletion of your account</li>
          <li>Update your profile details</li>
          <li>Contact us regarding privacy concerns</li>
        </ul>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us through the support section of the platform.
        </p>
      </section>
    </div>
  );
}

export default PrivacyPolicy;