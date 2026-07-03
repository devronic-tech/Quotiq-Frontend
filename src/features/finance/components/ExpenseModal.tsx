import { useState, useEffect } from 'react';
import { X, Save, FileText, Loader2, Sparkles } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

interface Expense {
  id?: string;
  title: string;
  category: string;
  vendor: string;
  employee: string;
  project: string;
  department: string;
  amount: number;
  gst: number;
  currency: string;
  exchangeRate: number;
  paymentMethod: string;
  recurring: boolean;
  priority: string;
  expenseDate: string;
  invoiceNumber: string;
  description: string;
  notes: string;
  approvalStatus: string;
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  expense?: Expense | null;
  isLoading?: boolean;
}

export default function ExpenseModal({ isOpen, onClose, onSave, expense = null, isLoading = false }: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software');
  const [vendor, setVendor] = useState('');
  const [employee, setEmployee] = useState('');
  const [project, setProject] = useState('');
  const [department, setDepartment] = useState('');
  const [amount, setAmount] = useState('');
  const [gst, setGst] = useState('18');
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('1.0');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [recurring, setRecurring] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('approved');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title || '');
      setCategory(expense.category || 'Software');
      setVendor(expense.vendor || '');
      setEmployee(expense.employee || '');
      setProject(expense.project || '');
      setDepartment(expense.department || '');
      setAmount(expense.amount ? expense.amount.toString() : '');
      setGst(expense.gst ? expense.gst.toString() : '18');
      setCurrency(expense.currency || 'INR');
      setExchangeRate(expense.exchangeRate ? expense.exchangeRate.toString() : '1.0');
      setPaymentMethod(expense.paymentMethod || 'bank_transfer');
      setRecurring(!!expense.recurring);
      setPriority(expense.priority || 'medium');
      setExpenseDate(expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setInvoiceNumber(expense.invoiceNumber || '');
      setDescription(expense.description || '');
      setNotes(expense.notes || '');
      setApprovalStatus(expense.approvalStatus || 'approved');
    } else {
      setTitle('');
      setCategory('Software');
      setVendor('');
      setEmployee('');
      setProject('');
      setDepartment('');
      setAmount('');
      setGst('18');
      setCurrency('INR');
      setExchangeRate('1.0');
      setPaymentMethod('bank_transfer');
      setRecurring(false);
      setPriority('medium');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setInvoiceNumber('');
      setDescription('');
      setNotes('');
      setApprovalStatus('approved');
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const categories = [
    'Salary', 'Office', 'Marketing', 'Cloud', 'Internet', 'Travel', 
    'Software', 'Equipment', 'Insurance', 'Taxes', 'Legal', 'Utilities', 'Miscellaneous'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    onSave({
      title,
      category,
      vendor: vendor || undefined,
      employee: employee || undefined,
      project: project || undefined,
      department: department || undefined,
      amount: Number(amount),
      gst: Number(gst),
      currency,
      exchangeRate: Number(exchangeRate),
      paymentMethod,
      recurring,
      priority,
      expenseDate: new Date(expenseDate || ''),
      invoiceNumber: invoiceNumber || undefined,
      description: description || undefined,
      notes: notes || undefined,
      approvalStatus
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-md z-[60] overflow-y-auto">
      <div className="bg-white border border-outline-variant/60 rounded-2xl w-full max-w-2xl min-w-[320px] md:min-w-[700px] shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="gradient-emerald px-lg py-md text-white flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <FileText size={20} />
            <h3 className="font-card-title text-base font-black uppercase tracking-wider">
              {expense ? 'Modify Expense Entry' : 'Record New Expense'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-lg space-y-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            
            {/* Title */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Expense Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AWS Hosting Payout May"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Vendor */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Vendor / Merchant</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Amazon Web Services"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              />
            </div>

            {/* Employee */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Employee Claiming</label>
              <input
                type="text"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                placeholder="e.g. Siddharth Sharma"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              />
            </div>

            {/* Project */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Associated Project</label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Website Redesign"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface font-mono"
              />
            </div>

            {/* GST */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">GST Rate (%)</label>
              <select
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface font-mono"
              >
                <option value="0">0% Excluded</option>
                <option value="5">5% Food/SOW</option>
                <option value="12">12% General</option>
                <option value="18">18% Standard SaaS</option>
                <option value="28">28% Premium Luxury</option>
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              >
                <option value="bank_transfer">Bank Wire</option>
                <option value="upi">UPI Payments</option>
                <option value="card">Credit/Debit Card</option>
                <option value="cash">Cash Out-of-Pocket</option>
              </select>
            </div>

            {/* Expense Date */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Expense Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface font-mono"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Priority Rating</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              >
                <option value="critical">Critical</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* Invoice Number */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Invoice Reference #</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. AWS-INV-992"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              />
            </div>

            {/* Recurring toggle */}
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="recurring"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
              />
              <label htmlFor="recurring" className="text-xs font-bold text-on-surface">Mark as Recurring Cost</label>
            </div>

            {/* Notes / Description */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Description & Scope Notes</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include brief purpose, department allocation, and project milestones links..."
                className="w-full p-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface resize-none"
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
              Commit Ledger
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
