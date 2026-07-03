import { useState, useEffect } from 'react';
import { X, Save, Layers, Loader2 } from 'lucide-react';
import Button from '@/shared/components/ui/Button';

interface Subscription {
  id?: string;
  name: string;
  cost: number;
  billingCycle: string;
  autoRenewal: boolean;
  renewalDate: string;
  status: string;
  description: string;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  subscription?: Subscription | null;
  isLoading?: boolean;
}

export default function SubscriptionModal({ isOpen, onClose, onSave, subscription = null, isLoading = false }: SubscriptionModalProps) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [renewalDate, setRenewalDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (subscription) {
      setName(subscription.name || '');
      setCost(subscription.cost ? subscription.cost.toString() : '');
      setBillingCycle(subscription.billingCycle || 'monthly');
      setAutoRenewal(!!subscription.autoRenewal);
      setRenewalDate(subscription.renewalDate ? new Date(subscription.renewalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setStatus(subscription.status || 'active');
      setDescription(subscription.description || '');
    } else {
      setName('');
      setCost('');
      setBillingCycle('monthly');
      setAutoRenewal(true);
      setRenewalDate(new Date().toISOString().split('T')[0]);
      setStatus('active');
      setDescription('');
    }
  }, [subscription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cost) return;

    onSave({
      name,
      cost: Number(cost),
      billingCycle,
      autoRenewal,
      renewalDate: new Date(renewalDate || ''),
      status,
      description: description || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-md z-[60] overflow-y-auto">
      <div className="bg-white border border-outline-variant/60 rounded-2xl w-full max-w-xl min-w-[320px] md:min-w-[550px] shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="gradient-primary px-lg py-md text-white flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <Layers size={20} />
            <h3 className="font-card-title text-base font-black uppercase tracking-wider">
              {subscription ? 'Modify SaaS License' : 'Track SaaS Subscription'}
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
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Subscription Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Cloud Infrastructure, Google Workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Cost Amount *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="₹ Amount"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
              />
            </div>

            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Billing Cycle</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full h-[38px] px-md bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-sm">
            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Renewal Due Date *</label>
              <input
                type="date"
                required
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
              />
            </div>

            <div className="space-y-sm">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-[38px] px-md bg-surface-container-lowest border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center justify-between p-sm bg-slate-50 border border-outline-variant/30 rounded-xl">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-on-surface block">Auto-Renewal</span>
              <span className="text-[9px] text-on-surface-variant block">Automatically lock outlays on renewal dates</span>
            </div>
            <input
              type="checkbox"
              checked={autoRenewal}
              onChange={(e) => setAutoRenewal(e.target.checked)}
              className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary cursor-pointer"
            />
          </div>

          <div className="space-y-sm">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Notes & Description</label>
            <textarea
              rows={2}
              placeholder="Provide a brief description of SOW allocation or licensing terms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                  <span>{subscription ? 'Update Subscription' : 'Record Subscription'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
