import { useState, useEffect } from 'react';
import {
  Calendar, Search, Download,
  CheckCircle, XCircle, Clock, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { formatCurrency } from '../utils/currency';
import { paymentService, PaymentTransaction } from '../services/paymentService';
import { toast } from '../components/ui/toast';

const statusBadge = (status: string) => {
  switch (status) {
    case 'successful':
      return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Successful' };
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' };
    case 'failed':
      return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Failed' };
    case 'expired':
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle, label: 'Expired' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock, label: 'Unknown' };
  }
};

export function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const result = await paymentService.getPaymentHistory({
        status: statusFilter === 'all' ? undefined : statusFilter,
        payment_method: methodFilter === 'all' ? undefined : methodFilter,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit,
        offset: (page - 1) * limit,
      });

      setPayments(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast({ type: 'error', title: 'Failed to load payment history' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter, methodFilter, dateFrom, dateTo]);

  const handleViewDetails = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const handleDownloadReceipt = async (paymentId: number) => {
    setDownloadingReceipt(true);
    try {
      await paymentService.downloadReceipt(paymentId, 'pdf');
      toast({ type: 'success', title: 'Receipt downloaded successfully' });
    } catch (error) {
      console.error('Failed to download receipt:', error);
      toast({ type: 'error', title: 'Failed to download receipt' });
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (searchTerm) {
      return (
        payment.order_id.toString().includes(searchTerm) ||
        payment.provider_reference?.includes(searchTerm) ||
        payment.amount.toString().includes(searchTerm)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment History</h1>
          <p className="text-slate-600">View and manage your payment transactions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search order ID or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select value={methodFilter} onValueChange={(value) => {
              setMethodFilter(value);
              setPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mpesa">M-Pesa</SelectItem>
                <SelectItem value="airtel_money">Airtel Money</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(dateFrom || dateTo || statusFilter !== 'all' || methodFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setStatusFilter('all');
                setMethodFilter('all');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center p-12">
              <div className="text-slate-400 text-lg">No payments found</div>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Order ID</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Method</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const badge = statusBadge(payment.status);
                    const BadgeIcon = badge.icon;

                    return (
                      <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          Order #{payment.order_id}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                          {payment.payment_method?.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            <BadgeIcon className="h-4 w-4" />
                            {badge.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
                            >
                              Details
                            </Button>
                            {payment.status === 'successful' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReceipt(payment.id)}
                                disabled={downloadingReceipt}
                              >
                                {downloadingReceipt ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} payments
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={p === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
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
        </div>
      </div>

      {/* Payment Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Order #{selectedPayment?.order_id}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Amount</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status</span>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusBadge(selectedPayment.status).bg} ${statusBadge(selectedPayment.status).text}`}>
                    {statusBadge(selectedPayment.status).label}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Method</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {selectedPayment.payment_method?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Date</span>
                  <span className="text-slate-900">
                    {new Date(selectedPayment.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Phone</span>
                  <span className="font-medium text-slate-900">
                    {selectedPayment.customer_phone}
                  </span>
                </div>
                {selectedPayment.provider_reference && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Reference</span>
                    <span className="text-xs font-mono text-slate-900 truncate">
                      {selectedPayment.provider_reference}
                    </span>
                  </div>
                )}
                {selectedPayment.error_message && (
                  <div className="flex justify-between items-start">
                    <span className="text-slate-600">Error</span>
                    <span className="text-sm text-red-600 text-right">
                      {selectedPayment.error_message}
                    </span>
                  </div>
                )}
              </div>

              {selectedPayment.status === 'successful' && (
                <Button
                  className="w-full"
                  onClick={() => {
                    handleDownloadReceipt(selectedPayment.id);
                    setDetailsOpen(false);
                  }}
                  disabled={downloadingReceipt}
                >
                  {downloadingReceipt ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Receipt
                </Button>
              )}
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
