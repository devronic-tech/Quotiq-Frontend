import { FileText, Clock, Receipt, DollarSign, ArrowUpRight } from 'lucide-react';
import Card from '@/shared/components/ui/Card';
import { motion } from 'framer-motion';

const stats = [
  {
    label: 'Total Quotations',
    value: '0',
    description: 'Active quotes in pipeline',
    icon: FileText,
    color: 'emerald',
    trend: '+0% this month',
  },
  {
    label: 'Pending Approval',
    value: '0',
    description: 'Awaiting manager signoff',
    icon: Clock,
    color: 'yellow',
    trend: '0 outstanding',
  },
  {
    label: 'Invoices Generated',
    value: '0',
    description: 'Total invoices billed',
    icon: Receipt,
    color: 'violet',
    trend: '+0% conversion rate',
  },
  {
    label: 'Total Revenue',
    value: '$0.00',
    description: 'Total collections paid',
    icon: DollarSign,
    color: 'emerald',
    trend: 'No payments yet',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function StatsCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, idx) => (
        <motion.div key={idx} variants={cardVariants}>
          <Card hoverEffect className="relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-800/10 group-hover:scale-150 transition-transform duration-500 blur-2xl" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-100 mt-2">{stat.value}</h3>
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-300">
                <stat.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-[150px]">{stat.description}</span>
              <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                {stat.trend} <ArrowUpRight size={12} />
              </span>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
