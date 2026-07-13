import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/axios';
import { toast } from 'react-hot-toast';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, FileText, Calendar, 
  Plus, ArrowRight, Download, Send, Phone, MessageSquare, Check, 
  Trash2, CreditCard, ChevronDown, ChevronUp, Bot, FileSpreadsheet, 
  Layers, RefreshCw, AlertTriangle, ShieldCheck, Flame, FastForward,
  Building, ShieldAlert, Cpu
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';

// Subcomponents
import SankeyDiagram from '../components/SankeyDiagram';
import FinancialCalendar from '../components/FinancialCalendar';
import AICopilotWidget from '../components/AICopilotWidget';
import ExpenseModal from '../components/ExpenseModal';
import LiabilityModal from '../components/LiabilityModal';
import PayrollModal from '../components/PayrollModal';
import SubscriptionModal from '../components/SubscriptionModal';
import PayrollRecordModal from '../components/PayrollRecordModal';
import Button from '@/shared/components/ui/Button';

// Type declarations
interface Expense {
  id: string;
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

interface Liability {
  id: string;
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

interface Subscription {
  id: string;
  name: string;
  cost: number;
  billingCycle: string;
  autoRenewal: boolean;
  renewalDate: string;
  status: string;
  description: string;
}

interface Payroll {
  id: string;
  employeeName: string;
  department: string;
  salary: number;
  bonus: number;
  pending: number;
  paid: number;
  dueDate: string;
  paymentMode: string;
  status: string;
  priority: string;
  notes: string;
}

interface Transaction {
  id: string;
  type: string;
  description: string;
  category: string;
  amount: number;
  status: string;
  date: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  grandTotal: string;
  amountPaid: string;
  issueDate: string;
  dueDate: string;
  customer?: {
    name: string;
    company: string;
  };
}

export default function FinanceDashboardPage() {
  const queryClient = useQueryClient();

  // Active filters and query parameters
  const [cashFlowRange, setCashFlowRange] = useState('30D');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expensePage, setExpensePage] = useState(1);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('All');
  
  // Expanded row track states
  const [expandedPaymentInvoiceId, setExpandedPaymentInvoiceId] = useState<string | null>(null);

