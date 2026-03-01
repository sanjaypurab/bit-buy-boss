import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bitcoin, Trash2, ShoppingCart, Loader2 } from 'lucide-react';

const Cart = () => {
  const { user } = useAuth();
  const { items, removeItem, clearCart, totalUsd } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: 'Please sign in first' });
      navigate('/auth');
      return;
    }
    if (!agreedTerms) {
      toast({ title: 'Please agree to Terms & Privacy Policy', variant: 'destructive' });
      return;
    }
    if (!email || !email.includes('@')) {
      toast({ title: 'Please enter a valid email', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          items: items.map(i => ({
            id: i.id,
            name: i.name,
            price: i.price,
            btc_price: i.btc_price,
            btc_address: i.btc_address,
          })),
          email: email.trim(),
          instructions: instructions.trim() || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.payment_url) {
        clearCart();
        window.location.href = data.payment_url;
      } else {
        throw new Error('No payment URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({ title: 'Payment Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <ShoppingCart className="h-7 w-7" />
            Your Cart
          </h1>

          {items.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button variant="outline" onClick={() => navigate('/services')}>Browse Services</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">${item.price}</span>
                      <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="shadow-[var(--shadow-elevated)]">
                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <span className="text-lg font-semibold">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${totalUsd.toFixed(2)}</div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Bitcoin className="h-3 w-3" />
                        <span>Paid in BTC at checkout</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      maxLength={255}
                    />
                    <p className="text-xs text-muted-foreground">For order confirmation and updates</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Further Instructions (optional)</Label>
                    <Textarea
                      placeholder="Any special requirements or details..."
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">{instructions.length}/1000</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreedTerms}
                      onCheckedChange={(v) => setAgreedTerms(v === true)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                      I agree to the{' '}
                      <a href="/terms" target="_blank" className="text-primary underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" target="_blank" className="text-primary underline">Privacy Policy</a>
                    </label>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full gap-2"
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><Bitcoin className="h-4 w-4" /> Pay with Bitcoin</>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    You'll be redirected to a secure payment page. Service activates automatically after payment.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
