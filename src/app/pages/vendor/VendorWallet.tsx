import { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  TrendingUp,
  Clock,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
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
import { Input } from '../../components/ui/input';
import { safeFormatCurrency } from '../../utils/currency';
import {
  vendorPaymentService,
  VendorWalletData,
  WalletTransaction,
  MIN_PAYOUT_AMOUNT,
} from '../../services/vendorPaymentService';
import { toast } from '../../components/ui/toast';
import {
  VendorBalanceTile,
  VendorCard,
  VendorEmptyState,
  VendorInlineError,
  VendorPageHeader,
  VendorSuccessFeedback,
  VendorTableSkeleton,
  VendorWalletSkeleton,
} from '../../components/vendor';

const PAGE_SIZE = 15;

export function VendorWalletPage() {
  const [wallet, setWallet] = useState<VendorWalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutEstimate, setPayoutEstimate] = useState<{
    amount: number;
    fee: number;
    net_amount: number;
    processing_time: string;
  } | null>(null);
  const [calculatingEstimate, setCalculatingEstimate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [transactionType, setTransactionType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const loadWallet = useCallback(async (pageNum = 1, typeFilter = transactionType) => {
    setLoading(true);
    setError(null);
    try {
      const [details, transactionsData] = await Promise.all([
        vendorPaymentService.getWalletDetails(),
        vendorPaymentService.getWalletTransactions({
          transaction_type: typeFilter === 'all' ? undefined : typeFilter,
          page: pageNum,
          limit: PAGE_SIZE,
        }),
      ]);
      setWallet(details.wallet);
      setTransactions(transactionsData.data);
      setTotalTransactions(transactionsData.total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load wallet';
      setError(message);
      toast({ type: 'error', title: message });
    } finally {
      setLoading(false);
    }
  }, [transactionType]);

  useEffect(() => {
    loadWallet(page, transactionType);
  }, [page, transactionType, loadWallet]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadWallet(page, transactionType);
      toast({ type: 'success', title: 'Wallet refreshed' });
    } catch {
      toast({ type: 'error', title: 'Failed to refresh wallet' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleEstimatePayout = async () => {
    const amount = Number(payoutAmount);
    if (!payoutAmount || !Number.isFinite(amount)) {
      toast({ type: 'error', title: 'Please enter a valid amount' });
      return;
    }

    setCalculatingEstimate(true);
    try {
      const estimate = await vendorPaymentService.estimatePayoutFees(amount, paymentMethod);
      setPayoutEstimate(estimate);
    } catch (err: unknown) {
      toast({ type: 'error', title: err instanceof Error ? err.message : 'Failed to estimate payout' });
    } finally {
      setCalculatingEstimate(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = Number(payoutAmount);
    if (!payoutAmount || !Number.isFinite(amount)) {
      toast({ type: 'error', title: 'Please enter a valid amount' });
      return;
    }

    if (amount < MIN_PAYOUT_AMOUNT) {
      toast({ type: 'error', title: `Minimum payout is ${MIN_PAYOUT_AMOUNT.toLocaleString()} TZS` });
      return;
    }

    if (!wallet || amount > wallet.available_balance) {
      toast({ type: 'error', title: 'Insufficient available balance' });
      return;
    }

    setSubmittingPayout(true);
    try {
      await vendorPaymentService.requestPayout({ amount });
      setShowSuccess(true);
      toast({ type: 'success', title: 'Payout request submitted!' });
      setPayoutModalOpen(false);
      setPayoutAmount('');
      setPayoutEstimate(null);
      await loadWallet(page, transactionType);
    } catch (err: unknown) {
      toast({ type: 'error', title: err instanceof Error ? err.message : 'Failed to request payout' });
    } finally {
      setSubmittingPayout(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalTransactions / PAGE_SIZE));

  if (loading && !wallet) {
    return <VendorWalletSkeleton />;
  }

  return (
    <div className="space-y-6">
      <VendorSuccessFeedback show={showSuccess} message="Payout Requested!" onComplete={() => setShowSuccess(false)} />

      <VendorPageHeader
        title="Wallet"
        description="Manage earnings and request payouts."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2 rounded-xl">
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setPayoutModalOpen(true)}
              disabled={!wallet || wallet.available_balance < MIN_PAYOUT_AMOUNT}
              title={
                !wallet
                  ? 'Loading wallet…'
                  : wallet.available_balance < MIN_PAYOUT_AMOUNT
                    ? `Minimum payout: ${MIN_PAYOUT_AMOUNT.toLocaleString()} TZS (available: ${safeFormatCurrency(wallet.available_balance)})`
                    : 'Request a payout'
              }
              className="gap-2 rounded-xl bg-[var(--vendor-accent-action)] hover:bg-[#6d28d9] disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Request Payout
            </Button>
          </>
        }
      />

      {wallet && wallet.available_balance < MIN_PAYOUT_AMOUNT && (
        <p className="text-sm text-[var(--color-text-muted)] vendor-body -mt-2">
          Request Payout unlocks when available balance reaches {MIN_PAYOUT_AMOUNT.toLocaleString()} TZS
          (currently {safeFormatCurrency(wallet.available_balance)}).
        </p>
      )}

      {error && !wallet && <VendorInlineError message={error} onRetry={() => loadWallet(page, transactionType)} />}

      {wallet && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <VendorBalanceTile title="Available" amount={wallet.available_balance} description="Ready to withdraw" icon={<Wallet className="h-5 w-5" />} variant="available" index={0} />
          <VendorBalanceTile title="Pending" amount={wallet.pending_balance} description="Awaiting delivery" icon={<Clock className="h-5 w-5" />} variant="pending" index={1} />
          <VendorBalanceTile title="Held" amount={wallet.held_balance} description="Under dispute" icon={<Lock className="h-5 w-5" />} variant="held" index={2} />
          <VendorBalanceTile title="Lifetime Earnings" amount={wallet.lifetime_earnings} description="Total earned" icon={<TrendingUp className="h-5 w-5" />} variant="lifetime" index={3} />
        </div>
      )}

      <VendorCard className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading">Transaction History</h2>
          <Select
            value={transactionType}
            onValueChange={(value) => {
              setTransactionType(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-44 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="credit">Credits</SelectItem>
              <SelectItem value="debit">Debits</SelectItem>
              <SelectItem value="payout">Payouts</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <VendorTableSkeleton />
        ) : transactions.length === 0 ? (
          <div className="p-8">
            <VendorEmptyState
              variant="no-transactions"
              title="No transactions yet"
              description="Wallet activity will appear here as you earn from sales and request payouts."
              actionLabel="View Products"
              actionHref="/vendor/dashboard/products"
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const isCredit = ['credit', 'refund'].includes(transaction.transaction_type);
                    return (
                      <tr key={transaction.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-card)]/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isCredit ? 'bg-[var(--vendor-accent-success-bg)] text-[var(--vendor-accent-success)]' : 'bg-red-50 text-red-600'}`}>
                            {isCredit ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {transaction.transaction_type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-text-body)] vendor-body">{transaction.description}</td>
                        <td className={`px-6 py-4 text-sm font-bold ${isCredit ? 'text-[var(--vendor-accent-success)]' : 'text-red-600'}`}>
                          {isCredit ? '+' : '-'}{safeFormatCurrency(Math.abs(transaction.amount))}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--color-text-muted)]">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Page {page} of {totalPages} · {totalTransactions} total
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-xl">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </VendorCard>

      <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
        <DialogContent className="max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="vendor-heading">Request Payout</DialogTitle>
            <DialogDescription>Withdraw from your available balance</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (TZS)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={payoutAmount}
                  onChange={(e) => {
                    setPayoutAmount(e.target.value);
                    setPayoutEstimate(null);
                  }}
                  min={MIN_PAYOUT_AMOUNT}
                  max={wallet?.available_balance}
                  className="rounded-xl"
                />
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => wallet && setPayoutAmount(String(wallet.available_balance))}>
                  Max
                </Button>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Available: {safeFormatCurrency(wallet?.available_balance)} · Min: {MIN_PAYOUT_AMOUNT.toLocaleString()} TZS
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estimate with method</label>
              <Select value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v); setPayoutEstimate(null); }}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="airtel_money">Airtel Money</SelectItem>
                  <SelectItem value="mixx_by_yas">Mixx by Yas</SelectItem>
                  <SelectItem value="halopesa">HaloPesa</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!payoutEstimate && payoutAmount && (
              <Button variant="outline" className="w-full rounded-xl" onClick={handleEstimatePayout} disabled={calculatingEstimate}>
                {calculatingEstimate ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Calculating...</> : 'Estimate Fees'}
              </Button>
            )}

            {payoutEstimate && (
              <div className="rounded-[16px] bg-[var(--color-bg-card)] p-4 space-y-2">
                <div className="flex justify-between text-sm"><span>Amount</span><span className="font-medium">{safeFormatCurrency(payoutEstimate.amount)}</span></div>
                <div className="flex justify-between text-sm"><span>Fee</span><span className="font-medium">{safeFormatCurrency(payoutEstimate.fee)}</span></div>
                <div className="flex justify-between text-sm border-t pt-2 font-bold"><span>You'll receive</span><span>{safeFormatCurrency(payoutEstimate.net_amount)}</span></div>
                <p className="text-xs text-[var(--color-text-muted)]">Processing: {payoutEstimate.processing_time}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutModalOpen(false)} disabled={submittingPayout} className="rounded-xl">Cancel</Button>
            <Button
              onClick={handleRequestPayout}
              disabled={submittingPayout || !payoutAmount}
              className="rounded-xl bg-[var(--vendor-accent-action)] hover:bg-[#6d28d9]"
            >
              {submittingPayout ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Requesting...</> : 'Confirm Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
