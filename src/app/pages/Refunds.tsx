import { useState, useEffect } from 'react';
import {
  Loader2, RotateCcw,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { formatCurrency } from '../utils/currency';
import { paymentService, RefundTransaction } from '../services/paymentService';
import { orderService } from '../services/orderService';
import { toast } from '../components/ui/toast';

interface RefundBreakdown {
  items_refund: number;
  transport_refund: number;
  commission_reversal: number;
  total_refund: number;
}

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
    image_url?: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  payment_status: string;
  items: OrderItem[];
  created_at: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'initiated':
      return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Initiated' };
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
    case 'successful':
      return { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' };
    case 'failed':
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
  }
};

export function Refunds() {
  const [refunds, setRefunds] = useState<RefundTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Eligible orders for refund
  const [eligibleOrders, setEligibleOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Refund request modal
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [refundReason, setRefundReason] = useState('customer_request');
  const [refundNotes, setRefundNotes] = useState('');
  const [breakdown, setBreakdown] = useState<RefundBreakdown | null>(null);
  const [calculatingBreakdown, setCalculatingBreakdown] = useState(false);
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Refund details modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundTransaction | null>(null);

  // Load refunds and orders
  const loadRefunds = async () => {
    setLoading(true);
    try {
      const result = await paymentService.getRefundHistory({
        limit: 50,
      });
      setRefunds(result.data);
    } catch (error) {
      console.error('Failed to load refunds:', error);
      toast({ type: 'error', title: 'Failed to load refund history' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadEligibleOrders = async () => {
    setLoadingOrders(true);
    try {
      const orders = await orderService.getRefundEligibleOrders();
      setEligibleOrders(orders as Order[]);
    } catch (error) {
      console.error('Failed to load eligible orders:', error);
      toast({ type: 'error', title: 'Failed to load eligible orders' });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOpenRequestModal = () => {
    setRequestModalOpen(true);
    loadEligibleOrders();
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setSelectedItems(order.items.map(item => item.id));
  };

  const handleToggleItem = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Calculate refund breakdown when order/items change
  useEffect(() => {
    if (selectedOrder && selectedItems.length > 0) {
      calculateBreakdown();
    } else {
      setBreakdown(null);
    }
  }, [selectedOrder, selectedItems]);

  const calculateBreakdown = async () => {
    if (!selectedOrder) return;
    setCalculatingBreakdown(true);
    try {
      const result = await paymentService.calculateRefund(selectedOrder.id);
      setBreakdown(result);
    } catch (error) {
      console.error('Failed to calculate breakdown:', error);
      toast({ type: 'error', title: 'Failed to calculate refund breakdown' });
    } finally {
      setCalculatingBreakdown(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!selectedOrder || selectedItems.length === 0) {
      toast({ type: 'error', title: 'Please select an order and items to refund' });
      return;
    }

    setSubmittingRefund(true);
    try {
      await paymentService.requestRefund(selectedOrder.id, {
        reason: refundReason,
        refund_type: selectedItems.length === selectedOrder.items.length ? 'full' : 'partial',
        notes: refundNotes || undefined,
      });

      toast({ type: 'success', title: 'Refund request submitted successfully' });
      setRequestModalOpen(false);
      setSelectedOrder(null);
      setSelectedItems([]);
      setRefundReason('customer_request');
      setRefundNotes('');

      // Reload refunds
      await loadRefunds();
    } catch (error: any) {
      console.error('Failed to request refund:', error);
      toast({ type: 'error', title: error.message || 'Failed to request refund' });
    } finally {
      setSubmittingRefund(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Refunds</h1>
            <p className="text-slate-600">Request and track your refunds</p>
          </div>
          <Button
            onClick={handleOpenRequestModal}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Request Refund
          </Button>
        </div>

        {/* Refund Request Modal */}
        <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request Refund</DialogTitle>
              <DialogDescription>
                Select items to refund and provide a reason
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Order Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Select Order
                </label>
                {loadingOrders ? (
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-slate-600">Loading eligible orders...</span>
                  </div>
                ) : eligibleOrders.length === 0 ? (
                  <p className="text-sm text-slate-500 p-3 bg-slate-50 rounded-lg">
                    No orders eligible for refund
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {eligibleOrders.map(order => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => handleSelectOrder(order)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedOrder?.id === order.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-900">#{order.order_number}</span>
                          <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.total_amount)}</span>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Item Selection */}
              {selectedOrder && selectedOrder.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Select Items to Refund
                  </label>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          selectedItems.includes(item.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleToggleItem(item.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">
                            {item.product?.name || `Item #${item.id}`}
                          </p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.subtotal)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Refund Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Reason for Refund
                </label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_request">Customer Request</SelectItem>
                    <SelectItem value="quality_issue">Quality Issue</SelectItem>
                    <SelectItem value="not_delivered">Not Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="h-24"
                />
              </div>

              {/* Breakdown */}
              {calculatingBreakdown && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <span className="ml-2 text-sm text-slate-600">Calculating refund...</span>
                </div>
              )}

              {!calculatingBreakdown && breakdown && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-blue-900 mb-3">Refund Breakdown</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-800">Items:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(breakdown.items_refund)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-800">Transport:</span>
                    <span className="font-medium text-blue-900">{formatCurrency(breakdown.transport_refund)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-blue-200 pt-2 mt-2">
                    <span className="text-blue-900 font-semibold">Total Refund:</span>
                    <span className="font-bold text-blue-900">{formatCurrency(breakdown.total_refund)}</span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRequestModalOpen(false)}
                disabled={submittingRefund}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestRefund}
                disabled={submittingRefund || !breakdown}
                className="gap-2"
              >
                {submittingRefund ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Request Refund
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Details Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refund Details</DialogTitle>
            </DialogHeader>

            {selectedRefund && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Order ID</span>
                    <span className="font-medium text-slate-900">#{selectedRefund.order_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Amount</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(selectedRefund.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Status</span>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge(selectedRefund.status).bg} ${statusBadge(selectedRefund.status).text}`}>
                      {statusBadge(selectedRefund.status).label}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Reason</span>
                    <span className="text-slate-900 capitalize">
                      {selectedRefund.reason.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Date</span>
                    <span className="text-slate-900">
                      {new Date(selectedRefund.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Breakdown */}
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <h4 className="font-semibold text-slate-900 mb-2 text-sm">Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Items</span>
                        <span className="text-slate-900">{formatCurrency(selectedRefund.breakdown.items_refund)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Transport</span>
                        <span className="text-slate-900">{formatCurrency(selectedRefund.breakdown.transport_refund)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Commission Reversal</span>
                        <span className="text-slate-900">{formatCurrency(selectedRefund.breakdown.commission_reversal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund History */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Refund History</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : refunds.length === 0 ? (
            <div className="text-center p-12">
              <RotateCcw className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <div className="text-slate-600 text-lg">No refunds yet</div>
              <p className="text-slate-500 text-sm mt-2">
                Request a refund using the button above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Order</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Reason</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((refund) => {
                    const badge = statusBadge(refund.status);
                    return (
                      <tr key={refund.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          #{refund.order_id}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatCurrency(refund.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                          {refund.reason.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(refund.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRefund(refund);
                              setDetailsModalOpen(true);
                            }}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
