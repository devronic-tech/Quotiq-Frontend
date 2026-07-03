import { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, Loader2 } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

interface Liability {
  id?: string;
  title: string;
  vendor: string;
  category: string;
  amount: number;
  dueDate: string;
  recurring: boolean;
  repeatInterval: string;
  priority: string;
  reminderDays: number;
  assignedTo: string;
  paymentMethod: string;
  notes: string;
  status: string;
}

interface LiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  liability?: Liability | null;
  isLoading?: boolean;
}

export default function LiabilityModal({ isOpen, onClose, onSave, liability = null, isLoading = false }: LiabilityModalProps) {
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('Taxes');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState(false);
  const [repeatInterval, setRepeatInterval] = useState('none');
  const [priority, setPriority] = useState('medium');
  const [reminderDays, setReminderDays] = useState('3');
  const [assignedTo, setAssignedTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (liability) {
      setTitle(liability.title || '');
      setVendor(liability.vendor || '');
      setCategory(liability.category || 'Taxes');
      setAmount(liability.amount ? liability.amount.toString() : '');
      setDueDate(liability.dueDate ? new Date(liability.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setRecurring(!!liability.recurring);
      setRepeatInterval(liability.repeatInterval || 'none');
      setPriority(liability.priority || 'medium');
      setReminderDays(liability.reminderDays ? liability.reminderDays.toString() : '3');
      setAssignedTo(liability.assignedTo || '');
      setPaymentMethod(liability.paymentMethod || 'bank_transfer');
      setNotes(liability.notes || '');
      setStatus(liability.status || 'pending');
    } else {
      setTitle('');
      setVendor('');
      setCategory('Taxes');
      setAmount('');
      setDueDate(new Date().toISOString().split('T')[0]);
      setRecurring(false);
      setRepeatInterval('none');
      setPriority('medium');
      setReminderDays('3');
      setAssignedTo('');
      setPaymentMethod('bank_transfer');
      setNotes('');
      setStatus('pending');
    }
  }, [liability, isOpen]);

  if (!isOpen) return null;

  const categories = ['Taxes', 'Rent', 'EMI', 'Software', 'Legal', 'Contractor', 'Miscellaneous'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !vendor.trim() || !amount) return;

    onSave({
      title,
      vendor,
      category,
      amount: Number(amount),
      dueDate: new Date(dueDate || ''),
      recurring,
      repeatInterval,
      priority,
      reminderDays: Number(reminderDays),
      assignedTo: assignedTo || undefined,
      paymentMethod,
      notes: notes || undefined,
      status
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-md z-[60] overflow-y-auto">
      <div className="bg-white border border-outline-variant/60 rounded-2xl w-full max-w-2xl min-w-[320px] md:min-w-[650px] shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="gradient-violet px-lg py-md text-white flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <ShieldAlert size={20} />
            <h3 className="font-card-title text-base font-black uppercase tracking-wider">
              {liability ? 'Modify Liability Record' : 'Record Company Liability'}
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
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Liability Description *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q2 Corporate Tax Assessment"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>

            {/* Vendor */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Payee / Creditor *</label>
              <input
                type="text"
                required
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Income Tax Department"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
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

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Outstanding Amount (₹) *</label>
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

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Settlement Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface font-mono"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              >
                <option value="critical">🔴 Critical (Must Pay)</option>
                <option value="high">🟠 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">⚪ Low Priority</option>
              </select>
            </div>

            {/* Assigned User */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Owner / Assignee</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              />
            </div>

            {/* Reminder Days */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Reminder Window (Days)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface font-mono"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              >
                <option value="pending">Pending Settlement</option>
                <option value="completed">Completed / Settled</option>
              </select>
            </div>

            {/* Repeat Interval */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Repeat Interval</label>
              <select
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-outline-variant/50 rounded-lg text-xs outline-none focus:border-primary text-on-surface"
              >
                <option value="none">Does not repeat</option>
                <option value="monthly">Monthly Recurring</option>
                <option value="quarterly">Quarterly Recurring</option>
                <option value="yearly">Yearly Recurring</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant">Notes & Bank Details</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include reference invoice, payment coordinates, or wire reference codes..."
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
              variant="secondary"
              size="sm"
              isLoading={isLoading}
              icon={<Save size={14} />}
              className="px-md h-10 text-xs font-bold"
            >
              Record Liability
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
