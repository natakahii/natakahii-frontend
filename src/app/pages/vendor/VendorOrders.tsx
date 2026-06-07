import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, Package, Truck, CheckCircle, Clock, ExternalLink, MoreHorizontal, User, Mail, Phone, Eye, Search, Filter } from 'lucide-react';
import { getImageUrl } from '../../utils/images';
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
      profile_photo?: string | null;
    };
  };
  product: {
    id: number;
    name: string;
    images: Array<{ image_path: string }>;
  };
}

export function VendorOrders() {
  const navigate = useNavigate();
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
                          src={getImageUrl(item.product?.images?.[0]?.image_path)} 
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
                        className="h-10 w-10 p-0 rounded-xl bg-[var(--vendor-accent-action-bg)] hover:bg-[var(--vendor-accent-action)] group transition-all duration-300" 
                        title="Quick View"
                      >
                        <Eye className="h-5 w-5 text-[var(--vendor-accent-action)] group-hover:text-white transition-colors" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-xl hover:bg-[var(--color-bg-page)] transition-colors border border-transparent hover:border-[var(--color-border)]" 
                        title="View Product"
                        onClick={() => navigate(`/product/${item.product?.id}`)}
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
        <DialogContent className="sm:max-w-[650px] bg-white border-none text-[var(--color-text-heading)] p-0 overflow-hidden rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)]">
          <div className="relative">
            {/* Header Decoration */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--vendor-accent-action-bg)]/30 to-transparent pointer-events-none" />
            
            <div className="p-8 relative">
              <DialogHeader className="mb-8">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[var(--vendor-accent-action)] uppercase tracking-[0.3em]">Order Fulfillment</p>
                    <DialogTitle className="text-4xl font-black tracking-tight">Order Details</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[var(--color-text-muted)] font-mono text-xs bg-[var(--color-bg-page)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                        #{selectedOrder?.order.order_number}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                        {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {selectedOrder && (
                    <div className="scale-110 origin-top-right">
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-8">
                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Section */}
                  <div className="bg-[var(--color-bg-page)] rounded-[32px] p-6 border border-[var(--color-border)] hover:border-[var(--vendor-accent-action)]/20 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-white rounded-xl border border-[var(--color-border)] shadow-sm">
                        <User className="w-4 h-4 text-[var(--vendor-accent-action)]" />
                      </div>
                      <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Customer Info</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-white shadow-xl">
                        <AvatarImage src={getImageUrl(selectedOrder?.order.customer.profile_photo)} alt={selectedOrder?.order.customer.name} />
                        <AvatarFallback className="bg-[var(--vendor-accent-action)] text-white font-black text-xl">
                          {selectedOrder?.order.customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="font-black text-xl leading-tight">{selectedOrder?.order.customer.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-medium">
                          <Mail className="w-3 h-3" />
                          {selectedOrder?.order.customer.email}
                        </div>
                      </div>
                    </div>
                    
                    {selectedOrder?.order.customer.phone_number && (
                      <div className="mt-4 pt-4 border-t border-[var(--color-border)]/50">
                        <div className="flex items-center gap-2 text-sm font-bold text-[var(--vendor-accent-action)] bg-white w-fit px-4 py-2 rounded-2xl border border-[var(--vendor-accent-action)]/10">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedOrder.order.customer.phone_number}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Section */}
                  <div className="bg-[var(--color-bg-page)] rounded-[32px] p-6 border border-[var(--color-border)] hover:border-[var(--vendor-accent-action)]/20 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-white rounded-xl border border-[var(--color-border)] shadow-sm">
                        <Package className="w-4 h-4 text-[var(--vendor-accent-action)]" />
                      </div>
                      <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em]">Product Details</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white shrink-0">
                        <img 
                          src={getImageUrl(selectedOrder?.product?.images?.[0]?.image_path)} 
                          alt={selectedOrder?.product?.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-sm leading-snug line-clamp-2">{selectedOrder?.product?.name}</p>
                        <div className="inline-flex items-center px-2 py-0.5 bg-white border border-[var(--color-border)] rounded-md">
                          <span className="text-[10px] font-black text-[var(--vendor-accent-action)] uppercase tracking-widest">Qty: {selectedOrder?.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-[var(--color-text-heading)] rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700">
                    <ShoppingBag className="w-32 h-32 text-white" />
                  </div>
                  
                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      Financial Summary
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 font-medium">Unit Price</span>
                        <span className="text-white font-bold">{safeFormatCurrency(selectedOrder?.unit_price || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 font-medium">Total Quantity</span>
                        <span className="text-white font-bold">× {selectedOrder?.quantity}</span>
                      </div>
                      
                      <div className="h-px bg-white/10 my-4" />
                      
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-[var(--vendor-accent-action)] uppercase tracking-widest">Net Payout</p>
                          <p className="text-white/40 text-[10px] font-medium leading-tight">After platform commission</p>
                        </div>
                        <div className="text-right">
                          <span className="text-4xl font-black text-white tracking-tighter">
                            {safeFormatCurrency(selectedOrder?.subtotal || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-2">
                  <Button 
                    onClick={() => setIsDetailsOpen(false)}
                    variant="outline"
                    className="flex-1 h-16 border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-bg-page)] rounded-[24px] font-black transition-all text-lg"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsDetailsOpen(false);
                      if (selectedOrder) handleStatusUpdate(selectedOrder.id, 'confirmed');
                    }}
                    disabled={selectedOrder?.status !== 'pending'}
                    className={`flex-[1.5] h-16 rounded-[24px] font-black text-lg transition-all shadow-xl relative overflow-hidden group ${
                      selectedOrder?.status === 'pending'
                      ? 'bg-[var(--vendor-accent-action)] text-white hover:shadow-[var(--vendor-accent-action)]/30 active:scale-[0.98]'
                      : 'bg-[var(--color-bg-page)] text-[var(--color-text-muted)] border border-[var(--color-border)] cursor-not-allowed opacity-60'
                    }`}
                  >
                    {selectedOrder?.status === 'pending' ? (
                      <>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Confirm & Process
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      </>
                    ) : (
                      'Order Processed'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
