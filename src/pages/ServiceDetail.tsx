import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useMetaTags } from '@/hooks/useMetaTags';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2, ShoppingCart, Check, ArrowLeft, Share2, Copy } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  btc_price: number | null;
  btc_address: string | null;
  features: string[];
  category_id: string | null;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { items, addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      if (error) {
        toast({ title: 'Service not found', variant: 'destructive' });
      } else {
        setService({
          ...data,
          features: Array.isArray(data.features)
            ? data.features.filter((f): f is string => typeof f === 'string')
            : [],
        });
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  useMetaTags({
    title: service?.name,
    description: service?.description,
    image: `${window.location.origin}/og-image.png`,
    url: window.location.href,
  });

  const inCart = service ? items.some(i => i.id === service.id) : false;

  const handleAdd = () => {
    if (!service) return;
    addItem({
      id: service.id,
      name: service.name,
      price: service.price,
      btc_price: service.btc_price,
      btc_address: service.btc_address,
      description: service.description,
    });
    toast({ title: 'Added to cart', description: service.name });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: service?.name, text: service?.description, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Share it anywhere.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground text-lg">Service not found</p>
          <Link to="/services"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Services</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <Link to="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Services
          </Link>

          <Card className="shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{service.name}</CardTitle>
                  <CardDescription className="mt-2 text-base">{service.description}</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={handleShare} title="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {service.features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">What's included</h3>
                  <ul className="space-y-2 text-sm">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 border-t pt-6">
              <div className="text-3xl font-bold">${service.price}</div>
              <Button
                onClick={() => !inCart && handleAdd()}
                className="flex-1 gap-2"
                variant={inCart ? 'secondary' : 'default'}
                disabled={inCart}
              >
                {inCart ? (
                  <><Check className="h-4 w-4" /> In Cart</>
                ) : (
                  <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
