import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '@/shared/lib/axios';
import Button from '@/shared/components/ui/Button';
import Modal from '@/shared/components/ui/Modal';
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Building,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Users,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Address {
  type: 'billing' | 'shipping';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  notes: string | null;
  status: 'active' | 'completed' | 'discarded';
  addresses: Address[];
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'discarded'>('active');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Address states
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCountry, setBillingCountry] = useState('India');

  // Fetch customers
  const { data: customers = [], isLoading: loadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/v1/customers');
      return data.data;
    },
  });

  // Fetch departments
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/v1/departments');
      return data.data;
    },
  });

  // Fetch quotations to calculate customer projects count
  const { data: quotations = [] } = useQuery<any[]>({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data } = await api.get('/v1/quotations');
      return data.data;
    },
  });

  // Fetch invoices to calculate customer outstanding balances
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/v1/invoices');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      await api.post('/v1/customers', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully');
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to create customer';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      await api.put(`/v1/customers/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to update customer';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to delete customer';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const addresses = [];
    if (billingStreet || billingCity) {
      addresses.push({
        type: 'billing',
        street: billingStreet,
        city: billingCity,
        state: billingState,
        zipCode: billingZip,
        country: billingCountry,
      });
    }

    const payload = {
      name,
      company: company || undefined,
      email: email || undefined,
      phone: phone || undefined,
      status,
      gstNumber: gstNumber || undefined,
      panNumber: panNumber || undefined,
      notes: notes || undefined,
      departmentId: departmentId || null,
      addresses,
    };

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setCompany(customer.company || '');
    setEmail(customer.email || '');
    setPhone(customer.phone || '');
    setStatus(customer.status || 'active');
    setGstNumber(customer.gstNumber || '');
    setPanNumber(customer.panNumber || '');
    setNotes(customer.notes || '');
    setDepartmentId(customer.departmentId || '');

    const billing = customer.addresses.find((a) => a.type === 'billing');
    if (billing) {
      setBillingStreet(billing.street);
      setBillingCity(billing.city);
      setBillingState(billing.state);
      setBillingZip(billing.zipCode);
      setBillingCountry(billing.country);
    }

    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingCustomer(null);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setStatus('active');
    setGstNumber('');
    setPanNumber('');
    setNotes('');
    setDepartmentId('');

    setBillingStreet('');
    setBillingCity('');
    setBillingState('');
    setBillingZip('');
    setBillingCountry('India');
  };

  // Calculations for Customers List
  const getCustomerStats = (customerId: string, statusValue: string) => {
    const customerQuotations = quotations.filter((q) => q.customer?.id === customerId);
    const customerInvoices = invoices.filter((inv) => inv.customer?.id === customerId);

    // Count Projects
    const projectsCount = customerQuotations.length;

    // Calculate Outstanding Balance
    const outstandingVal = customerInvoices.reduce((sum, inv) => {
      if (inv.status !== 'paid' && inv.status !== 'voided') {
        return sum + (Number(inv.grandTotal || 0) - Number(inv.amountPaid || 0));
      }
      return sum;
    }, 0);

    // Calculate Status
    let statusLabel = 'Active';
    let statusClass = 'bg-green-100 text-green-700';

    if (statusValue === 'completed') {
      statusLabel = 'Completed';
      statusClass = 'bg-blue-100 text-blue-700';
    } else if (statusValue === 'discarded') {
      statusLabel = 'Discarded';
      statusClass = 'bg-outline-variant/40 text-secondary';
    } else {
      const hasOverdue = customerInvoices.some(
        (inv) =>
          inv.status === 'overdue' ||
          (inv.status === 'unpaid' && new Date(inv.dueDate) < new Date())
      );

      if (hasOverdue) {
        statusLabel = 'Overdue';
        statusClass = 'bg-error-container text-error';
      }
    }

    return { projectsCount, outstandingVal, statusLabel, statusClass };
  };

  // Filter & Search customers
  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.company && c.company.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query))
    );
  });

  // Pagination
  const totalCustomers = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalCustomers / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  // Top Bento Stats Calculations
  const totalOutstandingAll = invoices.reduce((sum, inv) => {
    if (inv.status !== 'paid' && inv.status !== 'voided') {
      return sum + (Number(inv.grandTotal || 0) - Number(inv.amountPaid || 0));
    }
    return sum;
  }, 0);

  const activeProjectsCount = quotations.filter(
    (q) => q.status !== 'draft' && q.status !== 'declined'
  ).length;

  return (
    <div className="flex-1">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
        <div>
          <h2 className="font-page-title text-page-title text-on-surface mb-xs">Customer Registry</h2>
          <p className="font-body-md text-secondary">Manage your enterprise relationships and outstanding accounts.</p>
        </div>
        <div className="flex items-center gap-sm">
          {/* Search bar integration */}
          <div className="relative w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              className="w-full bg-white border border-outline-variant rounded-xl py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant h-11"
              placeholder="Search customers..."
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-xs px-md py-sm bg-primary text-white rounded-xl text-body-md font-semibold shadow-md hover:bg-primary/90 transition-all active:scale-95 h-11"
          >
            <Plus size={18} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Dynamic 3-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-soft hover:shadow-md transition-shadow">
          <p className="font-label-uppercase text-on-surface-variant mb-xs uppercase tracking-wider text-[11px] font-bold">Total Customers</p>
          <h3 className="font-page-title font-black text-on-surface text-[28px]">{customers.length}</h3>
          <p className="text-body-sm text-emerald-600 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp size={14} className="text-emerald-600" /> Live active registry
          </p>
        </div>
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-soft hover:shadow-md transition-shadow">
          <p className="font-label-uppercase text-on-surface-variant mb-xs uppercase tracking-wider text-[11px] font-bold">Active Projects</p>
          <h3 className="font-page-title font-black text-on-surface text-[28px]">{activeProjectsCount}</h3>
          <p className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
            Active and sent quotations
          </p>
        </div>
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-soft hover:shadow-md transition-shadow">
          <p className="font-label-uppercase text-on-surface-variant mb-xs uppercase tracking-wider text-[11px] font-bold">Total Outstanding</p>
          <h3 className="font-page-title font-black text-primary text-[28px]">
            ₹{totalOutstandingAll.toLocaleString('en-IN')}
          </h3>
          <p className="text-body-sm text-error flex items-center gap-1 mt-1 font-semibold">
            <AlertTriangle size={14} className="text-error" /> Unpaid balances
          </p>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-soft overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low/30">
          <div className="flex items-center gap-md">
            <span className="text-body-sm text-outline">
              Showing {paginatedCustomers.length} of {totalCustomers} customers
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 hover:bg-surface-container rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-body-sm font-semibold px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 hover:bg-surface-container rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Main Table */}
        {loadingCustomers ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paginatedCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users size={48} className="text-outline-variant mb-4" />
            <h3 className="text-body-md font-bold text-on-surface">No customers found</h3>
            <p className="text-body-sm text-secondary max-w-[320px] leading-relaxed mt-1">
              Add client profiles to store billing details and generate transactions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-md py-sm font-label-uppercase text-secondary border-b border-outline-variant text-[11px] uppercase tracking-wider font-bold">
                    Customer & Company
                  </th>
                  <th className="px-md py-sm font-label-uppercase text-secondary border-b border-outline-variant text-[11px] uppercase tracking-wider font-bold">
                    Contact Details
                  </th>
                  <th className="px-md py-sm font-label-uppercase text-secondary border-b border-outline-variant text-[11px] uppercase tracking-wider font-bold">
                    Status
                  </th>
                  <th className="px-md py-sm font-label-uppercase text-secondary border-b border-outline-variant text-right text-[11px] uppercase tracking-wider font-bold">
                    Outstanding
                  </th>
                  <th className="w-24 px-md py-sm border-b border-outline-variant"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {paginatedCustomers.map((c) => {
                  const { projectsCount, outstandingVal, statusLabel, statusClass } = getCustomerStats(c.id, c.status);
                  const initials = c.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-secondary-container/10 transition-colors group"
                    >
                      <td className="px-md py-md">
                        <Link to={`/customers/${c.id}`} className="flex items-center gap-md hover:text-primary transition-colors group/link">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm font-data-mono group-hover/link:bg-primary group-hover/link:text-white transition-colors">
                            {initials}
                          </div>
                          <div>
                            <p className="font-body-md font-semibold text-on-surface group-hover/link:text-primary transition-colors">{c.name}</p>
                            <p className="text-body-sm text-secondary">{c.company || 'Private Client'}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-md py-md">
                        <div className="flex flex-col">
                          <p className="text-body-sm text-on-surface font-medium">{c.email || '—'}</p>
                          <p className="text-[12px] text-outline">{c.phone || '—'}</p>
                        </div>
                      </td>
                      <td className="px-md py-md">
                        <select
                          value={c.status || 'active'}
                          onChange={(e) => {
                            const newStatus = e.target.value as any;
                            updateMutation.mutate({
                              id: c.id,
                              payload: {
                                name: c.name,
                                company: c.company || '',
                                email: c.email || '',
                                phone: c.phone || '',
                                gstNumber: c.gstNumber || '',
                                panNumber: c.panNumber || '',
                                notes: c.notes || '',
                                status: newStatus,
                                addresses: c.addresses.map((a) => ({
                                  type: a.type,
                                  street: a.street || '',
                                  city: a.city || '',
                                  state: a.state || '',
                                  zipCode: a.zipCode || '',
                                  country: a.country || '',
                                })),
                              },
                            });
                          }}
                          className={`status-pill ${statusClass} border-0 cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none pr-6 bg-[image:none] appearance-none relative`}
                          style={{
                            paddingRight: '20px',
                            background: 'url("data:image/svg+xml;utf8,<svg fill=\'%23505f76\' height=\'16\' viewBox=\'0 0 24 24\' width=\'16\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/><path d=\'M0 0h24v24H0z\' fill=\'none\'/></svg>") no-repeat right 4px center',
                          }}
                        >
                          <option value="active" className="bg-white text-on-surface">Active</option>
                          <option value="completed" className="bg-white text-on-surface">Completed</option>
                          <option value="discarded" className="bg-white text-on-surface">Discarded</option>
                        </select>
                      </td>
                      <td
                        className={`px-md py-md text-right font-data-mono font-semibold ${
                          outstandingVal > 0 && statusLabel === 'Overdue'
                            ? 'text-error font-bold'
                            : 'text-on-surface'
                        }`}
                      >
                        ₹{outstandingVal.toLocaleString('en-IN')}
                      </td>
                      <td className="px-md py-md text-right">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 justify-end">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-secondary hover:bg-surface-container hover:text-primary transition-all duration-200"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this customer?')) {
                                deleteMutation.mutate(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-secondary hover:bg-error-container/20 hover:text-error transition-all duration-200"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Form Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 custom-scrollbar">
          {/* Section 1: Customer Profile */}
          <div className="bg-surface-container-low/20 border border-outline-variant/60 rounded-xl p-4 space-y-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-primary">Customer Profile</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Contact Person Name <span className="text-error font-bold">*</span>
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Company Name
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Email Address
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                  placeholder="e.g. client@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Phone Number
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                  placeholder="e.g. +91 99999 99999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Status
                </label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-11"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="discarded">Discarded</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Department
                </label>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-11"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Taxation */}
          <div className="bg-surface-container-low/20 border border-outline-variant/60 rounded-xl p-4 space-y-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-primary">Taxation Identifiers</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  GSTIN
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  maxLength={15}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  PAN
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                  placeholder="e.g. ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Billing Address */}
          <div className="bg-surface-container-low/20 border border-outline-variant/60 rounded-xl p-4 space-y-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-primary">Billing Address</h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Street Line
                </label>
                <input
                  className="w-full bg-white border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant h-11"
                  placeholder="e.g. 404 Office Complex, Linking Road"
                  value={billingStreet}
                  onChange={(e) => setBillingStreet(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                    City
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                    placeholder="Mumbai"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                    State
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                    placeholder="Maharashtra"
                    value={billingState}
                    onChange={(e) => setBillingState(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Zip/PIN Code
                  </label>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-2.5 px-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60 h-11"
                    placeholder="400001"
                    value={billingZip}
                    onChange={(e) => setBillingZip(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
              Notes / Remarks
            </label>
            <textarea
              className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/60"
              placeholder="Internal customer notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-outline-variant pt-4 sticky bottom-0 bg-surface-container-lowest">
            <button
              type="button"
              onClick={handleClose}
              className="px-lg py-2 border border-outline-variant rounded-xl font-bold hover:bg-surface-container-low transition-all h-11 text-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-lg py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all shadow-md active:scale-95 h-11 flex items-center justify-center gap-2"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
