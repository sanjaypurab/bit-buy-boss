import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

type View = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (view === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Check your email', description: 'We sent you a password reset link.' });
        setView('login');
      }
      setLoading(false);
      return;
    }

    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { error } = view === 'login'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'Success',
        description: view === 'login' ? 'Signed in successfully' : 'Account created successfully',
      });
    }
    setLoading(false);
  };

  const titles: Record<View, { title: string; desc: string }> = {
    login: { title: 'Welcome Back', desc: 'Sign in to access your services' },
    signup: { title: 'Create Account', desc: 'Sign up to start purchasing services' },
    forgot: { title: 'Reset Password', desc: 'Enter your email to receive a reset link' },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="absolute top-6 left-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-[var(--shadow-elevated)]">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{titles[view].title}</CardTitle>
          <CardDescription>{titles[view].desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {view !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {view === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? 'Loading...'
                : view === 'login'
                ? 'Sign In'
                : view === 'signup'
                ? 'Sign Up'
                : 'Send Reset Link'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm space-y-1">
            {view === 'forgot' ? (
              <button type="button" onClick={() => setView('login')} className="text-primary hover:underline">
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                className="text-primary hover:underline"
              >
                {view === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
