import { useState, useEffect } from 'react';
import {
  Clock, CheckCircle, AlertCircle, Loader2, RefreshCw, Eye,
  TrendingDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { formatCurrency } from '../../utils/currency';
import { vendorPaymentService, VendorPayout } from '../../services/vendorPaymentService';
import { toast } from '../../components/ui/toast';

const statusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Pending' };
    case 'queued':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Queued' };
    case 'processing':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Loader2, label: 'Processing' };
    case 'completed':
      return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Completed' };
    case 'failed':
      return { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Failed' };
    case 'reversed':
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: TrendingDown, label: 'Reversed' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock, label: 'Unknown' };
  }
};

export function VendorPayouts() {
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<VendorPayout | null>(null);
  const [payoutDetails, setPayoutDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);

  const loadPayouts = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const result = await vendorPaymentService.getPayouts({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit,
        offset: (pageNum - 1) * limit,
      });
      setPayouts(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load payouts:', error);
      toast({ type: 'error', title: 'Failed to load payouts' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts(page);
  }, [page, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPayouts(page);
      toast({ type: 'success', title: 'Payouts refreshed' });
    } catch (error) {
      toast({ type: 'error', title: 'Failed to refresh payouts' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = async (payout: VendorPayout) => {
    setSelectedPayout(payout);
    setDetailsOpen(true);
    setLoadingDetails(true);
    try {
      const details = await vendorPaymentService.getPayoutDetails(payout.id);
      setPayoutDetails(details);
    } catch (error) {
      console.error('Failed to load payout details:', error);
      toast({ type: 'error', title: 'Failed to load payout details' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Payouts</h1>
            <p className="text-slate-600">Track and manage your payout requests</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="reversed">Reversed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center p-12">
              <div className="text-slate-600 text-lg">No payouts found</div>
              <p className="text-slate-500 text-sm mt-2">Go to Wallet to request a payout</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">ID</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Amount</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Method</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Attempts</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => {
                      const badge = statusBadge(payout.status);
                      const BadgeIcon = badge.icon;
                      return (
                        <tr key={payout.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            #{payout.id}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                            {formatCurrency(payout.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                            {payout.payment_method?.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                              <BadgeIcon className="h-3 w-3" />
                              {badge.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {payout.attempt_count} / {payout.max_attempts}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(payout.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(payout)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} payouts
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payout Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
            <DialogDescription>
              Payout #{selectedPayout?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedPayout && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusBadge(selectedPayout.status).bg} ${statusBadge(selectedPayout.status).text}`}>
                      {statusBadge(selectedPayout.status).label}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Amount</p>
                    <p className="text-xl font-bold text-slate-900">
                      {formatCurrency(selectedPayout.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                    <p className="font-medium text-slate-900 capitalize">
                      {selectedPayout.payment_method?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Attempts</p>
                    <p className="font-medium text-slate-900">
                      {selectedPayout.attempt_count} / {selectedPayout.max_attempts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  {selectedPayout.phone_number && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone Number</span>
                      <span className="font-medium text-slate-900">{selectedPayout.phone_number}</span>
                    </div>
                  )}
                  {selectedPayout.account_number && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bank Name</span>
                        <span className="font-medium text-slate-900">{selectedPayout.bank_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Account Number</span>
                        <span className="font-medium text-slate-900">{selectedPayout.account_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Account Holder</span>
                        <span className="font-medium text-slate-900">{selectedPayout.account_holder_name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 text-sm">Timeline</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Requested</span>
                    <span className="font-medium text-slate-900">
                      {new Date(selectedPayout.created_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedPayout.processed_at && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Processed</span>
                      <span className="font-medium text-slate-900">
                        {new Date(selectedPayout.processed_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Updated</span>
                    <span className="font-medium text-slate-900">
                      {new Date(selectedPayout.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {selectedPayout.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2 text-sm">Error</h3>
                  <p className="text-sm text-red-800">{selectedPayout.error_message}</p>
                </div>
              )}

              {/* Payout Items */}
              {loadingDetails ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                </div>
              ) : payoutDetails?.items && payoutDetails.items.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm">Items Included</h3>
                  <div className="space-y-2">
                    {payoutDetails.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Order #{item.order_id}</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
