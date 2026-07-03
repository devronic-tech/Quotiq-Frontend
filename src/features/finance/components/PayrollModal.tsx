import { useState, useEffect } from 'react';
import { X, CreditCard, Save } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

interface EmployeePayroll {
  id: string;
  employeeName: string;
  department: string;
  salary: number;
  bonus: number;
  pending: number;
  paid: number;
  paymentMode: string;
  status: string;
}

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: (payload: any) => void;
  payroll: EmployeePayroll | null;
  isLoading?: boolean;
}

export default function PayrollModal({ isOpen, onClose, onPay, payroll, isLoading = false }: PayrollModalProps) {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (payroll) {
      setAmountPaid(payroll.pending.toString());
      setPaymentMethod(payroll.paymentMode || 'bank_transfer');
      setTransactionReference('');
      setNotes(`Salary Payout for ${payroll.employeeName}`);
    }
  }, [payroll, isOpen]);

  if (!isOpen || !payroll) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPaid) return;

    onPay({
      amountPaid: Number(amountPaid),
      paymentMethod,
      transactionReference: transactionReference || undefined,
      notes: notes || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-md z-[60] overflow-y-auto">
      <div className="bg-white border border-outline-variant/60 rounded-2xl w-full max-w-md min-w-[320px] md:min-w-[450px] shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="gradient-emerald px-lg py-md text-white flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <CreditCard size={20} />
            <h3 className="font-card-title text-base font-black uppercase tracking-wider">
              Disburse Salary Payment
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-lg space-y-md">
          <div className="space-y-sm bg-slate-50 border border-outline-variant/30 rounded-xl p-md">
            <div className="flex justify-between">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Employee</span>
              <span className="text-xs font-bold text-on-surface">{payroll.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Department</span>
              <span className="text-xs text-on-surface">{payroll.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Salary Owed</span>
              <span className="text-xs font-bold text-primary font-mono">₹{Number(payroll.pending).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-md">
            {/* Amount Paid */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Disbursed Amount (₹) *</label>
              <input
                type="number"
                required
                max={payroll.pending}
                min="1"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface font-mono"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              >
                <option value="bank_transfer">Bank Wire Transfer</option>
                <option value="upi">UPI IMPS / NEFT</option>
                <option value="cash">Cash Settlement</option>
              </select>
            </div>

            {/* Reference */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Transaction reference / Bank UTR *</label>
              <input
                type="text"
                required
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="e.g. TXN99482910398"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface font-mono"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Payment description / Memo</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Salary Payout - May 2026"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-sm border-t border-outline-variant/30 pt-md mt-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-md py-2.5 text-xs font-bold border border-outline-variant/60 rounded-lg text-secondary hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              icon={<Save size={14} />}
              className="px-md h-10 text-xs font-bold"
            >
              Mark Paid
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
