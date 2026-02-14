import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Shield, Zap, Lock, Bitcoin, ArrowRight, CheckCircle2 } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Security',
      description: 'End-to-end encryption and zero-knowledge architecture protect every transaction.',
    },
    {
      icon: Bitcoin,
      title: 'Native BTC Payments',
      description: 'Pay directly with Bitcoin — no intermediaries, no friction, no surveillance.',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Services activate the moment your payment is confirmed. No waiting.',
    },
    {
      icon: Lock,
      title: 'Private by Default',
      description: 'Your dashboard, your data. We never share or sell your information.',
    },
  ];

  const steps = [
    { step: '01', title: 'Create Account', description: 'Sign up in seconds with just an email.' },
    { step: '02', title: 'Choose a Service', description: 'Browse our curated catalog of digital tools.' },
    { step: '03', title: 'Pay with Bitcoin', description: 'Scan the QR code and send your payment.' },
    { step: '04', title: 'Get Access', description: 'Your service activates after admin confirmation.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: 'var(--gradient-hero)' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="container relative mx-auto px-4 py-28 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border bg-card/60 backdrop-blur-sm text-sm font-medium text-muted-foreground">
              <Bitcoin className="h-4 w-4 text-primary" />
              Bitcoin-native digital services
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Digital services,
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                paid your way.
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Premium email marketing, custom websites, and more — all purchasable with Bitcoin. No banks. No middlemen. Just results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button size="lg" className="gap-2 text-base px-8" onClick={() => navigate('/services')}>
                    Browse Services <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-base px-8" onClick={() => navigate('/dashboard')}>
                    My Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" className="gap-2 text-base px-8" onClick={() => navigate('/auth')}>
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-base px-8" onClick={() => navigate('/services')}>
                    View Services
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              From sign-up to service — four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center">
                <div className="text-5xl font-black text-primary/10 mb-2">{s.step}</div>
                <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Built for Privacy & Speed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to buy and manage digital services — without compromise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 border-t border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-muted-foreground">
            {[
              'No KYC required',
              'BTC-only payments',
              'Admin-verified orders',
              'Instant service delivery',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">
              Ready to go?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Create your account and start browsing services in under a minute.
            </p>
            <Button size="lg" className="gap-2 text-base px-10" onClick={() => navigate(user ? '/services' : '/auth')}>
              {user ? 'Browse Services' : 'Create Free Account'} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DigiHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
