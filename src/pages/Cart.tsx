import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { QRCodeSVG } from 'qrcode.react';
import { Bitcoin, Copy, Check, Trash2, ShoppingCart } from 'lucide-react';

const Cart = () => {
  const { user } = useAuth();
  const { items, removeItem, clearCart, totalUsd } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Use BTC info from first item with a btc_address (simplified — in practice each item could differ)
  const btcItem = items.find(i => i.btc_address);
  const totalBtc = items.reduce((sum, i) => sum + (i.btc_price || 0), 0);

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

    try {
      // Create an order for each item
      const orderInserts = items.map(item => ({
        user_id: user.id,
        service_id: item.id,
        btc_address: item.btc_address,
        btc_amount: item.btc_price,
        status: 'pending',
        instructions: instructions.trim() || null,
      }));

      const { error } = await supabase.from('orders').insert(orderInserts);
      if (error) throw error;

      setOrderCreated(true);
      toast({ title: 'Orders Created', description: 'Complete payment using BTC below' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const copyAddress = () => {
    if (!btcItem?.btc_address) return;
    navigator.clipboard.writeText(btcItem.btc_address);
    setCopied(true);
    toast({ title: 'BTC address copied' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    clearCart();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <ShoppingCart className="h-7 w-7" />
            {orderCreated ? 'Complete Payment' : 'Your Cart'}
          </h1>

          {items.length === 0 && !orderCreated ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button variant="outline" onClick={() => navigate('/services')}>Browse Services</Button>
              </CardContent>
            </Card>
          ) : !orderCreated ? (
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
                      {totalBtc > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Bitcoin className="h-4 w-4" />
                          <span>{totalBtc} BTC</span>
                        </div>
                      )}
                    </div>
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

                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Proceed to Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <CardTitle>Send BTC Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-semibold">Total BTC</span>
                  <div className="flex items-center gap-2 text-xl font-bold">
                    <Bitcoin className="h-5 w-5" />
                    {totalBtc}
                  </div>
                </div>

                {btcItem?.btc_address && (
                  <>
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">Scan QR Code</p>
                      <div className="inline-block p-4 bg-white rounded-lg">
                        <QRCodeSVG value={btcItem.btc_address} size={200} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Or copy BTC address</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={btcItem.btc_address}
                          readOnly
                          className="flex-1 px-3 py-2 border rounded-md bg-muted font-mono text-sm"
                        />
                        <Button onClick={copyAddress} variant="outline" size="icon">
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <div className="p-4 bg-muted/50 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    After completing the payment, your order will be reviewed by an admin.
                    You can track status in your dashboard.
                  </p>
                </div>

                <Button onClick={handleDone} variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
