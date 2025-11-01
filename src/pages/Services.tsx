import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Loader2, Bitcoin } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  btc_price: number | null;
  features: string[];
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices((data || []).map(service => ({
        ...service,
        features: Array.isArray(service.features) 
          ? service.features.filter((f): f is string => typeof f === 'string')
          : []
      })));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (serviceId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to purchase services',
      });
      navigate('/auth');
      return;
    }
    navigate(`/purchase/${serviceId}`);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Services</h1>
            <p className="text-xl text-muted-foreground">Choose from our digital offerings</p>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No services available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow">
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 text-sm">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 border-t pt-6">
                    <div className="w-full text-center">
                      <div className="text-3xl font-bold">${service.price}</div>
                      {service.btc_price && (
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                          <Bitcoin className="h-4 w-4" />
                          <span>{service.btc_price} BTC</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={() => handlePurchase(service.id)} 
                      className="w-full"
                    >
                      Purchase Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;