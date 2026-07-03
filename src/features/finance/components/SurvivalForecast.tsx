import { useState } from 'react';
import { Sparkles, Sliders, Users, TrendingUp, TrendingDown, Clock, ShieldAlert, BadgePercent, Coins } from 'lucide-react';

interface SurvivalForecastProps {
  currentBalance: number;
  monthlyBurn: number;
}

export default function SurvivalForecast({ currentBalance = 1250000, monthlyBurn = 220000 }: SurvivalForecastProps) {
  // Simulator states
  const [newHires, setNewHires] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0); // flat change
  const [revenueDropPct, setRevenueDropPct] = useState(0); // percentage drop
  const [collectionDelayDays, setCollectionDelayDays] = useState(0);
  const [expenseIncrease, setExpenseIncrease] = useState(0);
  const [loanAmount, setLoanAmount] = useState(0);

  // Calculations
  const hireCost = newHires * 75000; // Average salary of ₹75,000 per hire
  const loanEmi = loanAmount * 0.03; // 3% monthly payback rate
  
  const simulatedBurn = Math.max(
    10000,
    monthlyBurn + hireCost + expenseIncrease + loanEmi - (revenueChange > 0 ? revenueChange : 0) + (revenueChange < 0 ? Math.abs(revenueChange) : 0) + (monthlyBurn * (revenueDropPct / 100))
  );

  const simulatedBalance = Math.max(0, currentBalance + loanAmount - (collectionDelayDays * (simulatedBurn / 30) * 0.5));
  
  const runwayMonths = simulatedBurn > 0 ? Number((simulatedBalance / simulatedBurn).toFixed(1)) : 12;

  // Exhaustion Date
  const getExhaustionDate = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + Math.floor(months));
    const dayFraction = months - Math.floor(months);
    d.setDate(d.getDate() + Math.floor(dayFraction * 30));
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  // Score grade
  const getHealthGrade = (months: number) => {
    if (months >= 12) return { grade: 'A+', color: 'text-emerald-600 border-emerald-600 bg-emerald-50' };
    if (months >= 8) return { grade: 'A', color: 'text-emerald-500 border-emerald-500 bg-emerald-50' };
    if (months >= 5) return { grade: 'B', color: 'text-yellow-600 border-yellow-600 bg-yellow-50' };
    if (months >= 3) return { grade: 'C', color: 'text-orange-600 border-orange-600 bg-orange-50' };
    return { grade: 'D', color: 'text-error border-error bg-red-50' };
  };

  const health = getHealthGrade(runwayMonths);
  const strokeDashoffset = Math.max(0, Math.min(251, 251 - (Math.min(runwayMonths, 24) / 24) * 251));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft">
      {/* Visual Indicator Score Card */}
      <div className="flex flex-col items-center justify-between border-b lg:border-b-0 lg:border-r border-outline-variant/30 pb-lg lg:pb-0 lg:pr-lg text-center">
        <div className="w-full">
          <h4 className="font-card-title text-card-title text-on-surface flex items-center justify-center gap-xs">
            <Sparkles size={16} className="text-primary animate-pulse" />
            <span>AI Survival Runways</span>
          </h4>
          <p className="text-body-sm text-on-surface-variant mt-xs">Interactive cash exhaustion forecast</p>
        </div>

        {/* Circular gauge */}
        <div className="relative flex items-center justify-center h-44 w-44 my-md">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="88" cy="88" r="80" stroke="var(--color-bg-secondary)" strokeWidth="12" fill="transparent" />
            <circle
              cx="88"
              cy="88"
              r="80"
              stroke={runwayMonths >= 6 ? '#10b981' : runwayMonths >= 3 ? '#eab308' : '#ba1a1a'}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="502"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black font-page-title tracking-tight text-on-surface leading-none">
              {runwayMonths}
            </span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">Months Left</span>
          </div>
        </div>

        <div className="space-y-sm w-full">
          <div className="flex items-center justify-between px-md py-sm rounded-lg bg-surface-container-low border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant font-semibold">Exhaustion Point</span>
            <span className="text-xs font-bold text-on-surface font-mono">{getExhaustionDate(runwayMonths)}</span>
          </div>
          <div className="flex items-center justify-between px-md py-sm rounded-lg bg-surface-container-low border border-outline-variant/30">
            <span className="text-xs text-on-surface-variant font-semibold">Survival Grade</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded border ${health.color}`}>{health.grade}</span>
          </div>
        </div>
      </div>

      {/* Simulator Sliders */}
      <div className="lg:col-span-2 space-y-md">
        <h5 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-xs">
          <Sliders size={14} />
          <span>Real-time Operations Simulator</span>
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* Slider 1: Hiring */}
          <div className="space-y-1.5 p-sm bg-surface-container-low border border-outline-variant/20 rounded-lg">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface-variant flex items-center gap-1">
                <Users size={14} className="text-indigo-500" />
                Team Hires (+₹75K/mo)
              </span>
              <span className="font-bold text-primary font-mono">+{newHires} Employees</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={newHires}
              onChange={(e) => setNewHires(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Slider 2: Revenue Change */}
          <div className="space-y-1.5 p-sm bg-surface-container-low border border-outline-variant/20 rounded-lg">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface-variant flex items-center gap-1">
                <TrendingUp size={14} className="text-emerald-500" />
                Revenue Adjustment
              </span>
              <span className={`font-bold font-mono ${revenueChange >= 0 ? 'text-emerald-700' : 'text-error'}`}>
                {revenueChange >= 0 ? '+' : ''}₹{(revenueChange / 1000).toFixed(0)}K
              </span>
            </div>
            <input
              type="range"
              min="-200000"
              max="500000"
              step="10000"
              value={revenueChange}
              onChange={(e) => setRevenueChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Slider 3: Revenue Drop Pct */}
          <div className="space-y-1.5 p-sm bg-surface-container-low border border-outline-variant/20 rounded-lg">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface-variant flex items-center gap-1">
                <TrendingDown size={14} className="text-rose-500" />
                Revenue Downturn %
              </span>
              <span className="font-bold text-rose-600 font-mono">-{revenueDropPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={revenueDropPct}
              onChange={(e) => setRevenueDropPct(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Slider 4: Client Payment Delay */}
          <div className="space-y-1.5 p-sm bg-surface-container-low border border-outline-variant/20 rounded-lg">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface-variant flex items-center gap-1">
                <Clock size={14} className="text-orange-500" />
                Client Collection Lag
              </span>
              <span className="font-bold text-orange-600 font-mono">+{collectionDelayDays} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={collectionDelayDays}
              onChange={(e) => setCollectionDelayDays(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Slider 5: Expense Increase */}
          <div className="space-y-1.5 p-sm bg-surface-container-low border border-outline-variant/20 rounded-lg">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface-variant flex items-center gap-1">
                <ShieldAlert size={14} className="text-amber-500" />
                SaaS/SOW Increases
              </span>
              <span className="font-bold text-amber-600 font-mono">+₹{(expenseIncrease / 1000).toFixed(0)}K</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="5000"
              value={expenseIncrease}
              onChange={(e) => setExpenseIncrease(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Slider 6: Loan payout */}
          <div className="space-y-1.5 p-sm bg-surface-container-low border border-outline-variant/20 rounded-lg">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-on-surface-variant flex items-center gap-1">
                <Coins size={14} className="text-teal-500" />
                Business Loan Payout
              </span>
              <span className="font-bold text-teal-600 font-mono">+₹{(loanAmount / 100000).toFixed(1)}L</span>
            </div>
            <input
              type="range"
              min="0"
              max="2500000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Live Simulator Status Message */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-sm">
          <span className="text-lg">💡</span>
          <p className="text-xs text-on-secondary-container leading-relaxed">
            Your initial monthly burn is <strong className="font-semibold text-primary">₹{monthlyBurn.toLocaleString('en-IN')}</strong>. Under this simulated scenario, monthly burn shifts to <strong className="font-semibold text-primary">₹{Math.round(simulatedBurn).toLocaleString('en-IN')}</strong>. Cash balance is projected at <strong className="font-semibold text-primary">₹{Math.round(simulatedBalance).toLocaleString('en-IN')}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
