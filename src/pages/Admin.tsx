import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  created_at: string;
  btc_amount: number | null;
  services: {
    name: string;
  };
  user_id: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  btc_price: number | null;
  is_active: boolean;
}

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    btc_price: '',
    features: '',
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    await Promise.all([fetchOrders(), fetchServices()]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          btc_amount,
          user_id,
          services (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const confirmPayment = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_confirmed_at: new Date().toISOString(),
          payment_confirmed_by: user?.id,
        })
        .eq('id', orderId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Payment confirmed',
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addService = async () => {
    try {
      const features = newService.features
        .split('\n')
        .filter(f => f.trim())
        .map(f => f.trim());

      const { error } = await supabase.from('services').insert({
        name: newService.name,
        description: newService.description,
        price: parseFloat(newService.price),
        btc_price: newService.btc_price ? parseFloat(newService.btc_price) : null,
        features,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service added successfully',
      });
      
      setNewService({ name: '', description: '', price: '', btc_price: '', features: '' });
      setShowAddService(false);
      fetchServices();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {orders.filter(o => o.status === 'pending').length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">No pending orders</p>
                  </CardContent>
                </Card>
              ) : (
                orders
                  .filter(o => o.status === 'pending')
                  .map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{order.services.name}</CardTitle>
                          <Badge>{order.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Date: </span>
                            {new Date(order.created_at).toLocaleString()}
                          </div>
                          {order.btc_amount && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">BTC: </span>
                              {order.btc_amount}
                            </div>
                          )}
                          <Button onClick={() => confirmPayment(order.id)}>
                            Confirm Payment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Button onClick={() => setShowAddService(!showAddService)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>

              {showAddService && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Service</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Service Name</Label>
                      <Input
                        id="name"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (USD)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="btc_price">BTC Price (optional)</Label>
                        <Input
                          id="btc_price"
                          type="number"
                          step="0.00000001"
                          value={newService.btc_price}
                          onChange={(e) => setNewService({ ...newService, btc_price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="features">Features (one per line)</Label>
                      <Textarea
                        id="features"
                        value={newService.features}
                        onChange={(e) => setNewService({ ...newService, features: e.target.value })}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      />
                    </div>
                    <Button onClick={addService}>Add Service</Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{service.name}</CardTitle>
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="text-lg font-bold">${service.price}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;