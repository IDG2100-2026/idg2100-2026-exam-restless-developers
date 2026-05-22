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
          <p>Account information (username, email)</p>
          <p>Match history and gameplay statistics</p>
          <p>Browser and device information</p>
          <p>Optional profile details you choose to share</p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>Your data is used to:</p>
          <p>Provide access to matches and game features</p>
          <p>Display your profile and statistics</p>
          <p>Improve platform performance and user experience</p>
          <p>Maintain account security and prevent misuse</p>
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
          <p>Access your stored information</p>
          <p>Request deletion of your account</p>
          <p>Update your profile details</p>
          <p>Contact us regarding privacy concerns</p>
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