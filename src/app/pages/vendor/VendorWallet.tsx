import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Wallet, TrendingUp, Clock, Lock, ArrowUpRight, ArrowDownLeft,
  Loader2, RefreshCw, Plus
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
import { formatCurrency } from '../../utils/currency';
import { vendorPaymentService, VendorWalletData, WalletTransaction } from '../../services/vendorPaymentService';
import { toast } from '../../components/ui/toast';

interface BalanceTile {
  title: string;
  amount: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function VendorWalletPage() {
  const [wallet, setWallet] = useState<VendorWalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Payout request modal
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutEstimate, setPayoutEstimate] = useState<any>(null);
  const [calculatingEstimate, setCalculatingEstimate] = useState(false);

  // Filters
  const [transactionType, setTransactionType] = useState('all');

  const loadWallet = async () => {
    setLoading(true);
    try {
      const [walletData, transactionsData] = await Promise.all([
        vendorPaymentService.getWallet(),
        vendorPaymentService.getWalletTransactions({
          limit: 20,
        }),
      ]);
      setWallet(walletData);
      setTransactions(transactionsData.data);
    } catch (error) {
      console.error('Failed to load wallet:', error);
      toast({ type: 'error', title: 'Failed to load wallet' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadWallet();
      toast({ type: 'success', title: 'Wallet refreshed' });
    } catch (error) {
      toast({ type: 'error', title: 'Failed to refresh wallet' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleEstimatePayout = async () => {
    if (!payoutAmount || isNaN(Number(payoutAmount))) {
      toast({ type: 'error', title: 'Please enter a valid amount' });
      return;
    }

    setCalculatingEstimate(true);
    try {
      const estimate = await vendorPaymentService.estimatePayoutFees(
        Number(payoutAmount),
        paymentMethod
      );
      setPayoutEstimate(estimate);
    } catch (error: any) {
      console.error('Failed to estimate payout:', error);
      toast({ type: 'error', title: error.message || 'Failed to estimate payout' });
    } finally {
      setCalculatingEstimate(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutAmount || isNaN(Number(payoutAmount))) {
      toast({ type: 'error', title: 'Please enter a valid amount' });
      return;
    }

    if (Number(payoutAmount) < 10000) {
      toast({ type: 'error', title: 'Minimum payout amount is 10,000 TZS' });
      return;
    }

    if (!wallet || Number(payoutAmount) > wallet.available_balance) {
      toast({ type: 'error', title: 'Insufficient available balance' });
      return;
    }

    if (paymentMethod === 'bank_transfer' && (!accountNumber || !bankName || !accountHolder)) {
      toast({ type: 'error', title: 'Please fill in all bank details' });
      return;
    }

    if (['mpesa', 'airtel_money', 'tigo_pesa'].includes(paymentMethod) && !phoneNumber) {
      toast({ type: 'error', title: 'Please enter a phone number' });
      return;
    }

    setSubmittingPayout(true);
    try {
      await vendorPaymentService.requestPayout({
        amount: Number(payoutAmount),
        payment_method: paymentMethod as 'mpesa' | 'airtel_money' | 'bank_transfer',
        phone_number: phoneNumber || undefined,
        account_number: accountNumber || undefined,
        bank_name: bankName || undefined,
        account_holder_name: accountHolder || undefined,
      });

      toast({ type: 'success', title: 'Payout request submitted successfully' });
      setPayoutModalOpen(false);
      setPayoutAmount('');
      setPaymentMethod('mpesa');
      setPhoneNumber('');
      setAccountNumber('');
      setBankName('');
      setAccountHolder('');
      setPayoutEstimate(null);

      // Reload wallet
      await loadWallet();
    } catch (error: any) {
      console.error('Failed to request payout:', error);
      toast({ type: 'error', title: error.message || 'Failed to request payout' });
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Wallet</h2>
          <p className="text-slate-600 mb-4">Unable to retrieve wallet information</p>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  const balanceTiles: BalanceTile[] = [
    {
      title: 'Available Balance',
      amount: wallet.available_balance,
      description: 'Ready to withdraw',
      icon: <Wallet className="h-5 w-5" />,
      color: 'from-blue-600 to-blue-700',
    },
    {
      title: 'Pending Balance',
      amount: wallet.pending_balance,
      description: 'Awaiting delivery',
      icon: <Clock className="h-5 w-5" />,
      color: 'from-yellow-600 to-yellow-700',
    },
    {
      title: 'Held Balance',
      amount: wallet.held_balance,
      description: 'Under dispute',
      icon: <Lock className="h-5 w-5" />,
      color: 'from-orange-600 to-orange-700',
    },
    {
      title: 'Lifetime Earnings',
      amount: wallet.lifetime_earnings,
      description: 'Total earned',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'from-green-600 to-green-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Wallet</h1>
            <p className="text-slate-600">Manage your earnings and request payouts</p>
          </div>
          <div className="flex gap-2">
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
            <Button
              onClick={() => setPayoutModalOpen(true)}
              disabled={wallet.available_balance === 0}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Request Payout
            </Button>
          </div>
        </div>

        {/* Balance Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {balanceTiles.map((tile, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${tile.color} rounded-lg shadow-lg p-6 text-white`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  {tile.icon}
                </div>
              </div>
              <h3 className="text-sm font-medium opacity-90 mb-1">{tile.title}</h3>
              <p className="text-2xl font-bold mb-2">{formatCurrency(tile.amount)}</p>
              <p className="text-xs opacity-75">{tile.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Payout Request Modal */}
        <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Withdraw your available balance
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Amount (TZS)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => {
                      setPayoutAmount(e.target.value);
                      setPayoutEstimate(null);
                    }}
                    min="10000"
                    max={wallet.available_balance}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPayoutAmount(wallet.available_balance.toString())}
                  >
                    Max
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Available: {formatCurrency(wallet.available_balance)}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Payment Method
                </label>
                <Select value={paymentMethod} onValueChange={(value) => {
                  setPaymentMethod(value);
                  setPayoutEstimate(null);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="airtel_money">Airtel Money</SelectItem>
                    <SelectItem value="tigo_pesa">Tigo Pesa</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Details - Mobile Money */}
              {['mpesa', 'airtel_money', 'tigo_pesa'].includes(paymentMethod) && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Phone Number
                  </label>
                  <Input
                    placeholder="07XX XXX XXX or +2557XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              )}

              {/* Payment Details - Bank Transfer */}
              {paymentMethod === 'bank_transfer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Bank Name
                    </label>
                    <Input
                      placeholder="e.g., CRDB Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Account Number
                    </label>
                    <Input
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Account Holder Name
                    </label>
                    <Input
                      placeholder="Full name"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Estimate */}
              {!payoutEstimate && payoutAmount && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleEstimatePayout}
                  disabled={calculatingEstimate}
                >
                  {calculatingEstimate ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Calculating...
                    </>
                  ) : (
                    'Estimate Fees'
                  )}
                </Button>
              )}

              {/* Estimated Breakdown */}
              {payoutEstimate && (
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-slate-900 text-sm mb-3">Fee Breakdown</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(payoutEstimate.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Fee:</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(payoutEstimate.fee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2">
                    <span className="text-slate-900 font-semibold">You'll Receive:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(payoutEstimate.net_amount)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    Processing time: {payoutEstimate.processing_time}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPayoutModalOpen(false)}
                disabled={submittingPayout}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestPayout}
                disabled={submittingPayout || !payoutEstimate || !payoutAmount}
                className="gap-2"
              >
                {submittingPayout ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  'Request Payout'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-40">
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

          {transactions.length === 0 ? (
            <div className="text-center p-12">
              <div className="text-slate-600 text-lg">No transactions yet</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Description</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => {
                    const isCredit = ['credit', 'refund'].includes(transaction.transaction_type);
                    return (
                      <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isCredit ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            {transaction.transaction_type.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {transaction.description}
                        </td>
                        <td className={`px-6 py-4 text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
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

function AlertIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
