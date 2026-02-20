import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 20, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">By accessing or using DigiHub ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Services</h2>
            <p className="text-muted-foreground">DigiHub provides digital services available for purchase via cryptocurrency (Bitcoin). All services are delivered digitally and are subject to availability.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Accounts</h2>
            <p className="text-muted-foreground">You must create an account to use the Service. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Payments &amp; Refunds</h2>
            <p className="text-muted-foreground">Payments are made in Bitcoin. All sales are final once payment is confirmed on the blockchain. Refund requests are handled on a case-by-case basis at our discretion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Prohibited Conduct</h2>
            <p className="text-muted-foreground">You agree not to misuse the Service, attempt unauthorized access, or use the platform for any illegal activity.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
            <p className="text-muted-foreground">DigiHub is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2>
            <p className="text-muted-foreground">We may update these terms at any time. Continued use after changes constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
            <p className="text-muted-foreground">For questions about these Terms, please contact us through the messaging system in your dashboard.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
