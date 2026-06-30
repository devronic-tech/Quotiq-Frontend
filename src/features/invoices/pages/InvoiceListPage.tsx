import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/shared/lib/axios';
import Button from '@/shared/components/ui/Button';
import { Plus, Receipt, Trash2, Loader2, CreditCard, DollarSign, Search, Download, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  company: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'voided';
  grandTotal: string;
  amountPaid: string;
  issueDate: string;
  dueDate: string;
  customer: Customer;
}

export default function InvoiceListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state for payment
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Payment form states
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'cheque' | 'card' | 'upi'>('bank_transfer');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch Invoices
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/v1/invoices');
      return data.data;
    },
  });

  // Record payment mutation
  const paymentMutation = useMutation({
    mutationFn: async ({ invoiceId, payload }: { invoiceId: string; payload: any }) => {
      await api.post(`/v1/invoices/${invoiceId}/payments`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment recorded successfully');
      setIsPaymentModalOpen(false);
      setAmount('');
      setRef('');
      setNotes('');
      setSelectedInvoice(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to record payment');
    },
  });

  // Delete invoice mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete invoice');
    },
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/v1/invoices/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    },
  });

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'partially_paid': return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'unpaid': return 'bg-red-50 text-red-700 border-red-300';
      case 'overdue': return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'draft': return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'voided': return 'bg-gray-100 text-gray-500 border-gray-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return '✔ Fully Paid';
      case 'partially_paid': return '⚡ Partially Paid';
      case 'unpaid': return '✗ Unpaid';
      case 'overdue': return '⚠ Overdue';
      case 'draft': return 'Draft';
      case 'voided': return 'Voided';
      default: return status;
    }
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !amount) return;

    paymentMutation.mutate({
      invoiceId: selectedInvoice.id,
      payload: {
        amount: Number(amount),
        paymentMethod,
        transactionReference: ref || undefined,
        notes: notes || undefined,
      },
    });
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setAmount((Number(inv.grandTotal) - Number(inv.amountPaid)).toString());
    setIsPaymentModalOpen(true);
  };

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(inv => {
    const num = (inv.invoiceNumber || '').toLowerCase();
    const client = (inv.customer?.name || '').toLowerCase();
    const company = (inv.customer?.company || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return num.includes(query) || client.includes(query) || company.includes(query);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Quick Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-on-surface">Invoices</h2>
          <p className="text-xs text-on-surface-variant">Manage billing, GST details, payment tracking, and transaction logs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate('/invoices/new')}
            className="h-10"
          >
            New Invoice
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-primary">
            <Receipt size={24} />
          </div>
          <h3 className="text-sm font-bold text-on-surface">No invoices found</h3>
          <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed mt-1">
            Convert an existing approved quotation into an invoice, or build one manually.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            icon={<Plus size={14} />}
            onClick={() => navigate('/invoices/new')}
          >
            Create Invoice
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Paid</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-on-surface">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-bold font-mono text-primary">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3.5 capitalize font-semibold text-slate-600">{inv.type}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-on-surface">{inv.customer?.name}</div>
                      {inv.customer?.company && <div className="text-[10px] text-slate-400">{inv.customer.company}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3.5 font-bold font-mono text-on-surface">₹{Number(inv.grandTotal).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3.5 text-emerald-700 font-bold font-mono">
                      {Number(inv.amountPaid) > 0 ? `₹${Number(inv.amountPaid).toLocaleString('en-IN')}` : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {/* Inline status dropdown */}
                      <select
                        value={inv.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          statusMutation.mutate({ id: inv.id, status: e.target.value });
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer outline-none appearance-none pr-6 ${getStatusColor(inv.status)}`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 6px center',
                        }}
                      >
                        <option value="unpaid">✗ Unpaid</option>
                        <option value="partially_paid">⚡ Partially Paid</option>
                        <option value="paid">✔ Fully Paid</option>
                        <option value="overdue">⚠ Overdue</option>
                        <option value="draft">Draft</option>
                        <option value="voided">Voided</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {inv.status !== 'paid' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenPayment(inv); }}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); window.open(`/invoices/${inv.id}?print=true`, '_blank'); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Download / Print PDF"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this invoice?')) {
                              deleteMutation.mutate(inv.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Invoice"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal — rendered via portal at document.body to escape layout stacking context */}
      {isPaymentModalOpen && createPortal(
        <div
          onClick={() => setIsPaymentModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '480px',
              maxWidth: 'calc(100vw - 32px)',
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
              borderRadius: '16px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Record Payment</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                  {selectedInvoice?.invoiceNumber} — Balance: ₹{(Number(selectedInvoice?.grandTotal || 0) - Number(selectedInvoice?.amountPaid || 0)).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRecordPaymentSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Amount */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Payment Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={Number(selectedInvoice?.grandTotal || 0) - Number(selectedInvoice?.amountPaid || 0)}
                    value={amount}
                    onChange={(e) => {
                      const balance = Number(selectedInvoice?.grandTotal || 0) - Number(selectedInvoice?.amountPaid || 0);
                      const val = Math.min(Number(e.target.value), balance);
                      setAmount(val > 0 ? String(val) : e.target.value);
                    }}
                    required
                    placeholder="0.00"
                    style={{ width: '100%', height: '40px', paddingLeft: '28px', paddingRight: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#fff', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Reference */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Transaction Reference / ID</label>
                <input
                  type="text"
                  placeholder="e.g. TXN10283091238"
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>Notes</label>
                <textarea
                  rows={2}
                  placeholder="Payment remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', backgroundColor: '#fff', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  style={{ padding: '0 16px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentMutation.isPending}
                  style={{ padding: '0 16px', height: '36px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, color: '#fff', backgroundColor: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: paymentMutation.isPending ? 0.7 : 1 }}
                >
                  {paymentMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
