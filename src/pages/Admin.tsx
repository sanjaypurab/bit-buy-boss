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
import { Plus, Loader2, Pencil, X, Save } from 'lucide-react';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminMessagesTab from '@/components/admin/AdminMessagesTab';
import AdminContentTab from '@/components/admin/AdminContentTab';
import AdminCategoriesTab from '@/components/admin/AdminCategoriesTab';

interface Order {
  id: string;
  status: string;
  created_at: string;
  btc_amount: number | null;
  services: {
    name: string;
  };
  user_id: string;
  user_email?: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  btc_price: number | null;
  btc_address: string | null;
  is_active: boolean;
  features: any;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    btc_price: '',
    btc_address: '',
    features: '',
    is_active: true,
    category_id: '',
  });
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    btc_price: '',
    btc_address: '',
    features: '',
    category_id: '',
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    await Promise.all([fetchOrders(), fetchServices(), fetchCategories()]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name').order('sort_order');
    setCategories(data || []);
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

      // Fetch user emails from profiles
      const userIds = [...new Set((data || []).map(o => o.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
      const ordersWithEmail = (data || []).map(o => ({
        ...o,
        user_email: emailMap.get(o.user_id) || null,
      }));

      setOrders(ordersWithEmail);
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
        btc_address: newService.btc_address || null,
        features,
        is_active: true,
        category_id: newService.category_id || null,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service added successfully',
      });
      
      setNewService({ name: '', description: '', price: '', btc_price: '', btc_address: '', features: '', category_id: '' });
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

  const startEditing = (service: Service) => {
    setEditingService(service.id);
    setEditForm({
      name: service.name,
      description: service.description,
      price: String(service.price),
      btc_price: service.btc_price ? String(service.btc_price) : '',
      btc_address: service.btc_address || '',
      features: Array.isArray(service.features) ? service.features.join('\n') : '',
      is_active: service.is_active,
      category_id: service.category_id || '',
    });
  };

  const saveEdit = async (serviceId: string) => {
    try {
      const features = editForm.features
        .split('\n')
        .filter(f => f.trim())
        .map(f => f.trim());

      const { error } = await supabase
        .from('services')
        .update({
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          btc_price: editForm.btc_price ? parseFloat(editForm.btc_price) : null,
          btc_address: editForm.btc_address || null,
          features,
          is_active: editForm.is_active,
          category_id: editForm.category_id || null,
        })
        .eq('id', serviceId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Service updated successfully' });
      setEditingService(null);
      fetchServices();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="content">Homepage</TabsTrigger>
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
                            <span className="text-muted-foreground">User: </span>
                            {order.user_email || order.user_id}
                          </div>
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
                      <Label htmlFor="btc_address">BTC Payment Address</Label>
                      <Input
                        id="btc_address"
                        value={newService.btc_address}
                        onChange={(e) => setNewService({ ...newService, btc_address: e.target.value })}
                        placeholder="e.g. 199tJyjqiKMJdTPN21xHRd5phxE6tDNW14"
                        className="font-mono"
                      />
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
                    <div>
                      <Label>Category</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                        value={newService.category_id}
                        onChange={e => setNewService({ ...newService, category_id: e.target.value })}
                      >
                        <option value="">No category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
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
                        <CardTitle>{editingService === service.id ? 'Edit Service' : service.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={service.is_active ? 'default' : 'secondary'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {editingService === service.id ? (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => saveEdit(service.id)}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingService(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button size="icon" variant="ghost" onClick={() => startEditing(service)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingService === service.id ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Service Name</Label>
                            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Price (USD)</Label>
                              <Input type="number" step="0.01" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                            </div>
                            <div>
                              <Label>BTC Price</Label>
                              <Input type="number" step="0.00000001" value={editForm.btc_price} onChange={(e) => setEditForm({ ...editForm, btc_price: e.target.value })} />
                            </div>
                          </div>
                          <div>
                            <Label>BTC Payment Address</Label>
                            <Input value={editForm.btc_address} onChange={(e) => setEditForm({ ...editForm, btc_address: e.target.value })} placeholder="e.g. 199tJyjqiKMJdTPN21xHRd5phxE6tDNW14" className="font-mono" />
                          </div>
                          <div>
                            <Label>Features (one per line)</Label>
                            <Textarea value={editForm.features} onChange={(e) => setEditForm({ ...editForm, features: e.target.value })} />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <select
                              className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                              value={editForm.category_id}
                              onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}
                            >
                              <option value="">No category</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label>Active</Label>
                            <input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-bold">${service.price}</div>
                            {service.btc_price && <div className="text-sm text-muted-foreground">{service.btc_price} BTC</div>}
                          </div>
                          {service.btc_address && (
                            <div className="mt-2 text-xs font-mono text-muted-foreground truncate">BTC: {service.btc_address}</div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersTab />
            </TabsContent>

            <TabsContent value="messages">
              <AdminMessagesTab />
            </TabsContent>

            <TabsContent value="categories">
              <AdminCategoriesTab />
            </TabsContent>

            <TabsContent value="content">
              <AdminContentTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;