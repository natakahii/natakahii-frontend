import { useEffect, useState } from 'react';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, ExternalLink, MoreHorizontal, User, Mail, Phone } from 'lucide-react';
import { 
  VendorCard, 
  VendorEmptyState, 
  VendorPageHeader, 
  VendorTableSkeleton,
  VendorStatTile
} from '../../components/vendor';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useToast } from '../../components/ui/toast';
import { apiClient } from '../../services/apiClient';
import { safeFormatCurrency } from '../../utils/currency';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  order: {
    id: number;
    order_number: string;
    customer: {
      id: number;
      name: string;
      email: string;
      phone_number?: string;
    };
  };
  product: {
    id: number;
    name: string;
    images: Array<{ image_path: string }>;
  };
}

export function VendorOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    apiClient.get<any>('/vendor/orders')
      .then((response) => {
        if (!isMounted) return;
        // The API returns paginated response
        setOrders(response.data || response || []);
      })
      .catch((error) => {
        if (!isMounted) return;
        toast({
          type: 'error',
          title: 'Error loading orders',
          message: error?.message || 'Please try again later.',
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleStatusUpdate = async (itemId: number, newStatus: string) => {
    setIsActionLoading(itemId);
    try {
      await apiClient.patch(`/vendor/orders/${itemId}/status`, JSON.stringify({ status: newStatus }));
      setOrders(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus as any } : item));
      toast({
        type: 'success',
        title: 'Status Updated',
        message: `Order item status changed to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Update Failed',
        message: error?.message || 'Could not update status.',
      });
    } finally {
      setIsActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmed</Badge>;
      case 'processing': return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Processing</Badge>;
      case 'shipped': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shipped</Badge>;
      case 'delivered': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <VendorPageHeader title="My Orders" description="Manage your customer orders and fulfillment." />
        <VendorTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader 
        title="My Orders" 
        description="Track and fulfill your customer orders efficiently."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
              Order History
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <VendorStatTile title="New Orders" value={stats.pending} icon={Clock} accent="warning" />
        <VendorStatTile title="In Progress" value={stats.processing} icon={Package} accent="action" />
        <VendorStatTile title="Completed" value={stats.delivered} icon={CheckCircle} accent="success" />
      </div>

      {orders.length === 0 ? (
        <VendorEmptyState
          variant="no-sales"
          title="No orders yet"
          description="When customers purchase your products, they will appear here."
        />
      ) : (
        <VendorCard className="overflow-hidden">
          <Table>
            <TableHeader className="bg-[var(--color-bg-card)]">
              <TableRow>
                <TableHead>Order Info</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[var(--color-text-heading)]">#{item.order.order_number}</span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <span className="font-semibold text-sm text-[var(--color-text-heading)]">{item.order.customer.name}</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                          <Mail className="w-3 h-3" />
                          {item.order.customer.email}
                        </div>
                        {item.order.customer.phone_number && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                            <Phone className="w-3 h-3" />
                            {item.order.customer.phone_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-[var(--color-border)]">
                        <img 
                          src={item.product.images[0]?.image_path || 'https://via.placeholder.com/40x40?text=Product'} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[var(--color-text-heading)] line-clamp-1 max-w-[150px]">
                          {item.product.name}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-sm">{safeFormatCurrency(item.subtotal)}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Order Details">
                        <ExternalLink className="h-4 w-4 text-[var(--color-text-muted)]" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isActionLoading === item.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'confirmed')} className="gap-2">
                            <CheckCircle className="w-4 h-4 text-blue-600" /> Confirm Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'processing')} className="gap-2">
                            <Package className="w-4 h-4 text-indigo-600" /> Start Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'shipped')} className="gap-2">
                            <Truck className="w-4 h-4 text-purple-600" /> Mark as Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'delivered')} className="gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" /> Mark as Delivered
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </VendorCard>
      )}
    </div>
  );
}
