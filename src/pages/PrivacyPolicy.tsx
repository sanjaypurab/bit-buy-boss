import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 20, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground">We collect your email address upon registration and order details (service selected, payment information) when you make a purchase.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">Your information is used to provide and manage services, process orders, communicate with you, and ensure platform security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Data Storage &amp; Security</h2>
            <p className="text-muted-foreground">Your data is stored securely with encryption at rest and in transit. We implement industry-standard security measures to protect your information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Third-Party Sharing</h2>
            <p className="text-muted-foreground">We do not sell or share your personal data with third parties except as required by law or to provide core service functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Cookies</h2>
            <p className="text-muted-foreground">We use essential cookies to maintain your session. No tracking or advertising cookies are used.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
            <p className="text-muted-foreground">You may request access to, correction of, or deletion of your personal data at any time by contacting us through the messaging system.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Changes to This Policy</h2>
            <p className="text-muted-foreground">We may update this policy periodically. We will notify users of significant changes via the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
            <p className="text-muted-foreground">For privacy-related inquiries, please reach out through the messaging system in your dashboard.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
