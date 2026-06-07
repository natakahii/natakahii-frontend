import { useEffect, useState } from 'react';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, ExternalLink, MoreHorizontal, User, Mail, Phone, Eye, Search, Filter } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';

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
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get<any>('/vendor/orders');
      setOrders(response.data || response || []);
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Error loading orders',
        message: error?.message || 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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

  const handleViewDetails = (item: OrderItem) => {
    setSelectedOrder(item);
    setIsDetailsOpen(true);
    
    // Refresh counts in the sidebar/mobile nav
    window.dispatchEvent(new CustomEvent('refresh-vendor-counts'));
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
    <div className="space-y-8 pb-20">
      <VendorPageHeader 
        title="Orders & Fulfillment" 
        description="Track and manage your customer sales and order logistics."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 rounded-[18px] border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-bg-page)] h-12 px-6">
              <ShoppingBag className="w-4 h-4 text-[var(--vendor-accent-action)]" />
              Batch History
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <VendorStatTile title="Incoming" value={stats.pending} icon={Clock} accent="warning" />
        <VendorStatTile title="Processing" value={stats.processing} icon={Package} accent="action" />
        <VendorStatTile title="Completed" value={stats.delivered} icon={CheckCircle} accent="success" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <Input 
            placeholder="Search by Order ID or Customer..." 
            className="pl-12 h-14 bg-white border-[var(--color-border)] text-[var(--color-text-heading)] rounded-2xl focus:ring-[var(--vendor-accent-action)]/20" 
          />
        </div>
        <Button variant="outline" className="h-14 px-8 border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-bg-page)] rounded-2xl font-bold gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {orders.length === 0 ? (
        <VendorEmptyState
          variant="no-sales"
          title="No orders yet"
          description="When customers purchase your products, they will appear here."
        />
      ) : (
        <VendorCard className="overflow-hidden bg-white border-[var(--color-border)]">
          <Table>
            <TableHeader className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Order ID</TableHead>
                <TableHead className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Customer</TableHead>
                <TableHead className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Product</TableHead>
                <TableHead className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Amount</TableHead>
                <TableHead className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Status</TableHead>
                <TableHead className="text-right text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((item) => (
                <TableRow key={item.id} className="border-[var(--color-border)] hover:bg-[var(--color-bg-page)] transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-[var(--color-text-heading)] font-mono tracking-wider">#{item.order.order_number}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                        <span className="font-bold text-sm text-[var(--color-text-heading)]">{item.order.customer.name}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] font-medium">
                          <Mail className="w-3 h-3" />
                          {item.order.customer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-page)]">
                        <img 
                          src={item.product?.images?.[0]?.image_path || 'https://via.placeholder.com/40x40?text=Product'} 
                          alt={item.product?.name || 'Product'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--color-text-heading)] line-clamp-1 max-w-[150px]">
                          {item.product?.name || 'Unknown Product'}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-black text-sm text-[var(--color-text-heading)]">{safeFormatCurrency(item.subtotal)}</span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        onClick={() => handleViewDetails(item)}
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl hover:bg-[var(--color-bg-page)] transition-colors" 
                        title="View Order Details"
                      >
                        <Eye className="h-5 w-5 text-[var(--vendor-accent-action)]" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl hover:bg-[var(--color-bg-page)] transition-colors" 
                        title="View Product"
                        onClick={() => window.open(`/product/${item.product?.id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 text-[var(--color-text-muted)]" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-[var(--color-bg-page)]" disabled={isActionLoading === item.id}>
                            <MoreHorizontal className="h-5 w-5 text-[var(--color-text-muted)]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white border border-[var(--color-border)] text-[var(--color-text-heading)] rounded-2xl p-2 shadow-2xl">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'confirmed')} className="gap-3 h-12 rounded-xl hover:bg-[var(--color-bg-page)] transition-colors cursor-pointer">
                            <CheckCircle className="w-4 h-4 text-blue-500" /> 
                            <span className="font-bold">Confirm Order</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'processing')} className="gap-3 h-12 rounded-xl hover:bg-[var(--color-bg-page)] transition-colors cursor-pointer">
                            <Package className="w-4 h-4 text-indigo-500" /> 
                            <span className="font-bold">Start Processing</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'shipped')} className="gap-3 h-12 rounded-xl hover:bg-[var(--color-bg-page)] transition-colors cursor-pointer">
                            <Truck className="w-4 h-4 text-purple-500" /> 
                            <span className="font-bold">Mark as Shipped</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(item.id, 'delivered')} className="gap-3 h-12 rounded-xl hover:bg-[var(--color-bg-page)] transition-colors cursor-pointer">
                            <CheckCircle className="w-4 h-4 text-green-500" /> 
                            <span className="font-bold">Mark as Delivered</span>
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

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-none text-[var(--color-text-heading)] p-0 overflow-hidden rounded-[40px] shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-3xl font-black mb-1">Order Details</DialogTitle>
                  <p className="text-[var(--color-text-muted)] font-mono tracking-widest uppercase text-xs">#{selectedOrder?.order.order_number}</p>
                </div>
                {selectedOrder && getStatusBadge(selectedOrder.status)}
              </div>
            </DialogHeader>

            <div className="space-y-8">
              {/* Customer & Product Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[var(--color-bg-card)] rounded-[32px] p-6 border border-[var(--color-border)]">
                  <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-4">Customer Info</p>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 border border-[var(--color-border)] shadow-lg">
                      <AvatarImage src={undefined} alt={selectedOrder?.order.customer.name} />
                      <AvatarFallback className="bg-[var(--vendor-accent-action)] text-white font-black">
                        {selectedOrder?.order.customer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-black text-lg">{selectedOrder?.order.customer.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium">{selectedOrder?.order.customer.email}</p>
                    </div>
                  </div>
                  {selectedOrder?.order.customer.phone_number && (
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--vendor-accent-action)]">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedOrder.order.customer.phone_number}
                    </div>
                  )}
                </div>

                <div className="bg-[var(--color-bg-card)] rounded-[32px] p-6 border border-[var(--color-border)]">
                  <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-4">Product Details</p>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-lg bg-[var(--color-bg-page)]">
                      <img 
                        src={selectedOrder?.product?.images?.[0]?.image_path || 'https://via.placeholder.com/60x60?text=Product'} 
                        alt={selectedOrder?.product?.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-black text-sm line-clamp-1">{selectedOrder?.product?.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] font-black uppercase tracking-widest mt-0.5">Quantity: {selectedOrder?.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[var(--color-bg-card)] rounded-[32px] p-8 shadow-inner border border-[var(--color-border)] text-[var(--color-text-heading)]">
                <h4 className="text-xl font-black mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[var(--vendor-accent-action)]" />
                  Financial Summary
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-[var(--color-text-muted)]">Unit Price</span>
                    <span className="font-bold">{safeFormatCurrency(selectedOrder?.unit_price || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-[var(--color-text-muted)]">Quantity</span>
                    <span className="font-bold">x {selectedOrder?.quantity}</span>
                  </div>
                  <div className="h-px bg-[var(--color-border)] my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg">Total Payout</span>
                    <span className="text-2xl font-black text-[var(--vendor-accent-action)]">
                      {safeFormatCurrency(selectedOrder?.subtotal || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="flex-1 h-14 bg-[var(--color-bg-page)] text-[var(--color-text-heading)] hover:bg-[var(--color-border)] rounded-2xl font-black transition-all"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsDetailsOpen(false);
                    if (selectedOrder) handleStatusUpdate(selectedOrder.id, 'confirmed');
                  }}
                  disabled={selectedOrder?.status !== 'pending'}
                  className={`flex-1 h-14 rounded-2xl font-black transition-all shadow-xl ${
                    selectedOrder?.status === 'pending'
                    ? 'bg-[var(--vendor-accent-action)] text-white hover:bg-[var(--vendor-accent-action)]/90 shadow-[var(--vendor-accent-action)]/20'
                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] cursor-not-allowed'
                  }`}
                >
                  Confirm Payout
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
