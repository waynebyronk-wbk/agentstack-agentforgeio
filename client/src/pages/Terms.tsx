export default function Terms() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using The81AIAgent Admin & Security System, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily access the services for personal or commercial use. This is the grant of a license, not a transfer of title.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Service Description</h2>
          <p>
            The81AIAgent provides security monitoring, device tracking, error detection, invoice generation, and data logging services. We reserve the right to modify or discontinue services at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
          <p>
            Subscription fees are billed in advance on a monthly basis. All payments are processed securely through Stripe. Refunds are handled on a case-by-case basis.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
          <p>
            The service is provided "as is" without warranties of any kind. We shall not be liable for any damages arising from the use or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact: waynebyronk@gmail.com
          </p>
        </section>

        <p className="text-sm text-muted-foreground mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
