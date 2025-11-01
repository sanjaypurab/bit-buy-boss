import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Shield, Zap, Lock, Bitcoin } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Enterprise-grade security for all your digital services',
    },
    {
      icon: Bitcoin,
      title: 'Bitcoin Payments',
      description: 'Fast and secure cryptocurrency payment processing',
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Get immediate access to services after payment confirmation',
    },
    {
      icon: Lock,
      title: 'Private Dashboard',
      description: 'Manage all your services from one secure location',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Gateway to
              <span className="block bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Premium Digital Services
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access email marketing, custom websites, and more. Pay securely with Bitcoin and manage everything from your personal dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <>
                  <Button size="lg" onClick={() => navigate('/services')}>
                    Browse Services
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')}>
                    My Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/auth')}>
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/services')}>
                    View Services
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose DigiHub</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional digital services with secure Bitcoin payments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border bg-card shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join hundreds of satisfied customers using our digital services
            </p>
            <Button size="lg" onClick={() => navigate(user ? '/services' : '/auth')}>
              {user ? 'Browse Services' : 'Create Account'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
