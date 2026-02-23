import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2, ShoppingCart, Check, ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

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

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const { items, addItem } = useCart();

  useEffect(() => {
    Promise.all([fetchServices(), fetchCategories()]).then(() => setLoading(false));
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
          : [],
      })));
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const isInCart = (id: string) => items.some(i => i.id === id);

  const handleAdd = (service: Service) => {
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

  const filteredServices = activeCategory
    ? services.filter(s => s.category_id === activeCategory)
    : services;

  // Group uncategorized too
  const uncategorized = services.filter(s => !s.category_id);

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Services</h1>
            <p className="text-xl text-muted-foreground">Choose from our digital offerings</p>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-10 justify-center">
              <Button
                variant={activeCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(null)}
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="gap-2"
                >
                  {cat.image_url ? (
                    <img src={cat.image_url} alt="" className="h-4 w-4 rounded object-cover" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  {cat.name}
                </Button>
              ))}
            </div>
          )}

          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No services available in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const inCart = isInCart(service.id);
                return (
                  <Card key={service.id} className="flex flex-col shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow">
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {service.features.length > 0 && (
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
                      <div className="text-3xl font-bold">${service.price}</div>
                      <Button
                        onClick={() => !inCart && handleAdd(service)}
                        className="w-full gap-2"
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
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Services;
