import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { QRCodeSVG } from 'qrcode.react';
import { Bitcoin, Copy, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Footer from '@/components/Footer';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  btc_price: number | null;
  btc_address: string | null;
}

const Purchase = () => {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchService();
  }, [user, serviceId]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/services');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!service || !user) return;

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          service_id: service.id,
          btc_address: service.btc_address,
          btc_amount: service.btc_price,
          status: 'pending',
          instructions: instructions.trim() || null,
        });

      if (error) throw error;

      setOrderCreated(true);
      toast({
        title: 'Order Created',
        description: 'Please complete the payment using the BTC address below',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyAddress = () => {
    if (!service?.btc_address) return;
    navigator.clipboard.writeText(service.btc_address);
    setCopied(true);
    toast({
      title: 'Copied',
      description: 'BTC address copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle className="text-2xl">Purchase {service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="text-lg font-semibold">Total Amount</span>
                <div className="text-right">
                  <div className="text-2xl font-bold">${service.price}</div>
                  {service.btc_price && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Bitcoin className="h-4 w-4" />
                      <span>{service.btc_price} BTC</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Further Instructions (optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any special requirements, details, or messages for the admin..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  maxLength={1000}
                  disabled={orderCreated}
                />
                <p className="text-xs text-muted-foreground">{instructions.length}/1000</p>
              </div>

              {!orderCreated ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" required />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                      I agree to the{' '}
                      <a href="/terms" target="_blank" className="text-primary underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" target="_blank" className="text-primary underline">Privacy Policy</a>
                    </label>
                  </div>
                  <Button onClick={createOrder} className="w-full" size="lg">
                    Proceed to Payment
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="font-semibold text-lg">Scan QR Code</h3>
                    <div className="inline-block p-4 bg-white rounded-lg">
                      <QRCodeSVG value={service.btc_address || ''} size={200} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Or copy BTC address</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={service.btc_address || ''}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-md bg-muted font-mono text-sm"
                      />
                      <Button onClick={copyAddress} variant="outline" size="icon">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-sm">
                      After completing the payment, your order will be reviewed by an admin. 
                      You can track the status in your dashboard.
                    </p>
                  </div>

                  <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Purchase;
