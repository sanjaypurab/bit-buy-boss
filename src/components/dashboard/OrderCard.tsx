import { Bitcoin, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  status: string;
  payment_status: string | null;
  btc_amount: number | null;
  created_at: string;
  instructions: string | null;
  btc_address: string | null;
  services: {
    name: string;
    description: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-success';
    case 'completed': return 'bg-primary';
    case 'cancelled': return 'bg-destructive';
    default: return 'bg-warning';
  }
};

const getPaymentBadge = (status: string | null) => {
  switch (status) {
    case 'paid':
    case 'confirmed':
      return { label: 'Paid', className: 'bg-success text-success-foreground' };
    case 'confirming':
    case 'sending':
      return { label: 'Confirming', className: 'bg-warning text-warning-foreground animate-pulse' };
    case 'waiting':
      return { label: 'Awaiting Payment', className: 'bg-muted text-muted-foreground' };
    case 'expired':
      return { label: 'Expired', className: 'bg-destructive text-destructive-foreground' };
    case 'failed':
      return { label: 'Failed', className: 'bg-destructive text-destructive-foreground' };
    default:
      return { label: 'Pending', className: 'bg-muted text-muted-foreground' };
  }
};

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}

const OrderCard = ({ order, isExpanded, onToggle }: OrderCardProps) => {
  const paymentBadge = getPaymentBadge(order.payment_status);

  return (
    <Card
      className="shadow-[var(--shadow-card)] cursor-pointer transition-colors hover:border-primary/30"
      onClick={onToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{order.services.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {new Date(order.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={paymentBadge.className}>{paymentBadge.label}</Badge>
            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
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
};

export default OrderCard;
