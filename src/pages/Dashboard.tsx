import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Loader2, Bitcoin, ChevronDown, ChevronUp, Package, MessageSquare } from 'lucide-react';
import UserMessages from '@/components/UserMessages';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Order {
  id: string;
  status: string;
  btc_amount: number | null;
  created_at: string;
  instructions: string | null;
  btc_address: string | null;
  services: {
    name: string;
    description: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          btc_amount,
          btc_address,
          instructions,
          created_at,
          services (
            name,
            description
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success';
      case 'completed':
        return 'bg-primary';
      case 'cancelled':
        return 'bg-destructive';
      default:
        return 'bg-warning';
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Dashboard</h1>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="orders" className="gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              {orders.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <button
                      onClick={() => navigate('/services')}
                      className="text-primary hover:underline"
                    >
                      Browse services
                    </button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <Card
                        key={order.id}
                        className="shadow-[var(--shadow-card)] cursor-pointer transition-colors hover:border-primary/30"
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{order.services.name}</CardTitle>
                              <CardDescription className="text-xs mt-1">
                                {new Date(order.created_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        {isExpanded && (
                          <CardContent className="pt-0 border-t border-border mt-0">
                            <div className="grid gap-4 pt-4 text-sm">
                              <div>
                                <span className="text-muted-foreground text-xs">Service Description</span>
                                <p className="mt-1">{order.services.description}</p>
                              </div>
                              {order.btc_amount && (
                                <div>
                                  <span className="text-muted-foreground text-xs">BTC Amount</span>
                                  <p className="font-medium flex items-center gap-1 mt-1">
                                    <Bitcoin className="h-4 w-4" />
                                    {order.btc_amount}
                                  </p>
                                </div>
                              )}
                              {order.btc_address && (
                                <div>
                                  <span className="text-muted-foreground text-xs">BTC Address</span>
                                  <p className="font-mono text-xs mt-1 break-all">{order.btc_address}</p>
                                </div>
                              )}
                              {order.instructions && (
                                <div>
                                  <span className="text-muted-foreground text-xs">Your Instructions</span>
                                  <p className="mt-1">{order.instructions}</p>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground text-xs">Order ID</span>
                                <p className="font-mono text-xs mt-1">{order.id.slice(0, 8)}…{order.id.slice(-4)}</p>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages">
              <UserMessages />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
