import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/lib/axios';
import { X, Save, CreditCard, Loader2 } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

interface Department {
  id: string;
  name: string;
}

interface Payroll {
  id?: string;
  employeeName: string;
  department: string;
  salary: number;
  bonus: number;
  pending: number;
  paid: number;
  dueDate: string;
  paymentMode: string;
  priority: string;
  notes: string;
}

interface PayrollRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  payroll?: Payroll | null;
  isLoading?: boolean;
}

export default function PayrollRecordModal({ isOpen, onClose, onSave, payroll = null, isLoading = false }: PayrollRecordModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [salary, setSalary] = useState('');
  const [bonus, setBonus] = useState('0');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('bank_transfer');
  const [priority, setPriority] = useState('high');
  const [notes, setNotes] = useState('');

  // Fetch company's actual departments list dynamically!
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/v1/departments');
      return data.data;
    },
    enabled: isOpen
  });

  useEffect(() => {
    if (payroll) {
      setEmployeeName(payroll.employeeName || '');
      setDepartment(payroll.department || '');
      setSalary(payroll.salary ? payroll.salary.toString() : '');
      setBonus(payroll.bonus ? payroll.bonus.toString() : '0');
      setDueDate(payroll.dueDate ? new Date(payroll.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setPaymentMode(payroll.paymentMode || 'bank_transfer');
      setPriority(payroll.priority || 'high');
      setNotes(payroll.notes || '');
    } else {
      setEmployeeName('');
      setDepartment('');
      setSalary('');
      setBonus('0');
      setDueDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('bank_transfer');
      setPriority('high');
      setNotes('');
    }
  }, [payroll, isOpen]);

  useEffect(() => {
    // Default to first department if empty and departments loaded
    if (!department && departments && departments.length > 0 && departments[0]) {
      setDepartment(departments[0].name);
    }
  }, [departments, department]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim() || !salary || !department) return;

    onSave({
      employeeName,
      department,
      salary: Number(salary),
      bonus: Number(bonus),
      pending: Number(salary) + Number(bonus),
      dueDate: new Date(dueDate || ''),
      paymentMode,
      priority,
      notes: notes || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-md z-[60] overflow-y-auto">
      <div className="bg-white border border-outline-variant/60 rounded-2xl w-full max-w-xl min-w-[320px] md:min-w-[550px] shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="gradient-primary px-lg py-md text-white flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <CreditCard size={20} />
            <h3 className="font-card-title text-base font-black uppercase tracking-wider">
              {payroll ? 'Modify Employee Salary' : 'Add Staff Payroll Entry'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-lg space-y-md text-on-surface">
          <div className="space-y-sm">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Employee Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Siddharth Sharma, Priya Patel"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Department *</label>
              {departments.length === 0 ? (
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering, Marketing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              ) : (
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-[38px] px-md bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Base Salary *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="₹ Base Salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Bonus Payout</label>
              <input
                type="number"
                min="0"
                placeholder="₹ Bonus"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
              />
            </div>

            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Salary Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full h-[38px] px-md bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash Payment</option>
                <option value="upi">UPI / Digital</option>
              </select>
            </div>

            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-[38px] px-md bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Disbursement Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Month salary logs, appraisal adjustment details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-sm border-t border-outline-variant/30 pt-md mt-lg">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-9 font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="h-9 font-bold text-xs flex items-center gap-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>{payroll ? 'Update Registry' : 'Add Employee'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
