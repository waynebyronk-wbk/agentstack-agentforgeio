export default function Privacy() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (security logs, access patterns, error reports)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Monitor and analyze security events</li>
            <li>Detect and prevent unauthorized access</li>
            <li>Send administrative messages and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All sensitive data is encrypted in transit and at rest.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide services. Security logs and audit trails are retained according to your subscription tier.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
          <p>
            We use Stripe for payment processing. Stripe's privacy policy governs the use of your payment information. We do not store full credit card numbers on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact: waynebyronk@gmail.com
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
