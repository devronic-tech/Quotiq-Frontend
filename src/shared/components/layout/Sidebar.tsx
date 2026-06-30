import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth-provider';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  FileCode2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Users,
  Building2,
  ShoppingBag,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Quotations', to: '/quotations', icon: FileText },
  { label: 'Invoices', to: '/invoices', icon: Receipt },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Departments', to: '/departments', icon: Building2 },
  { label: 'Products & Services', to: '/products', icon: ShoppingBag },
  { label: 'Templates', to: '/templates', icon: FileCode2 },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 flex flex-col h-screen border-r border-outline-variant bg-surface-container text-secondary shrink-0 z-50 py-lg"
    >
      {/* Header / Logo */}
      <div className="px-lg mb-xl flex items-center justify-between">
        <div className="flex items-center overflow-hidden h-9">
          {isCollapsed ? (
            <img src="/half_no_bg.png" alt="Logo" className="h-9 w-9 object-contain" />
          ) : (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src="/nobglogo.png"
              alt="Devronic Logo"
              className="h-9 object-contain"
            />
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 h-6 w-6 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-secondary hover:text-primary shadow-soft transition-all duration-200 z-10 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-sm space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-md px-lg py-sm font-semibold transition-colors border-l-2 text-sm group',
                isActive
                  ? 'bg-primary/5 border-primary text-primary'
                  : 'border-transparent text-secondary hover:bg-secondary-container/50 hover:text-on-secondary-fixed'
              )
            }
          >
            <item.icon size={18} className="shrink-0 group-hover:scale-105 transition-transform duration-200" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap font-body-sm"
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-outline-variant/30 space-y-2 mt-auto">
        {user && (
          <div className="flex items-center gap-3 overflow-hidden px-2 py-1">
            <div className="h-9 w-9 rounded-full bg-primary-fixed border border-outline-variant flex items-center justify-center text-primary font-bold shrink-0 uppercase text-sm">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-xs font-bold text-on-surface truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-secondary truncate uppercase tracking-wider font-semibold">{user.role}</p>
              </motion.div>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-md w-full px-lg py-sm text-secondary hover:bg-error-container/20 hover:text-error transition-all duration-200 text-left group cursor-pointer text-sm font-semibold rounded-lg"
        >
          <LogOut size={18} className="shrink-0 text-secondary group-hover:text-error" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whitespace-nowrap font-body-sm"
            >
              Sign Out
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
