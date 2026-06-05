import { useState, useEffect } from 'react';
import {
  Clock, CheckCircle, AlertCircle, Loader2, RefreshCw, Eye, TrendingDown, ChevronLeft, ChevronRight,
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
import { safeFormatCurrency } from '../../utils/currency';
import { vendorPaymentService, VendorPayout } from '../../services/vendorPaymentService';
import { toast } from '../../components/ui/toast';
import {
  VendorCard,
  VendorEmptyState,
  VendorPageHeader,
  VendorTableSkeleton,
} from '../../components/vendor';

const statusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-[var(--vendor-accent-action-bg)]', text: 'text-[var(--vendor-accent-action)]', icon: Clock, label: 'Pending' };
    case 'queued':
    case 'processing':
      return { bg: 'bg-[var(--vendor-accent-warning-bg)]', text: 'text-[var(--vendor-accent-warning)]', icon: Loader2, label: status === 'queued' ? 'Queued' : 'Processing' };
    case 'completed':
      return { bg: 'bg-[var(--vendor-accent-success-bg)]', text: 'text-[var(--vendor-accent-success)]', icon: CheckCircle, label: 'Completed' };
    case 'failed':
      return { bg: 'bg-red-50', text: 'text-red-600', icon: AlertCircle, label: 'Failed' };
    case 'reversed':
      return { bg: 'bg-neutral-100', text: 'text-neutral-600', icon: TrendingDown, label: 'Reversed' };
    default:
      return { bg: 'bg-neutral-100', text: 'text-neutral-600', icon: Clock, label: 'Unknown' };
  }
};

export function VendorPayouts() {
  const [payouts, setPayouts] = useState<VendorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<VendorPayout | null>(null);
  const [payoutDetails, setPayoutDetails] = useState<{ items: Array<{ id: number; order_id: number; amount: number }> } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [total, setTotal] = useState(0);

  const loadPayouts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const result = await vendorPaymentService.getPayouts({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit,
        page: pageNum,
      });
      setPayouts(result.data);
      setTotal(result.total);
    } catch {
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
    } catch {
      toast({ type: 'error', title: 'Failed to refresh' });
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
    } catch {
      toast({ type: 'error', title: 'Failed to load details' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <VendorPageHeader
        title="Payouts"
        description="Track and manage your withdrawal requests."
        actions={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2 rounded-xl">
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        }
      />

      <VendorCard className="p-4">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </VendorCard>

      <VendorCard className="overflow-hidden">
        {loading ? (
          <VendorTableSkeleton />
        ) : payouts.length === 0 ? (
          <div className="p-8">
            <VendorEmptyState
              variant="no-payouts"
              title="No payouts yet"
              description="Request a payout from your Wallet once you have available balance."
              actionLabel="Go to Wallet"
              actionHref="/vendor/dashboard/wallet"
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Method</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => {
                    const badge = statusBadge(payout.status);
                    const BadgeIcon = badge.icon;
                    return (
                      <tr key={payout.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-card)]/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">#{payout.id}</td>
                        <td className="px-6 py-4 text-sm font-bold">{safeFormatCurrency(payout.amount)}</td>
                        <td className="px-6 py-4 text-sm capitalize text-[var(--color-text-body)]">{payout.payment_method?.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">{new Date(payout.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(payout)} className="gap-1 rounded-xl">
                            <Eye className="h-4 w-4" /> Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-muted)]">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </VendorCard>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="vendor-heading">Payout #{selectedPayout?.id}</DialogTitle>
            <DialogDescription>Full payout details</DialogDescription>
          </DialogHeader>

          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-[16px] bg-[var(--color-bg-card)] p-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Status</p>
                  <p className="font-semibold capitalize mt-1">{selectedPayout.status}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Amount</p>
                  <p className="font-bold text-lg mt-1">{safeFormatCurrency(selectedPayout.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Method</p>
                  <p className="font-medium capitalize mt-1">{selectedPayout.payment_method?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Attempts</p>
                  <p className="font-medium mt-1">{selectedPayout.attempt_count} / {selectedPayout.max_attempts}</p>
                </div>
              </div>

              {selectedPayout.phone_number && (
                <div className="text-sm flex justify-between"><span className="text-[var(--color-text-muted)]">Phone</span><span>{selectedPayout.phone_number}</span></div>
              )}

              {selectedPayout.error_message && (
                <div className="rounded-[16px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{selectedPayout.error_message}</div>
              )}

              {loadingDetails ? (
                <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin text-[var(--vendor-accent-action)]" /></div>
              ) : payoutDetails?.items && payoutDetails.items.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold mb-2">Included Items</p>
                  {payoutDetails.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 rounded-xl bg-[var(--color-bg-card)] mb-2 text-sm">
                      <span>Order #{item.order_id}</span>
                      <span className="font-bold">{safeFormatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)} className="rounded-xl">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