  // Quick Action menu toggle
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Modal open states
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLiabilityOpen, setIsLiabilityOpen] = useState(false);
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null);
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isPayrollRecordOpen, setIsPayrollRecordOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<Payroll | null>(null);

  // Auto pay fixed cost toggles
  const [autoPayFixedCosts, setAutoPayFixedCosts] = useState<Record<string, boolean>>({
    'Salaries': true,
    'Office Rent': true,
    'AWS Services': true,
    'Internet Bill': false,
    'Electricity': false
  });

  // ── API DATA QUERYING ───────────────────────────────────────

  // 1. KPI Summaries
  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const { data } = await api.get('/v1/finance/summary');
      return data.data;
    }
  });

  // 2. Cash Flow Chart Data
  const { data: cashFlowData = [], isLoading: isCashFlowLoading } = useQuery({
    queryKey: ['finance-cashflow', cashFlowRange],
    queryFn: async () => {
      const { data } = await api.get(`/v1/finance/cashflow?range=${cashFlowRange}`);
      return data.data;
    }
  });

  // 3. Sankey Money Flow mapping
  const { data: sankeyData, isLoading: isSankeyLoading } = useQuery({
    queryKey: ['finance-sankey'],
    queryFn: async () => {
      const { data } = await api.get('/v1/finance/sankey');
      return data.data;
    }
  });

  // 4. Calendar Events
  const { data: calendarEvents = [], isLoading: isCalendarLoading } = useQuery({
    queryKey: ['finance-calendar'],
    queryFn: async () => {
      const { data } = await api.get('/v1/finance/calendar');
      return data.data;
    }
  });

  // 5. Invoices (for Payments/Project Revenues)
  const { data: invoices = [], isLoading: isInvoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/v1/invoices');
      return data.data;
    }
  });

  // 6. Expenses CRUD fetch
  const { data: expensesResult = { data: [], meta: { total: 0, totalPages: 1 } }, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['finance-expenses', expenseSearch, expensePage],
    queryFn: async () => {
      const { data } = await api.get(`/v1/finance/expenses?search=${expenseSearch}&page=${expensePage}&limit=6`);
      return data;
    }
  });

  // 7. Liabilities
  const { data: liabilities = [], isLoading: isLiabilitiesLoading } = useQuery<Liability[]>({
    queryKey: ['finance-liabilities'],
    queryFn: async () => {
      const { data } = await api.get('/v1/finance/liabilities');
      return data.data;
    }
  });

  // 8. Subscriptions
  const { data: subscriptions = [], isLoading: isSubscriptionsLoading } = useQuery<Subscription[]>({
    queryKey: ['finance-subscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/v1/finance/subscriptions');
      return data.data;
    }
  });

  // 9. Payroll
  const { data: payrollList = [], isLoading: isPayrollLoading } = useQuery<Payroll[]>({
    queryKey: ['finance-payroll'],
    queryFn: async () => {
      const { data } = await api.get('/v1/finance/payroll');
      return data.data;
    }
  });

  // 10. Ledger Transactions
  const { data: transactions = [], isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['finance-transactions'],
    queryFn: async () => {
      const { data } = await api.get('/v1/finance/cashflow?range=30D'); // use cashflow endpoint intervals or transactions
      const res = await api.get('/v1/finance/summary'); // fallback details
      return [];
    }
  });

  // Fetch all transactions ledger
  const { data: transactionsLedger = [], isLoading: isLedgerLoading } = useQuery<Transaction[]>({
    queryKey: ['finance-ledger'],
    queryFn: async () => {
      const { data } = await api.get('/v1/finance/ledger');
      return data.data;
    }
  });

  // ── MUTATIONS (WRITE OPERATIONS) ────────────────────────────

  // Expense Mutators
  const saveExpenseMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedExpense) {
        await api.put(`/v1/finance/expenses/${selectedExpense.id}`, payload);
      } else {
        await api.post('/v1/finance/expenses', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-cashflow'] });
      queryClient.invalidateQueries({ queryKey: ['finance-sankey'] });
      queryClient.invalidateQueries({ queryKey: ['finance-calendar'] });
      toast.success(selectedExpense ? 'Expense updated successfully' : 'Expense recorded successfully');
      setIsExpenseOpen(false);
      setSelectedExpense(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to commit expense');
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/finance/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      toast.success('Expense record deleted');
    }
  });

  // Liability Mutators
  const saveLiabilityMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedLiability) {
        await api.put(`/v1/finance/liabilities/${selectedLiability.id}`, payload);
      } else {
        await api.post('/v1/finance/liabilities', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-calendar'] });
      toast.success('Liability updated successfully');
      setIsLiabilityOpen(false);
      setSelectedLiability(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update liability');
    }
  });

  const toggleLiabilityStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/v1/finance/liabilities/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-calendar'] });
      toast.success('Liability status updated');
    }
  });

  // Subscription Mutators
  const toggleSubscriptionRenewalMutation = useMutation({
    mutationFn: async ({ id, autoRenewal }: { id: string; autoRenewal: boolean }) => {
      await api.put(`/v1/finance/subscriptions/${id}`, { autoRenewal });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-subscriptions'] });
      toast.success('Subscription renewal updated');
    }
  });

  // Payroll Mutators
  const paySalaryMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      await api.post(`/v1/finance/payroll/${id}/pay`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-payroll'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-calendar'] });
      toast.success('Salary disbursement logged successfully');
      setIsPayrollOpen(false);
      setSelectedPayroll(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to log salary payment');
    }
  });

  // Subscription CRUD Mutators
  const saveSubscriptionMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedSubscription) {
        await api.put(`/v1/finance/subscriptions/${selectedSubscription.id}`, payload);
      } else {
        await api.post('/v1/finance/subscriptions', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-sankey'] });
      queryClient.invalidateQueries({ queryKey: ['finance-calendar'] });
      toast.success(selectedSubscription ? 'Subscription updated successfully' : 'Subscription recorded successfully');
      setIsSubscriptionOpen(false);
      setSelectedSubscription(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to save subscription');
    }
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/finance/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-sankey'] });
      queryClient.invalidateQueries({ queryKey: ['finance-calendar'] });
      toast.success('Subscription deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete subscription');
    }
  });

  // Payroll CRUD Mutators
  const savePayrollRecordMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (selectedPayrollRecord) {
        await api.put(`/v1/finance/payroll/${selectedPayrollRecord.id}`, payload);
      } else {
        await api.post('/v1/finance/payroll', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-payroll'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-sankey'] });
      queryClient.invalidateQueries({ queryKey: ['finance-calendar'] });
      toast.success(selectedPayrollRecord ? 'Employee payroll record updated' : 'Employee payroll record created');
      setIsPayrollRecordOpen(false);
      setSelectedPayrollRecord(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to save employee record');
    }
  });

  const deletePayrollMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/finance/payroll/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-payroll'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-sankey'] });
      queryClient.invalidateQueries({ queryKey: ['finance-calendar'] });
      toast.success('Employee payroll record removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to remove employee record');
    }
  });

  // Clear Ledger Database Logs
  const clearMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/v1/finance/clear');
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('All finance ledger records cleared successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to clear database logs');
    }
  });

  // Manual Trigger Seeder
  const seedMutation = useMutation({
    mutationFn: async () => {
      await api.post('/v1/finance/seed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Enterprise mock data re-seeded successfully');
    }
  });

  // ── DYNAMIC KPI CALCULATION HANDLERS ─────────────────────────

  const kpi = summaryData?.kpis || {
    companyBalance: 0,
    availableCash: 0,
    pendingRevenue: 0,
    pendingExpenses: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    cashReserve: 0,
    burnRate: 0,
    runway: 0,
    criticalLiabilities: 0,
    upcomingPayroll: 0,
    taxesDue: 0,
    profitMargin: 0,
    subscriptionCostMonthly: 0,
    averageCollectionDays: 0,
    upcomingRenewals: 0,
    revenueGrowth: 0,
    balanceGrowth: 0
  };

  const getKPIColor = (val: number, isGoodHigh = true) => {
    if (val === 0) return 'text-secondary';
    if (isGoodHigh) {
      return val > 0 ? 'text-green-600' : 'text-error';
    } else {
      return val > 0 ? 'text-error' : 'text-green-600';
    }
  };

  // Pie chart format
  const revenueSourcesPie = (summaryData?.revenueSourcesPie || []) as Array<{ name: string; value: number; color: string }>;

  const projectProfitabilityList = (summaryData?.projectProfitability || []) as Array<{ id: string; name: string; rev: number; exp: number; margin: number; roi: number }>;
  const fixedCostsList = (summaryData?.fixedCostsList || []) as Array<{ name: string; cost: number; due: string; prio: string }>;

  // Client payment invoices
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid').slice(0, 5);

  // Financial reports generation logic
  const handleReportGeneration = (format: string, reportType: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Compiling ${reportType} report into ${format.toUpperCase()}...`,
        success: `Successfully downloaded ${reportType}_Audit_${new Date().getFullYear()}.${format.toLowerCase()}`,
        error: 'Failed to compile report.'
      }
    );
  };

  return (
    <div className="space-y-lg max-w-7xl mx-auto pb-xl relative">
      
      {/* ── HEADER ── */}
      <div id="overview" className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h2 className="font-page-title text-page-title font-bold text-on-surface">
            Finance &amp; Cash Flow
          </h2>
          <p className="text-on-surface-variant font-body-md">CFO operating dashboard &amp; dynamic financial metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-sm">
          <button
            onClick={() => {
              setSelectedExpense(null);
              setIsExpenseOpen(true);
            }}
            className="px-md h-11 bg-primary text-white font-semibold rounded-lg shadow-soft hover:bg-primary/90 transition-all flex items-center gap-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedLiability(null);
              setIsLiabilityOpen(true);
            }}
            className="px-md h-11 bg-surface-container-lowest border border-outline-variant text-on-surface font-semibold rounded-lg hover:bg-surface-container transition-all flex items-center gap-xs cursor-pointer"
          >
            <AlertTriangle size={16} className="text-warning" />
            <span>Create Liability</span>
          </button>

          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="p-2 h-11 w-11 bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-primary rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            title="Reset Mock Data"
          >
            <RefreshCw size={15} className={clsx(seedMutation.isPending && 'animate-spin')} />
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to remove all financial records and mock data? This will reset the ledger.')) {
                clearMutation.mutate();
              }
            }}
            disabled={clearMutation.isPending}
            className="p-2 h-11 w-11 bg-error-container/20 border border-error/20 text-error hover:bg-error-container/40 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            title="Remove Mock Data"
          >
            <Trash2 size={15} className={clsx(clearMutation.isPending && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── KPI GRID ── 3-column layout matching Dashboard standard */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-xl">

        {/* KPI 1: Company Balance */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">COMPANY BALANCE</p>
            <span className="text-primary"><Wallet size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">₹{Math.round(kpi.companyBalance).toLocaleString('en-IN')}</h3>
            <span className={clsx("text-xs font-bold flex items-center gap-[2px]", kpi.balanceGrowth >= 0 ? "text-green-600" : "text-error")}>
              {kpi.balanceGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {kpi.balanceGrowth >= 0 ? '+' : ''}{kpi.balanceGrowth}%
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">vs. last month balance</p>
        </div>

        {/* KPI 2: Available Cash */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">AVAILABLE CASH</p>
            <span className="text-indigo-500"><DollarSign size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">₹{Math.round(kpi.availableCash).toLocaleString('en-IN')}</h3>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">Excludes locked liabilities</p>
        </div>

        {/* KPI 3: Pending Revenue */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">PENDING REVENUE</p>
            <span className="text-error"><FileText size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">₹{Math.round(kpi.pendingRevenue).toLocaleString('en-IN')}</h3>
            <span className="text-xs font-bold text-error">{invoices.filter(inv => inv.status !== 'paid').length} unpaid</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">Collectable client balances</p>
        </div>

        {/* KPI 4: Net Profit */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">NET PROFIT</p>
            <span className="text-primary"><Check size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">₹{Math.round(kpi.netProfit).toLocaleString('en-IN')}</h3>
            <span className={clsx("text-xs font-bold flex items-center gap-[2px]", kpi.profitMargin >= 0 ? "text-green-600" : "text-error")}>
              {kpi.profitMargin >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {kpi.profitMargin}%
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">Profit margin this period</p>
        </div>

        {/* KPI 5: Critical Liabilities */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">CRITICAL LIABILITIES</p>
            <span className="text-error"><AlertTriangle size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">{kpi.criticalLiabilities}</h3>
            <span className="text-xs font-bold text-error">Pending</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">Due within 5 days</p>
        </div>

        {/* KPI 6: Monthly Subscription Cost */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">SUBSCRIPTIONS</p>
            <span className="text-on-surface-variant"><Layers size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">₹{Math.round(kpi.subscriptionCostMonthly).toLocaleString('en-IN')}</h3>
            <span className="text-xs font-bold text-on-surface-variant">/mo</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">{kpi.upcomingRenewals} renewals in next 15 days</p>
        </div>

      </section>

      {/* ── CHARTS & REVENUE SECTION ── */}
      <div id="cashflow" className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Main Cash Flow Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm mb-md">
            <div>
              <h4 className="font-card-title text-card-title text-on-surface">Cash Flow Overview</h4>
              <p className="text-body-sm text-on-surface-variant">Projected balance, income and outlays tracking</p>
            </div>
            <div className="flex gap-xs border border-outline-variant/30 rounded-lg p-0.5 bg-surface-container-low">
              {['7D', '30D', '3M', '6M', '1Y'].map(range => (
                <button
                  key={range}
                  onClick={() => setCashFlowRange(range)}
                  className={clsx(
                    'px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all',
                    cashFlowRange === range ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            {isCashFlowLoading ? (
              <div className="h-full w-full flex items-center justify-center shimmer rounded-lg border border-outline-variant/20 bg-surface-container-low">
                <span className="text-xs text-on-surface-variant font-semibold">Loading charts data...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3ff" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={45} />
                  <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#expenseGrad)" name="Expenses" />
                  <Area type="monotone" dataKey="cashBalance" stroke="#2563eb" fill="none" strokeWidth={2} name="Cash Remaining" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue Analytics (Pie Chart) */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft flex flex-col justify-between">
          <div>
            <h4 className="font-card-title text-card-title text-on-surface">Revenue Sources</h4>
            <p className="text-body-sm text-on-surface-variant">Project and AMC breakdown analysis</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center my-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueSourcesPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {revenueSourcesPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs uppercase font-bold text-on-surface-variant leading-none">Total</span>
              <span className="text-xs font-bold font-mono text-primary mt-1 leading-none">
                {(() => {
                  const total = revenueSourcesPie.reduce((acc, curr) => acc + curr.value, 0);
                  return total >= 100000 
                    ? `₹${(total / 100000).toFixed(1)}L` 
                    : `₹${(total / 1000).toFixed(0)}K`;
                })()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-sm text-[10px] border-t border-outline-variant/30 pt-sm mt-xs">
            {revenueSourcesPie.map((source, idx) => (
              <div key={idx} className="flex items-center gap-xs font-semibold">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                <span className="text-secondary truncate">{source.name}</span>
                <span className="font-mono text-on-surface ml-auto">₹{(source.value / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MONEY FLOW SANKEY ── */}
      <div>
        <SankeyDiagram data={sankeyData} isLoading={isSankeyLoading} />
      </div>

      {/* ── CLIENT PAYMENTS & PROJECT MARGINS ── */}
      <div id="transactions" className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        
        {/* Pending Client Payments */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-soft flex flex-col justify-between">
          <div>
            <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
              <div>
                <h4 className="font-card-title text-card-title text-on-surface">Pending Client Payments</h4>
                <p className="text-body-sm text-on-surface-variant">Collectable client balances, overdue timelines, and follow-ups</p>
              </div>
              <span className="text-[10px] font-bold text-error bg-error-container/20 border border-error/20 px-2 py-0.5 rounded">₹{Math.round(kpi.pendingRevenue).toLocaleString('en-IN')} Total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-label-uppercase border-b border-outline-variant/30">
                  <tr>
                    <th className="px-lg py-md">Client</th>
                    <th className="px-lg py-md">Invoice #</th>
                    <th className="px-lg py-md text-right">Owed</th>
                    <th className="px-lg py-md">Status</th>
                    <th className="px-lg py-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                  {isInvoicesLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-lg shimmer">Loading client payments...</td>
                    </tr>
                  ) : unpaidInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-lg text-secondary">All client payments settled!</td>
                    </tr>
                  ) : (
                    unpaidInvoices.map((inv) => {
                      const isExpanded = expandedPaymentInvoiceId === inv.id;
                      const outstanding = Number(inv.grandTotal) - Number(inv.amountPaid);
                      return (
                        <optgroup key={inv.id} className="border-none">
                          <tr 
                            onClick={() => setExpandedPaymentInvoiceId(isExpanded ? null : inv.id)}
                            className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                          >
                            <td className="px-lg py-md font-semibold">{inv.customer?.name || 'Client'}</td>
                            <td className="px-lg py-md font-data-mono text-data-mono font-bold text-primary">{inv.invoiceNumber}</td>
                            <td className="px-lg py-md font-data-mono text-data-mono font-bold text-right">₹{outstanding.toLocaleString('en-IN')}</td>
                            <td className="px-lg py-md">
                              <span className={clsx(
                                'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border',
                                inv.status === 'overdue' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-error border-red-200'
                              )}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-lg py-md text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-xs justify-end">
                                <button 
                                  onClick={() => toast.success('Sent WhatsApp payment link reminder')}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                  title="WhatsApp Reminder"
                                >
                                  <MessageSquare size={13} />
                                </button>
                                <button 
                                  onClick={() => toast.success('Sent email invoice reminder')}
                                  className="p-1 text-primary hover:bg-primary/5 rounded"
                                  title="Email Reminder"
                                >
                                  <Send size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Section */}
                          {isExpanded && (
                            <tr className="bg-surface-container-low/50">
                              <td colSpan={5} className="px-lg py-md border-t border-outline-variant/10 text-body-sm text-secondary">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                                  <div>
                                    <span className="font-bold text-on-surface-variant uppercase block text-[10px] tracking-wider">Due Date</span>
                                    <span>{new Date(inv.dueDate).toLocaleDateString('en-IN')}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-on-surface-variant uppercase block text-[10px] tracking-wider">Total Billing</span>
                                    <span className="font-data-mono text-data-mono">₹{Number(inv.grandTotal).toLocaleString('en-IN')}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-on-surface-variant uppercase block text-[10px] tracking-wider">Total Payouts</span>
                                    <span className="font-data-mono text-data-mono">₹{Number(inv.amountPaid).toLocaleString('en-IN')}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-on-surface-variant uppercase block text-[10px] tracking-wider">Timeline Logs</span>
                                    <span className="text-orange-600 font-bold">1 Reminder dispatched</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </optgroup>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="p-md bg-surface-container-low/80 border-t border-outline-variant/35 text-center">
            <button className="text-body-sm font-bold text-primary hover:underline cursor-pointer flex items-center justify-center gap-xs w-full">
              <span>View All Outstanding Receivables</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Project Profitability */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-soft flex flex-col justify-between">
          <div>
            <div className="p-lg border-b border-outline-variant/30">
              <h4 className="font-card-title text-card-title text-on-surface">Project Profitability Analytics</h4>
              <p className="text-body-sm text-on-surface-variant">Budget utilization, gross profit margins, and ROI index</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-label-uppercase border-b border-outline-variant/30">
                  <tr>
                    <th className="px-lg py-md">Project Module</th>
                    <th className="px-lg py-md text-right">Revenue</th>
                    <th className="px-lg py-md text-right">Expense</th>
                    <th className="px-lg py-md text-right">Margin</th>
                    <th className="px-lg py-md text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                  {projectProfitabilityList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-md text-secondary font-semibold">No active project margins found</td>
                    </tr>
                  ) : (
                    projectProfitabilityList.map(proj => (
                      <tr 
                        key={proj.id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-lg py-md font-semibold">{proj.name}</td>
                        <td className="px-lg py-md font-data-mono text-data-mono text-right">₹{proj.rev.toLocaleString('en-IN')}</td>
                        <td className="px-lg py-md font-data-mono text-data-mono text-right text-rose-600">₹{proj.exp.toLocaleString('en-IN')}</td>
                        <td className="px-lg py-md font-data-mono text-data-mono text-right text-green-700 font-bold">{proj.margin}%</td>
                        <td className="px-lg py-md font-data-mono text-data-mono text-right font-bold text-primary">{proj.roi}x</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* ── EXPENSE MANAGEMENT ── */}
      <div id="expenses" className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-soft">
        <div className="p-lg border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
          <div>
            <h4 className="font-card-title text-card-title text-on-surface">Expense Registry</h4>
            <p className="text-body-sm text-on-surface-variant">Recorded cash outlays, tax receipts, and payment method audit</p>
          </div>
          
          <div className="flex items-center gap-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Search description..."
                value={expenseSearch}
                onChange={(e) => {
                  setExpenseSearch(e.target.value);
                  setExpensePage(1);
                }}
                className="w-48 h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
              />
            </div>

            <button 
              onClick={() => {
                setSelectedExpense(null);
                setIsExpenseOpen(true);
              }}
              className="px-md h-11 bg-primary text-white font-semibold rounded-lg shadow-soft hover:bg-primary/90 transition-all flex items-center gap-xs cursor-pointer text-sm"
            >
              <Plus size={16} />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-body-sm">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-label-uppercase border-b border-outline-variant/30">
              <tr>
                <th className="px-lg py-md">Title</th>
                <th className="px-lg py-md">Category</th>
                <th className="px-lg py-md">Vendor</th>
                <th className="px-lg py-md">Date</th>
                <th className="px-lg py-md">Invoice #</th>
                <th className="px-lg py-md text-right">Amount</th>
                <th className="px-lg py-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface">
              {isExpensesLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-lg shimmer">Loading expenses ledger...</td>
                </tr>
              ) : expensesResult.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-lg text-secondary">No expenses match your search query.</td>
                </tr>
              ) : (
                expensesResult.data.map((exp: Expense) => (
                  <tr key={exp.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-lg py-md font-semibold">{exp.title}</td>
                    <td className="px-lg py-md">
                      <span className="px-2 py-0.5 bg-surface-container border border-outline-variant/30 rounded text-[10px] font-bold text-on-surface-variant uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-lg py-md font-semibold text-on-surface-variant">{exp.vendor || '—'}</td>
                    <td className="px-lg py-md text-secondary font-data-mono text-data-mono">{new Date(exp.expenseDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-lg py-md font-data-mono text-data-mono text-secondary">{exp.invoiceNumber || '—'}</td>
                    <td className="px-lg py-md font-data-mono text-data-mono font-bold text-right text-rose-600">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
                    <td className="px-lg py-md text-right">
                      <div className="flex gap-xs justify-end">
                        <button
                          onClick={() => {
                            setSelectedExpense(exp);
                            setIsExpenseOpen(true);
                          }}
                          className="text-primary hover:underline text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this expense?')) {
                              deleteExpenseMutation.mutate(exp.id);
                            }
                          }}
                          className="text-error hover:underline text-xs font-semibold cursor-pointer ml-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {expensesResult.meta?.totalPages > 1 && (
          <div className="p-md bg-surface-container-low/60 border-t border-outline-variant/25 flex justify-between items-center px-lg text-body-sm font-bold">
            <span className="text-secondary">Page {expensePage} of {expensesResult.meta.totalPages}</span>
            <div className="flex gap-xs">
              <button
                disabled={expensePage === 1}
                onClick={() => setExpensePage(prev => Math.max(1, prev - 1))}
                className="px-md py-1.5 bg-white border border-outline-variant/50 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={expensePage === expensesResult.meta.totalPages}
                onClick={() => setExpensePage(prev => Math.min(expensesResult.meta.totalPages, prev + 1))}
                className="px-md py-1.5 bg-white border border-outline-variant/50 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── LIABILITIES & FIXED COSTS ── */}
      <div id="liabilities" className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Liability Kanban Board */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-sm mb-md">
              <div>
                <h4 className="font-card-title text-card-title text-on-surface">Company Liabilities</h4>
                <p className="text-body-sm text-on-surface-variant">Debts, critical supplier bills, and corporate tax timelines</p>
              </div>
              <button
                onClick={() => {
                  setSelectedLiability(null);
                  setIsLiabilityOpen(true);
                }}
                className="px-sm h-8 bg-secondary text-white font-bold rounded-lg text-xs hover:bg-secondary/95 flex items-center gap-xs cursor-pointer"
              >
                <Plus size={13} />
                <span>Track Liability</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
              {['critical', 'high', 'medium'].map(prio => {
                const columnLiabs = liabilities.filter(l => l.priority === prio && l.status === 'pending');
                const prioLabel = prio === 'critical' ? '🔴 Critical' : prio === 'high' ? '🟠 High' : '🟡 Medium';
                return (
                  <div key={prio} className="space-y-sm bg-surface-container-low/50 p-sm rounded-xl border border-outline-variant/30">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface flex justify-between">
                      <span>{prioLabel}</span>
                      <span className="font-mono text-primary">{columnLiabs.length}</span>
                    </span>
                    <div className="space-y-xs max-h-64 overflow-y-auto pr-xs">
                      {isLiabilitiesLoading ? (
                        <div className="text-center py-md text-[9px] shimmer">Loading...</div>
                      ) : columnLiabs.length === 0 ? (
                        <div className="text-center py-md text-[9px] text-on-surface-variant/60 bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-lg">Clear</div>
                      ) : (
                        columnLiabs.map(liab => (
                          <div 
                            key={liab.id} 
                            onClick={() => {
                              setSelectedLiability(liab);
                              setIsLiabilityOpen(true);
                            }}
                            className="p-xs bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-soft hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-0.5"
                          >
                            <span className="text-[10px] font-bold text-on-surface leading-tight truncate">{liab.title}</span>
                            <span className="text-[9px] text-on-surface-variant">Vendor: {liab.vendor}</span>
                            <div className="flex justify-between items-center mt-1 border-t border-outline-variant/30 pt-1">
                              <span className="text-[9px] font-bold text-primary font-mono">₹{Math.round(liab.amount).toLocaleString('en-IN')}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Settle this liability payment?')) {
                                    toggleLiabilityStatusMutation.mutate({ id: liab.id, status: 'completed' });
                                  }
                                }}
                                className="text-[8px] font-black uppercase text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.25 rounded hover:bg-green-100 transition-colors"
                              >
                                Settle
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Fixed Costs */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft flex flex-col justify-between">
          <div>
            <h4 className="font-card-title text-card-title text-on-surface">Monthly Fixed Costs</h4>
            <p className="text-body-sm text-on-surface-variant">Recurring overheads, rent, and utility commitments</p>

            <div className="space-y-sm mt-md">
              {fixedCostsList.length === 0 ? (
                <div className="text-center py-lg text-secondary border border-dashed border-outline-variant/40 rounded-xl font-semibold">
                  No monthly fixed costs tracked yet
                </div>
              ) : (
                fixedCostsList.map(cost => (
                  <div 
                    key={cost.name} 
                    className="p-sm bg-surface-container-low/50 border border-outline-variant/35 rounded-xl flex items-center gap-sm justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-on-surface block">{cost.name}</span>
                      <span className="text-[9px] text-secondary">Due: {cost.due}</span>
                    </div>
                    <div className="text-right flex items-center gap-md">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold font-mono text-primary block">₹{cost.cost.toLocaleString('en-IN')}</span>
                        <span className="text-[8px] font-bold text-on-surface-variant bg-surface-container border border-outline-variant/30 px-1 py-0.5 rounded uppercase tracking-wider">{cost.prio}</span>
                      </div>
                      
                      {/* Auto-pay Toggle */}
                      <div className="flex flex-col items-center">
                        <span className="text-[7px] font-bold text-on-surface-variant uppercase tracking-wider">Auto</span>
                        <input
                          type="checkbox"
                          checked={autoPayFixedCosts[cost.name] || false}
                          onChange={() => {
                            const updated = { ...autoPayFixedCosts, [cost.name]: !autoPayFixedCosts[cost.name] };
                            setAutoPayFixedCosts(updated);
                            toast.success(`${cost.name} Auto-Pay ${updated[cost.name] ? 'Enabled' : 'Disabled'}`);
                          }}
                          className="h-3.5 w-3.5 mt-0.5 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── SUBSCRIPTIONS & EMPLOYEE PAYROLL ── */}
      <div id="payroll" className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Subscription Tracker */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-sm mb-md">
              <div>
                <h4 className="font-card-title text-card-title text-on-surface">SaaS &amp; Cloud Subscriptions</h4>
                <p className="text-body-sm text-on-surface-variant">Automated billing renewals and active license overheads</p>
              </div>
              <button
                onClick={() => {
                  setSelectedSubscription(null);
                  setIsSubscriptionOpen(true);
                }}
                className="px-md h-11 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition-all flex items-center gap-xs cursor-pointer text-sm"
              >
                <Plus size={16} />
                <span>Track SaaS</span>
              </button>
            </div>

            <div className="space-y-sm max-h-80 overflow-y-auto pr-xs">
              {isSubscriptionsLoading ? (
                <div className="text-center py-lg shimmer">Loading subscriptions...</div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-lg text-on-surface-variant/50 border border-dashed border-outline-variant/40 rounded-xl text-xs font-semibold">
                  No active SaaS subscriptions tracked.
                </div>
              ) : (
                subscriptions.map(sub => {
                  const daysLeft = Math.ceil((new Date(sub.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div 
                      key={sub.id} 
                      className="p-sm bg-surface-container-lowest border border-outline-variant/35 rounded-xl flex items-center gap-sm justify-between shadow-soft hover:shadow-md transition-shadow"
                    >
                      <div 
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setIsSubscriptionOpen(true);
                        }}
                        className="space-y-0.5 cursor-pointer flex-1"
                      >
                        <span className="text-[11px] font-bold text-on-surface block truncate w-32">{sub.name}</span>
                        <span className={clsx(
                          'text-[10px] font-bold',
                          daysLeft <= 10 ? 'text-rose-600' : 'text-secondary'
                        )}>
                          {daysLeft > 0 ? `Renews in ${daysLeft} days` : `Renewed/Due today`}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-sm">
                        <div className="text-right space-y-0.5 mr-xs">
                          <span className="text-body-sm font-bold font-data-mono text-data-mono text-primary block">₹{Number(sub.cost).toLocaleString('en-IN')}</span>
                          <span className="text-[9px] text-secondary uppercase block tracking-wider font-semibold">{sub.billingCycle}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this subscription?')) {
                              deleteSubscriptionMutation.mutate(sub.id);
                            }
                          }}
                          className="text-error hover:text-error/80 p-1 transition-colors cursor-pointer mr-xs"
                          title="Delete Subscription"
                        >
                          <Trash2 size={13} />
                        </button>
                        <input
                          type="checkbox"
                          checked={sub.autoRenewal}
                          onChange={() => {
                            toggleSubscriptionRenewalMutation.mutate({ id: sub.id, autoRenewal: !sub.autoRenewal });
                          }}
                          className="h-3.5 w-3.5 rounded border-outline-variant text-primary focus:ring-primary accent-primary"
                          title="Auto-renewal Toggle"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Employee Payroll */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-sm mb-md">
              <div>
                <h4 className="font-card-title text-card-title text-on-surface">Employee Payroll Registry</h4>
                <p className="text-body-sm text-on-surface-variant">Track monthly staff salaries, bonus disbursements, and pending payouts</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPayrollRecord(null);
                  setIsPayrollRecordOpen(true);
                }}
                className="px-md h-11 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition-all flex items-center gap-xs cursor-pointer text-sm"
              >
                <Plus size={16} />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-label-uppercase border-b border-outline-variant/30">
                  <tr>
                    <th className="px-lg py-md">Employee</th>
                    <th className="px-lg py-md">Department</th>
                    <th className="px-lg py-md text-right">Base Salary</th>
                    <th className="px-lg py-md text-right">Pending Owed</th>
                    <th className="px-lg py-md">Status</th>
                    <th className="px-lg py-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface font-semibold">
                  {isPayrollLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-lg shimmer">Loading payroll...</td>
                    </tr>
                  ) : payrollList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-lg text-on-surface-variant/50 border border-dashed border-outline-variant/40 rounded-xl text-xs font-semibold">
                        No payroll records found.
                      </td>
                    </tr>
                  ) : (
                    payrollList.map(pay => (
                      <tr key={pay.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="px-lg py-md font-bold">
                          <div>
                            <span className="block font-bold">{pay.employeeName}</span>
                            <span className="block text-[10px] text-secondary font-data-mono text-data-mono">
                              Due: {new Date(pay.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-lg py-md text-secondary font-medium">{pay.department}</td>
                        <td className="px-lg py-md font-data-mono text-data-mono text-right">₹{Number(pay.salary).toLocaleString('en-IN')}</td>
                        <td className="px-lg py-md font-data-mono text-data-mono text-right text-rose-600 font-bold">
                          {Number(pay.pending) > 0 ? `₹${Number(pay.pending).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="px-lg py-md">
                          <span className={clsx(
                            'px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase',
                            pay.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-error border-red-200'
                          )}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="px-lg py-md text-right">
                          <div className="flex gap-xs justify-end items-center">
                            {pay.status !== 'paid' ? (
                              <button
                                onClick={() => {
                                  setSelectedPayroll(pay);
                                  setIsPayrollOpen(true);
                                }}
                                className="px-3 py-1.5 bg-primary text-white font-semibold rounded hover:bg-primary/95 text-xs transition-colors cursor-pointer"
                              >
                                Disburse
                              </button>
                            ) : (
                              <span className="text-xs text-green-700 font-bold mr-xs">Completed</span>
                            )}
                            <button
                              onClick={() => {
                                setSelectedPayrollRecord(pay);
                                setIsPayrollRecordOpen(true);
                              }}
                              className="text-primary hover:underline text-xs font-semibold cursor-pointer ml-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this employee payroll registry record?')) {
                                  deletePayrollMutation.mutate(pay.id);
                                }
                              }}
                              className="text-error hover:underline text-xs font-semibold cursor-pointer ml-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* ── FINANCIAL CALENDAR ── */}
      <div>
        <FinancialCalendar events={calendarEvents} isLoading={isCalendarLoading} />
      </div>

      {/* ── TRANSACTION LEDGER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Ledger table */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-soft flex flex-col justify-between">
          <div>
            <div className="p-lg border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
              <div>
                <h4 className="font-card-title text-card-title text-on-surface">Ledger Transactions Logs</h4>
                <p className="text-body-sm text-on-surface-variant">Audit log of all receipts, overhead payouts, and vendor settlement history</p>
              </div>
              <input
                type="text"
                placeholder="Search logs..."
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                className="w-40 h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 text-on-surface transition-all placeholder:text-on-surface-variant/60"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead className="bg-surface-container-low text-on-surface-variant font-label-uppercase text-label-uppercase border-b border-outline-variant/30">
                  <tr>
                    <th className="px-lg py-md">Type</th>
                    <th className="px-lg py-md">Description</th>
                    <th className="px-lg py-md">Category</th>
                    <th className="px-lg py-md text-right">Amount</th>
                    <th className="px-lg py-md">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-on-surface font-medium">
                  {isLedgerLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-lg shimmer">Loading ledger...</td>
                    </tr>
                  ) : (
                    transactionsLedger
                      .filter(tx => {
                        const desc = tx.description.toLowerCase();
                        const cat = tx.category.toLowerCase();
                        const query = transactionSearch.toLowerCase();
                        return desc.includes(query) || cat.includes(query);
                      })
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-lg py-md">
                            <span className={clsx(
                              'px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border',
                              tx.type === 'income' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-error border-red-200'
                            )}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-lg py-md font-semibold">{tx.description}</td>
                          <td className="px-lg py-md text-secondary">{tx.category}</td>
                          <td className={clsx(
                            'px-lg py-md font-data-mono text-data-mono font-bold text-right',
                            tx.type === 'income' ? 'text-green-700' : 'text-rose-600'
                          )}>
                            {tx.type === 'income' ? '+' : ''}₹{tx.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-lg py-md">
                            <span className="text-[10px] text-green-700 font-bold uppercase border border-green-200 bg-green-50 px-2 py-0.5 rounded-full">✔ Paid</span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial Reports Generator */}
        <div id="reports" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft flex flex-col justify-between">
          <div>
            <h4 className="font-card-title text-card-title text-on-surface">Financial Reports Compiler</h4>
            <p className="text-body-sm text-on-surface-variant">Generate and download official PDF audits and spreadsheets</p>

            <div className="space-y-sm mt-md">
              {[
                { name: 'Monthly Ledger Statement', type: 'Ledger_Monthly' },
                { name: 'Q2 Tax Assessment Report', type: 'Tax_Q2' },
                { name: 'Project Profitability SOW Sheet', type: 'Profitability' },
                { name: 'Quarterly Cash Flow Audits', type: 'CashFlow_Q' }
              ].map(report => (
                <div key={report.type} className="p-sm bg-surface-container-low/50 border border-outline-variant/35 rounded-xl flex items-center justify-between gap-sm">
                  <span className="text-[10px] font-bold text-on-surface truncate w-40">{report.name}</span>
                  <div className="flex gap-xs">
                    <button
                      onClick={() => handleReportGeneration('csv', report.type)}
                      className="p-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded hover:bg-surface-container transition-all cursor-pointer text-secondary"
                      title="CSV Sheet"
                    >
                      <FileSpreadsheet size={13} />
                    </button>
                    <button
                      onClick={() => handleReportGeneration('pdf', report.type)}
                      className="p-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded hover:bg-surface-container transition-all cursor-pointer text-rose-600"
                      title="PDF Document"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── FLOATING QUICK ACTIONS MENU ── */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
          className="h-10 px-md bg-secondary text-white font-bold rounded-full shadow-lg hover:shadow-slate-500/25 flex items-center gap-xs cursor-pointer text-xs"
        >
          <Plus size={14} className={clsx('transition-transform duration-200', isQuickActionOpen && 'rotate-45')} />
          <span>Quick Actions</span>
        </button>

        <AnimatePresence>
          {isQuickActionOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-12 left-0 w-44 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-md overflow-hidden"
            >
              {[
                { label: 'Quick Expense', icon: Plus, action: () => { setSelectedExpense(null); setIsExpenseOpen(true); } },
                { label: 'Quick Liability', icon: AlertTriangle, action: () => { setSelectedLiability(null); setIsLiabilityOpen(true); } },
                { label: 'Disburse Payroll', icon: CreditCard, action: () => { toast.success('Disburse Payroll clicked: please use the employee payroll table action.'); } },
                { label: 'Generate Reports', icon: Download, action: () => { handleReportGeneration('pdf', 'Quick_Ledger'); } }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setIsQuickActionOpen(false);
                  }}
                  className="flex items-center gap-sm w-full px-sm py-1.5 hover:bg-surface-container-low rounded-lg text-[11px] text-on-surface-variant cursor-pointer transition-colors font-semibold"
                >
                  <item.icon size={12} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CHAT BOT WIDGET ── */}
      <AICopilotWidget />

      {/* ── MODALS LAYER ── */}
      
      {/* 1. ExpenseModal */}
      <ExpenseModal
        isOpen={isExpenseOpen}
        onClose={() => {
          setIsExpenseOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onSave={(payload) => saveExpenseMutation.mutate(payload)}
        isLoading={saveExpenseMutation.isPending}
      />

      {/* 2. LiabilityModal */}
      <LiabilityModal
        isOpen={isLiabilityOpen}
        onClose={() => {
          setIsLiabilityOpen(false);
          setSelectedLiability(null);
        }}
        liability={selectedLiability}
        onSave={(payload) => saveLiabilityMutation.mutate(payload)}
        isLoading={saveLiabilityMutation.isPending}
      />

      {/* 3. PayrollModal */}
      <PayrollModal
        isOpen={isPayrollOpen}
        onClose={() => {
          setIsPayrollOpen(false);
          setSelectedPayroll(null);
        }}
        payroll={selectedPayroll}
        onPay={(payload) => paySalaryMutation.mutate({ id: selectedPayroll!.id, payload })}
        isLoading={paySalaryMutation.isPending}
      />

      {/* 4. SubscriptionModal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => {
          setIsSubscriptionOpen(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        onSave={(payload) => saveSubscriptionMutation.mutate(payload)}
        isLoading={saveSubscriptionMutation.isPending}
      />

      {/* 5. PayrollRecordModal */}
      <PayrollRecordModal
        isOpen={isPayrollRecordOpen}
        onClose={() => {
          setIsPayrollRecordOpen(false);
          setSelectedPayrollRecord(null);
        }}
        payroll={selectedPayrollRecord}
        onSave={(payload) => savePayrollRecordMutation.mutate(payload)}
        isLoading={savePayrollRecordMutation.isPending}
      />

    </div>
  );
}
