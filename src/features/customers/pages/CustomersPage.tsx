import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/axios';
import Card from '@/shared/components/ui/Card';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Modal from '@/shared/components/ui/Modal';
import { Plus, Users, Trash2, Edit2, Loader2, MapPin, Mail, Phone, Building } from 'lucide-react';
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
  addresses: Address[];
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Address states
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCountry, setBillingCountry] = useState('India');

  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('India');

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/v1/customers');
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
    if (shippingStreet || shippingCity) {
      addresses.push({
        type: 'shipping',
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        zipCode: shippingZip,
        country: shippingCountry,
      });
    }

    const payload = {
      name,
      company: company || undefined,
      email: email || undefined,
      phone: phone || undefined,
      gstNumber: gstNumber || undefined,
      panNumber: panNumber || undefined,
      notes: notes || undefined,
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
    setGstNumber(customer.gstNumber || '');
    setPanNumber(customer.panNumber || '');
    setNotes(customer.notes || '');

    const billing = customer.addresses.find((a) => a.type === 'billing');
    if (billing) {
      setBillingStreet(billing.street);
      setBillingCity(billing.city);
      setBillingState(billing.state);
      setBillingZip(billing.zipCode);
      setBillingCountry(billing.country);
    }

    const shipping = customer.addresses.find((a) => a.type === 'shipping');
    if (shipping) {
      setShippingStreet(shipping.street);
      setShippingCity(shipping.city);
      setShippingState(shipping.state);
      setShippingZip(shipping.zipCode);
      setShippingCountry(shipping.country);
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
    setGstNumber('');
    setPanNumber('');
    setNotes('');

    setBillingStreet('');
    setBillingCity('');
    setBillingState('');
    setBillingZip('');
    setBillingCountry('India');

    setShippingStreet('');
    setShippingCity('');
    setShippingState('');
    setShippingZip('');
    setShippingCountry('India');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Customers</h2>
          <p className="text-xs text-slate-500 mt-1">Manage client profiles, address books, and contact details</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsOpen(true)}>
          New Customer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : customers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-800 bg-transparent">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-slate-400">
            <Users size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-200">No customers found</h3>
          <p className="text-xs text-slate-500 max-w-xs leading-relaxed mt-1">
            Create profiles to store addresses, GSTINs, contact numbers, and view complete transaction histories.
          </p>
          <Button variant="outline" size="sm" className="mt-6" icon={<Plus size={14} />} onClick={() => setIsOpen(true)}>
            Create Customer
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.map((c) => (
            <Card key={c.id} className="relative group border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/40 hover:shadow-glow-emerald flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-200">{c.name}</h4>
                    {c.company && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Building size={12} />
                        <span>{c.company}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this customer?')) {
                          deleteMutation.mutate(c.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-850 hover:text-red-400 transition-all duration-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  {c.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={12} />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} />
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>

                {(c.gstNumber || c.panNumber) && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-850">
                    {c.gstNumber && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        GST: {c.gstNumber}
                      </span>
                    )}
                    {c.panNumber && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        PAN: {c.panNumber}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {c.addresses.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-850 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <MapPin size={10} />
                    <span>Addresses ({c.addresses.length})</span>
                  </span>
                  <div className="text-[11px] text-slate-400 max-h-16 overflow-y-auto">
                    {c.addresses.map((a, i) => (
                      <div key={i} className="mb-1">
                        <strong className="capitalize text-slate-500 mr-1">{a.type}:</strong>
                        <span>{a.street}, {a.city}, {a.state} - {a.zipCode} ({a.country})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Person Name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Company Name"
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address"
              placeholder="e.g. client@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +91 99999 99999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="GSTIN"
              placeholder="e.g. 27AAAAA1111A1Z1"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              maxLength={15}
            />
            <Input
              label="PAN"
              placeholder="e.g. ABCDE1234F"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value)}
              maxLength={10}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Notes / Remarks</label>
            <textarea
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              placeholder="Internal customer notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Billing Address */}
          <div className="border-t border-slate-800 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Billing Address</h4>
            <div className="space-y-4">
              <Input
                label="Street Line"
                placeholder="e.g. 404 Office Complex, Linking Road"
                value={billingStreet}
                onChange={(e) => setBillingStreet(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  placeholder="Mumbai"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                />
                <Input
                  label="State"
                  placeholder="Maharashtra"
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                />
                <Input
                  label="Zip/PIN Code"
                  placeholder="400001"
                  value={billingZip}
                  onChange={(e) => setBillingZip(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="border-t border-slate-800 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Shipping Address</h4>
              <button
                type="button"
                className="text-[10px] font-bold text-slate-400 hover:text-slate-200"
                onClick={() => {
                  setShippingStreet(billingStreet);
                  setShippingCity(billingCity);
                  setShippingState(billingState);
                  setShippingZip(billingZip);
                  setShippingCountry(billingCountry);
                }}
              >
                Copy Billing
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Street Line"
                placeholder="e.g. Warehouse 1A, Sector 5"
                value={shippingStreet}
                onChange={(e) => setShippingStreet(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  placeholder="Mumbai"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                />
                <Input
                  label="State"
                  placeholder="Maharashtra"
                  value={shippingState}
                  onChange={(e) => setShippingState(e.target.value)}
                />
                <Input
                  label="Zip/PIN Code"
                  placeholder="400001"
                  value={shippingZip}
                  onChange={(e) => setShippingZip(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
