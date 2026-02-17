import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Search, Ban, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';

interface UserProfile {
  user_id: string;
  email: string | null;
  banned: boolean;
  created_at: string | null;
  total_spent: number;
  order_count: number;
}

const AdminUsersTab = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, banned, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch confirmed orders for spending totals
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, btc_amount, status');

      if (ordersError) throw ordersError;

      // Aggregate spending per user
      const spendingMap: Record<string, { total: number; count: number }> = {};
      orders?.forEach((order) => {
        if (order.status === 'confirmed') {
          if (!spendingMap[order.user_id]) {
            spendingMap[order.user_id] = { total: 0, count: 0 };
          }
          spendingMap[order.user_id].total += order.btc_amount || 0;
          spendingMap[order.user_id].count += 1;
        }
      });

      const enrichedUsers: UserProfile[] = (profiles || []).map((p) => ({
        user_id: p.user_id,
        email: p.email,
        banned: p.banned,
        created_at: p.created_at,
        total_spent: spendingMap[p.user_id]?.total || 0,
        order_count: spendingMap[p.user_id]?.count || 0,
      }));

      setUsers(enrichedUsers);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banned: !currentlyBanned })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: currentlyBanned ? 'User unbanned' : 'User banned',
        description: currentlyBanned
          ? 'User can now access services again.'
          : 'User has been banned from services.',
      });
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete profile (orders remain for records)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({ title: 'User deleted', description: 'Profile has been removed.' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(
    (u) => u.email?.toLowerCase().includes(search.toLowerCase()) || u.user_id.includes(search)
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">{users.length} users total</div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent (BTC)</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.order_count}</TableCell>
                    <TableCell>{user.total_spent > 0 ? user.total_spent.toFixed(8) : '—'}</TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleBan(user.user_id, user.banned)}
                          title={user.banned ? 'Unban user' : 'Ban user'}
                        >
                          {user.banned ? (
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <ShieldOff className="h-4 w-4 text-destructive" />
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" title="Delete user">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the user's profile. Their order history will be preserved. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteUser(user.user_id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersTab;
