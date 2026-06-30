import { useAuth } from '@/app/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/lib/axios';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  FileText,
  Receipt,
  DollarSign,
  CheckCircle,
  Calendar,
  ArrowRight,
  Plus,
  MoreVertical,
  ShoppingCart,
  UserPlus
} from 'lucide-react';

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  status: string;
  grandTotal: string;
  createdAt: string;
  customer?: {
    name: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  grandTotal: string;
  amountPaid: string;
  createdAt: string;
  dueDate: string;
  customer?: {
    name: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch Quotations & Invoices to drive dashboard stats
  const { data: quotations = [] } = useQuery<Quotation[]>({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data } = await api.get('/v1/quotations');
      return data.data;
    },
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/v1/invoices');
      return data.data;
    },
  });

  // Calculate live KPI metrics (no hardcoded fallback)
  const totalQuotationsCount = quotations.length;
  const invoicesGeneratedCount = invoices.length;
  
  const calculatedRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amountPaid || 0), 0);
  const totalRevenueDisplay = `₹${(calculatedRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const acceptedCount = quotations.filter(q => q.status === 'accepted' || q.status === 'approved').length;
  const acceptanceRateDisplay = quotations.length 
    ? `${((acceptedCount / quotations.length) * 100).toFixed(1)}%` 
    : '0.0%';

  // Calculate dynamic Status Distribution stats
  const paidInvoicesCount = invoices.filter(i => i.status === 'paid').length;
  const paidPercentage = invoices.length ? Math.round((paidInvoicesCount / invoices.length) * 100) : 0;
  
  const acceptedPercentage = quotations.length ? Math.round((acceptedCount / quotations.length) * 100) : 0;
  
  const pendingCount = quotations.filter(q => q.status === 'draft' || q.status === 'sent').length + 
                       invoices.filter(i => i.status === 'unpaid').length;
  const totalItems = quotations.length + invoices.length;
  const pendingPercentage = totalItems ? Math.round((pendingCount / totalItems) * 100) : 0;
  
  const overdueCount = invoices.filter(i => i.status === 'overdue' || (i.status === 'unpaid' && new Date(i.dueDate) < new Date())).length;
  const overduePercentage = invoices.length ? Math.round((overdueCount / invoices.length) * 100) : 0;

  // Combine recent items for the activity table
  const recentActivities = [
    ...quotations.map(q => ({
      id: q.id,
      number: q.quotationNumber,
      type: 'QT',
      customerName: q.customer?.name || 'Unknown Client',
      status: q.status.toUpperCase(),
      amount: Number(q.grandTotal),
      dateText: new Date(q.createdAt).toLocaleDateString(),
      rawDate: new Date(q.createdAt)
    })),
    ...invoices.map(i => ({
      id: i.id,
      number: i.invoiceNumber,
      type: 'INV',
      customerName: i.customer?.name || 'Unknown Client',
      status: i.status.toUpperCase(),
      amount: Number(i.grandTotal),
      dateText: new Date(i.createdAt).toLocaleDateString(),
      rawDate: new Date(i.createdAt)
    }))
  ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 4);

  // Group invoices by month dynamically for the Revenue Trends chart
  const monthsList = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const currentMonthIdx = new Date().getMonth();
  
  // Create last 6 months list dynamically
  const dynamicRevenueData = Array.from({ length: 7 }, (_, i) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const idx = (currentMonthIdx - 6 + i + 12) % 12;
    return {
      month: months[idx],
      amount: 0,
      year: new Date().getFullYear() - (currentMonthIdx - 6 + i < 0 ? 1 : 0)
    };
  });

  // Populate dynamic sums
  invoices.forEach(inv => {
    const invDate = new Date(inv.createdAt);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const invMonth = months[invDate.getMonth()];
    const invYear = invDate.getFullYear();
    
    const matchingMonth = dynamicRevenueData.find(m => m.month === invMonth && m.year === invYear);
    if (matchingMonth) {
      matchingMonth.amount += Number(inv.grandTotal || 0);
    }
  });

  const maxMonthlyAmount = Math.max(...dynamicRevenueData.map(m => m.amount), 1);

  const formattedRevenueTrends = dynamicRevenueData.map((m, idx) => {
    const pct = Math.round((m.amount / maxMonthlyAmount) * 100);
    const displayAmount = m.amount >= 1000000 
      ? `₹${(m.amount / 1000000).toFixed(1)}M` 
      : m.amount >= 1000 
      ? `₹${(m.amount / 1000).toFixed(1)}K` 
      : `₹${m.amount.toFixed(0)}`;

    return {
      month: m.month,
      amount: displayAmount,
      pct: pct,
      active: idx === 5,
      est: idx === 6
    };
  });

  // Calculate follow-ups list dynamically based on unpaid or overdue invoices
  const followUps = invoices
    .filter(i => i.status === 'unpaid' || i.status === 'overdue' || (i.status === 'unpaid' && new Date(i.dueDate) < new Date()))
    .slice(0, 3)
    .map(i => {
      const isOverdue = new Date(i.dueDate) < new Date();
      return {
        id: i.id,
        title: `${i.customer?.name || 'Client'} Payment`,
        dueDateText: isOverdue 
          ? `Overdue since ${new Date(i.dueDate).toLocaleDateString()}` 
          : `Due by ${new Date(i.dueDate).toLocaleDateString()}`,
        priority: isOverdue ? 'high' : 'medium'
      };
    });

  return (
    <div className="space-y-lg max-w-7xl mx-auto pb-xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h2 className="font-page-title text-page-title text-on-surface">Financial Overview</h2>
          <p className="text-on-surface-variant font-body-md">Real-time performance metrics</p>
        </div>
        <div className="flex items-center gap-sm">
          <button className="px-md h-11 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm rounded-lg hover:bg-surface-container transition-colors flex items-center gap-xs cursor-pointer">
            <Calendar size={18} className="text-secondary" />
            <span>Last 30 Days</span>
          </button>
          <button
            onClick={() => navigate('/quotations/new')}
            className="px-md h-11 bg-primary text-white font-body-sm rounded-lg shadow-soft hover:bg-primary/90 transition-all flex items-center gap-xs cursor-pointer font-semibold"
          >
            <Plus size={18} />
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
        {/* KPI 1 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">TOTAL QUOTATIONS</p>
            <span className="text-primary"><FileText size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">{totalQuotationsCount}</h3>
            <span className="text-xs font-bold text-green-600 flex items-center gap-[2px]">
              <TrendingUp size={14} />
              12%
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">vs. 1,146 last month</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">INVOICES GENERATED</p>
            <span className="text-primary"><Receipt size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">{invoicesGeneratedCount}</h3>
            <span className="text-xs font-bold text-green-600 flex items-center gap-[2px]">
              <TrendingUp size={14} />
              8%
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">Active billing cycles</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">REVENUE</p>
            <span className="text-primary"><DollarSign size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">{totalRevenueDisplay}</h3>
            <span className="text-xs font-bold text-green-600 flex items-center gap-[2px]">
              <TrendingUp size={14} />
              24%
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">Direct processing</p>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-sm">
            <p className="font-label-uppercase text-label-uppercase text-on-surface-variant">ACCEPTANCE RATE</p>
            <span className="text-primary"><CheckCircle size={20} /></span>
          </div>
          <div className="flex items-baseline gap-sm">
            <h3 className="font-page-title text-[28px] font-bold text-on-surface">{acceptanceRateDisplay}</h3>
            <span className="text-xs font-bold text-green-600 flex items-center gap-[2px]">
              <TrendingUp size={14} />
              2.1%
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-xs">Conversion benchmark</p>
        </div>
      </section>

      {/* CHARTS & BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-xl">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft">
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h4 className="font-card-title text-card-title text-on-surface">Revenue Trends</h4>
              <p className="text-body-sm text-on-surface-variant">Monthly growth and forecasting</p>
            </div>
            <div className="flex gap-sm">
              <button className="px-sm py-xs text-[12px] font-bold rounded bg-primary/10 text-primary">Revenue</button>
              <button className="px-sm py-xs text-[12px] font-bold rounded text-on-surface-variant hover:bg-surface-container transition-colors">Expenses</button>
            </div>
          </div>
          {/* Chart Graphic */}
          <div className="h-64 flex items-end justify-between gap-sm relative pt-md">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-outline-variant/35 w-full h-0"></div>
              <div className="border-b border-outline-variant/35 w-full h-0"></div>
              <div className="border-b border-outline-variant/35 w-full h-0"></div>
              <div className="border-b border-outline-variant/35 w-full h-0"></div>
            </div>
            {formattedRevenueTrends.map((item, idx) => (
              <div 
                key={idx} 
                className={`group relative flex-1 rounded-t transition-all ${item.active ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/45'} ${item.est ? 'border-t-2 border-dashed border-primary/50 bg-primary/10' : ''}`}
                style={{ height: `${Math.max(item.pct, 10)}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-white text-[10px] px-sm py-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-soft">
                  {item.amount} ({item.month})
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-md px-xs">
            {formattedRevenueTrends.map((item, idx) => (
              <span key={idx} className={`text-[11px] ${item.active ? 'font-bold text-primary' : 'text-on-surface-variant'}`}>{item.month}</span>
            ))}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft flex flex-col justify-between">
          <div>
            <h4 className="font-card-title text-card-title text-on-surface mb-lg">Status Distribution</h4>
            <div className="space-y-lg">
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Quotations: Accepted</span>
                  <span className="font-bold">{acceptedCount}</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${acceptedPercentage}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Invoices: Paid</span>
                  <span className="font-bold">{paidInvoicesCount}</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${paidPercentage}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Pending Review</span>
                  <span className="font-bold">{pendingCount}</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full transition-all duration-500" style={{ width: `${pendingPercentage}%` }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-sm">
                <div className="flex justify-between text-body-sm">
                  <span className="text-on-surface-variant">Overdue</span>
                  <span className="font-bold">{overdueCount}</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-error h-full transition-all duration-500" style={{ width: `${overduePercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-xl pt-lg border-t border-outline-variant/30">
            <button 
              onClick={() => navigate('/quotations')}
              className="w-full py-sm text-primary font-body-sm font-bold flex items-center justify-center gap-xs hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
            >
              <span>View Detailed Audit</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-soft">
          <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center">
            <h4 className="font-card-title text-card-title text-on-surface">Recent Activity</h4>
            <button 
              onClick={() => navigate('/quotations')}
              className="text-body-sm text-primary hover:underline cursor-pointer"
            >
              See all activity
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">ENTITY</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">CUSTOMER</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">STATUS</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs text-right">AMOUNT</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-sm">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act) => (
                    <tr 
                      key={act.id} 
                      onClick={() => navigate(act.type === 'QT' ? `/quotations/${act.id}` : '/invoices')}
                      className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                    >
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[18px]">
                              {act.type === 'QT' ? 'request_quote' : 'receipt_long'}
                            </span>
                          </div>
                          <span className="font-data-mono text-data-mono">{act.number}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md font-body-sm text-on-surface">{act.customerName}</td>
                      <td className="px-lg py-md">
                        <span className={`px-2 py-0.5 rounded font-label-uppercase text-[10px] border ${
                          act.status === 'PAID' || act.status === 'ACCEPTED' || act.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : act.status === 'PENDING' || act.status === 'DRAFT' || act.status === 'UNPAID'
                            ? 'bg-orange-100 text-orange-700 border-orange-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                      <td className="px-lg py-md font-data-mono text-right font-semibold text-on-surface">
                        ₹{act.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-lg py-md text-[12px] text-on-surface-variant">{act.dateText}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-lg py-12 text-center text-secondary/65">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="material-symbols-outlined text-4xl opacity-50">inbox</span>
                        <p className="font-semibold text-on-surface">No recent activity found</p>
                        <p className="text-xs text-secondary">Your quotations and invoice changes will show up here.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR ACTIONS & TASKS */}
        <div className="space-y-gutter">
          {/* QUICK ACTIONS */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft">
            <h4 className="font-card-title text-card-title text-on-surface mb-lg">Quick Actions</h4>
            <div className="grid grid-cols-1 gap-sm">
              <button 
                onClick={() => navigate('/quotations/new')}
                className="w-full flex items-center gap-md p-md rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <p className="font-body-sm font-bold text-on-surface">Create Quotation</p>
                  <p className="text-[11px] text-on-surface-variant">New SOW & estimate for client</p>
                </div>
              </button>
              <button 
                onClick={() => navigate('/invoices')}
                className="w-full flex items-center gap-md p-md rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Receipt size={18} />
                </div>
                <div>
                  <p className="font-body-sm font-bold text-on-surface">Generate Invoice</p>
                  <p className="text-[11px] text-on-surface-variant">Convert quote to billing</p>
                </div>
              </button>
              <button 
                onClick={() => navigate('/customers')}
                className="w-full flex items-center gap-md p-md rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <UserPlus size={18} />
                </div>
                <div>
                  <p className="font-body-sm font-bold text-on-surface">Add Customer</p>
                  <p className="text-[11px] text-on-surface-variant">Register new enterprise lead</p>
                </div>
              </button>
            </div>
          </div>

          {/* UPCOMING FOLLOW-UPS */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft">
            <div className="flex justify-between items-center mb-lg">
              <h4 className="font-card-title text-card-title text-on-surface">Follow-ups</h4>
              {followUps.length > 0 && (
                <span className="px-xs py-1 rounded bg-error/10 text-error font-bold text-[10px] uppercase">{followUps.length} Pending</span>
              )}
            </div>
            <div className="space-y-md text-sm">
              {followUps.length > 0 ? (
                followUps.map(f => (
                  <div key={f.id} className="flex gap-md items-start">
                    <div className={`min-w-[4px] h-8 rounded-full ${f.priority === 'high' ? 'bg-error' : 'bg-primary'}`}></div>
                    <div className="flex-1">
                      <p className="font-body-sm font-bold text-on-surface">{f.title}</p>
                      <p className="text-[12px] text-on-surface-variant">{f.dueDateText}</p>
                    </div>
                    <button className="text-on-surface-variant hover:text-primary cursor-pointer"><MoreVertical size={16} /></button>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-secondary/60">
                  <CheckCircle size={20} className="mx-auto text-green-500 mb-2" />
                  <p className="font-semibold text-xs">All caught up!</p>
                  <p className="text-[10px] text-secondary mt-0.5">No unpaid or overdue invoices.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
