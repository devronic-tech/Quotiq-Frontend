import { useAuth } from '@/app/providers/auth-provider';
import { Bell, Search, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/quotations': 'Quotations',
  '/quotations/new': 'New Quotation',
  '/invoices': 'Invoices',
  '/invoices/new': 'New Invoice',
  '/templates': 'Templates',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/customers': 'Customers',
  '/departments': 'Departments',
  '/products': 'Products & Services',
  '/finance': 'Finance',
};

function getPageTitle(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.startsWith('/customers/')) return 'Customer Detail';
  if (pathname.startsWith('/quotations/')) return 'Quotation Detail';
  if (pathname.startsWith('/invoices/')) return 'Invoice Detail';
  if (pathname.startsWith('/departments/')) return 'Department';
  return 'QuotaFlow';
}

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-40 h-16 w-full  border-b border-outline-variant flex items-center justify-between px-layout-margin bg-white">
      {/* Page Title & Breadcrumbs */}
      <div>
        <h1 className="font-page-title text-base font-bold text-on-surface">{title}</h1>
      </div>

      {/* Quick search, notifications, profile actions */}
      <div className="flex items-center gap-md">
        {/* Search placeholder */}
        <div className="relative hidden md:block w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full h-11 pl-9 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm transition-all outline-none text-on-surface"
          />
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all relative cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse-dot"></span>
        </button>


       
      </div>
    </header>
  );
}
