import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/shared/lib/axios';
import Card from '@/shared/components/ui/Card';
import Button from '@/shared/components/ui/Button';
import { 
  ArrowLeft, 
  Receipt, 
  Trash2, 
  Plus, 
  Sparkles, 
  FileText,
  User,
  MapPin,
  HelpCircle,
  Info,
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
  email: string;
  address: string | null;
  addresses?: Address[];
}

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  tax: number;
}

interface QuotationSection {
  name: string;
  items: QuotationItem[];
}

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  grandTotal: string;
  currency: string;
  paymentTerms: string;
  notes: string | null;
  customer: Customer;
  sections: QuotationSection[];
}

interface InvoiceItemInput {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  tax: number;
}

export default function InvoiceBuilderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customer');

  // Prefill Quotations List
  const { data: quotations = [] } = useQuery<Quotation[]>({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data } = await api.get('/v1/quotations');
      return data.data;
    },
  });

  // Fetch Customers for select/autocomplete
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/v1/customers');
      return data.data;
    },
  });

  // State bindings
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [bankDetails, setBankDetails] = useState('Swift: QTFBNKUS66\nIBAN: US82 3904 2948 2903\nBank: Silicon Valley Trust');
  
  // Table Items state
  const [items, setItems] = useState<InvoiceItemInput[]>([
    { description: '', quantity: 0, unit: 'units', unitPrice: 0, discount: 0, tax: 0 }
  ]);

  // Handle Quotation Auto-conversion prefill
  const handlePrefillQuotation = async (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    if (!quoteId) return;

    try {
      const { data } = await api.get(`/v1/quotations/${quoteId}`);
      const q: Quotation = data.data;

      // Extract client person and address details from notes if present
      const notesParts = q.notes ? q.notes.split(' | ') : [];
      const extractedContact = notesParts[1]?.replace('Contact: ', '') || '';
      const extractedAddress = notesParts[2]?.replace('Address: ', '') || q.customer.address || '';

      // Prefill states
      setCustomerName(q.customer.name);
      setContactPerson(extractedContact);
      setBillingAddress(extractedAddress);
      setCurrency(q.currency);

      // Flatten SOW sections into a list of invoice items
      const flattenedItems: InvoiceItemInput[] = [];
      if (q.sections) {
        q.sections.forEach((sec) => {
          if (sec.items) {
            sec.items.forEach((it) => {
              flattenedItems.push({
                description: `${sec.name} - ${it.description}`,
                quantity: it.quantity,
                unit: it.unit || 'units',
                unitPrice: Number(it.unitPrice),
                discount: Number(it.discount || 0),
                tax: Number(it.tax || 0),
              });
            });
          }
        });
      }
      if (flattenedItems.length > 0) {
        setItems(flattenedItems);
      }
      toast.success('Prefilled invoice details from SOW quotation!');
    } catch (err: any) {
      toast.error('Failed to prefill from quotation');
    }
  };

  // Prefill customer details and quotation if customer ID param is present
  useEffect(() => {
    if (customerIdParam && customers.length > 0) {
      const selectedCustomer = customers.find((c) => c.id === customerIdParam);
      if (selectedCustomer) {
        // If this customer has any quotations in the loaded list, auto-select it!
        const customerQuote = quotations.find((q) => q.customer?.id === customerIdParam);
        if (customerQuote) {
          handlePrefillQuotation(customerQuote.id);
        } else {
          setCustomerName(selectedCustomer.company || selectedCustomer.name);
          setContactPerson(selectedCustomer.name);

          const billing = selectedCustomer.addresses?.find((a) => a.type === 'billing');
          if (billing) {
            const addrStr = [
              billing.street,
              billing.city,
              billing.state,
              billing.zipCode,
              billing.country
            ].filter(Boolean).join(', ');
            setBillingAddress(addrStr);
          } else if (selectedCustomer.address) {
            setBillingAddress(selectedCustomer.address);
          }
        }
      }
    }
  }, [customerIdParam, customers, quotations]);

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const itemSub = item.quantity * item.unitPrice;
      const itemDisc = itemSub * (item.discount / 100);
      const itemTaxable = itemSub - itemDisc;
      const itemTax = itemTaxable * (item.tax / 100);

      subtotal += itemSub;
      discountTotal += itemDisc;
      taxTotal += itemTax;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;
    return { subtotal, discountTotal, taxTotal, grandTotal };
  };

  const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals();

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/v1/invoices', payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      if (data?.id) {
        navigate(`/invoices/${data.id}`);
      } else {
        navigate('/invoices');
      }
    },
    onError: (err: any) => {
      const apiError = err.response?.data?.error;
      if (apiError?.details) {
        const errorMsg = Object.entries(apiError.details)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join(' | ');
        toast.error(`Validation Failed: ${errorMsg}`);
      } else {
        toast.error(apiError?.message || 'Failed to save invoice');
      }
    },
  });

  const handleSave = () => {
    if (!customerName.trim()) {
      toast.error('Client Name is required');
      return;
    }
    if (items.length === 0 || items.every(i => !i.description.trim())) {
      toast.error('Please add at least one line item');
      return;
    }

    // Resolve or lookup customer name in loaded customer list, or let backend resolve it
    const matchedCustomer = customers.find(c => 
      c.id === customerIdParam ||
      c.name.toLowerCase() === customerName.toLowerCase() ||
      (c.company && c.company.toLowerCase() === customerName.toLowerCase())
    );

    const payload = {
      quotationId: selectedQuoteId || undefined,
      customerId: matchedCustomer ? matchedCustomer.id : undefined,
      customerName: matchedCustomer ? undefined : customerName, // backend support
      currency,
      paymentTerms: `${paymentTerms} | Bank: ${bankDetails}`,
      issueDate: issueDate ? new Date(issueDate).toISOString() : new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      items: items.map(it => ({
        description: it.description,
        quantity: Number(it.quantity),
        unit: it.unit,
        unitPrice: Number(it.unitPrice),
        discount: Number(it.discount),
        tax: Number(it.tax),
      }))
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumbs & Title */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-md">
        <div className="space-y-1">
          <nav className="flex items-center text-xs text-secondary gap-xs">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/invoices')}>Invoices</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">New Invoice</span>
          </nav>
          <h2 className="font-page-title text-page-title text-on-surface">Create New Invoice</h2>
        </div>
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-xs text-secondary hover:text-primary transition-all font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Cancel</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-gutter items-start">
        {/* Left Column: Form Blocks */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          
          {/* Prefill from SOW select block */}
          <section className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-md">
            <div className="space-y-1">
              <h3 className="font-card-title text-sm font-bold text-on-surface flex items-center gap-xs">
                <FileText className="text-primary" size={18} />
                <span>Auto-fill from SOW Proposal</span>
              </h3>
              <p className="text-xs text-secondary">Populate client metadata, billing details, and SOW items dynamically.</p>
            </div>
            <select
              className="w-full md:w-72 h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none"
              value={selectedQuoteId}
              onChange={(e) => handlePrefillQuotation(e.target.value)}
            >
              <option value="">Choose a Quotation...</option>
              {quotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quotationNumber} - {q.projectName}
                </option>
              ))}
            </select>
          </section>

          {/* Date Information Block */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm space-y-sm">
              <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">ISSUE DATE</label>
              <input 
                className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none" 
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm space-y-sm">
              <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">DUE DATE</label>
              <input 
                className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none" 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </section>

          {/* Customer Information Block */}
          <section className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm space-y-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-primary" size={18} />
              <h3 className="font-card-title text-card-title">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="space-y-sm">
                <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">CLIENT NAME</label>
                <input 
                  className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none" 
                  placeholder="Acme Corp Industries" 
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-sm">
                <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">CONTACT PERSON</label>
                <input 
                  className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none" 
                  placeholder="e.g. Sarah Jenkins" 
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div className="space-y-sm md:col-span-2">
                <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">BILLING ADDRESS</label>
                <textarea 
                  className="w-full p-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all resize-none text-on-surface outline-none" 
                  placeholder="Street address, City, State, ZIP..." 
                  rows={3}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>

              <div className="space-y-sm">
                <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">CURRENCY</label>
                <select 
                  className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
          </section>

          {/* Line Items Table */}
          <section className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
              <h3 className="font-card-title text-card-title flex items-center gap-xs">
                <span>Line Items</span>
              </h3>
              <button 
                type="button"
                onClick={() => setItems([...items, { description: '', quantity: 1, unit: 'units', unitPrice: 0, discount: 0, tax: 0 }])}
                className="flex items-center gap-xs px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-outline-variant text-secondary font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-lg py-3 w-1/2">Item & Description</th>
                    <th className="px-md py-3 w-16 text-center">Qty</th>
                    <th className="px-md py-3 w-28 text-right">Unit Price</th>
                    <th className="px-md py-3 w-20 text-center">Tax (%)</th>
                    <th className="px-lg py-3 text-right w-28">Total</th>
                    <th className="px-md py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                  {items.map((it, idx) => {
                    const rowTotal = it.quantity * it.unitPrice * (1 - (it.discount / 100)) * (1 + (it.tax / 100));
                    return (
                      <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-lg py-3">
                          <input 
                            className="w-full border-none bg-transparent p-0 font-body-md font-semibold text-on-surface focus:ring-0 outline-none placeholder:text-secondary/40"
                            placeholder="Item Title..."
                            type="text" 
                            value={it.description}
                            onChange={(e) => {
                              const newItems = [...items];
                              if (newItems[idx]) {
                                newItems[idx].description = e.target.value;
                                setItems(newItems);
                              }
                            }}
                          />
                        </td>
                        <td className="px-md py-3 text-center">
                          <input 
                            className="w-full border-none bg-transparent p-0 font-data-mono text-on-surface text-center focus:ring-0 outline-none"
                            type="number" 
                            min="1"
                            value={it.quantity}
                            onChange={(e) => {
                              const newItems = [...items];
                              if (newItems[idx]) {
                                newItems[idx].quantity = Number(e.target.value);
                                setItems(newItems);
                              }
                            }}
                          />
                        </td>
                        <td className="px-md py-3 text-right">
                          <div className="flex items-center justify-end font-data-mono gap-0.5">
                            <span>₹</span>
                            <input 
                              className="w-16 border-none bg-transparent p-0 text-right text-on-surface focus:ring-0 outline-none"
                              type="number" 
                              min="0"
                              value={it.unitPrice}
                              onChange={(e) => {
                                const newItems = [...items];
                                if (newItems[idx]) {
                                  newItems[idx].unitPrice = Number(e.target.value);
                                  setItems(newItems);
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-md py-3 text-center">
                          <input 
                            className="w-12 border-none bg-transparent p-0 font-data-mono text-center text-on-surface focus:ring-0 outline-none"
                            type="number" 
                            min="0"
                            max="100"
                            value={it.tax}
                            onChange={(e) => {
                              const newItems = [...items];
                              if (newItems[idx]) {
                                newItems[idx].tax = Number(e.target.value);
                                setItems(newItems);
                              }
                            }}
                          />
                        </td>
                        <td className="px-lg py-3 text-right font-data-mono font-bold text-on-surface">
                          ₹{rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-md py-3 text-center">
                          <button 
                            type="button"
                            onClick={() => setItems(items.filter((_, i) => i !== idx))}
                            className="text-secondary/60 hover:text-error transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment Terms & Bank Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm space-y-sm">
              <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">Payment Terms</label>
              <select 
                className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none mb-2"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="Net 30">Net 30 (Due in 30 days)</option>
                <option value="Net 15">Net 15 (Due in 15 days)</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
              <p className="text-[11px] text-secondary italic">Late payments may incur a 1.5% monthly surcharge.</p>
            </div>

            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm space-y-sm">
              <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">Bank Account Details</label>
              <textarea 
                className="w-full p-md rounded-lg border border-outline-variant bg-white font-data-mono text-xs focus:border-primary transition-all resize-none text-on-surface outline-none" 
                rows={3}
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
              />
            </div>
          </section>

        </div>

        {/* Right Sidebar: Summary */}
        <div className="col-span-12 lg:col-span-4 sticky top-24 space-y-gutter">
          <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-lg space-y-lg">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-sm">
              <h3 className="font-card-title text-card-title">Invoice Summary</h3>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-bold">Draft</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary font-medium">Subtotal</span>
                <span className="font-data-mono font-semibold">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col gap-2 border-y border-outline-variant/30 py-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Sales Tax</span>
                  <span className="font-data-mono">₹{taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Discount</span>
                  <span className="font-data-mono text-error">-₹{discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-2">
                <div>
                  <span className="font-label-uppercase text-[10px] font-bold text-on-surface-variant tracking-wider block">Total Amount</span>
                  <span className="text-2xl font-bold text-primary leading-none tracking-tight">₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <span className="font-data-mono text-secondary text-xs uppercase font-bold">{currency}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-xs hover:bg-primary/95 transition-all active:scale-[0.98] shadow-soft cursor-pointer text-xs"
              >
                <span>Generate Invoice</span>
              </button>
              <button 
                onClick={() => navigate('/invoices')}
                className="w-full bg-white border border-outline-variant text-on-surface py-2.5 rounded-lg font-semibold flex items-center justify-center hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer text-xs"
              >
                <span>Cancel</span>
              </button>
            </div>

            <div className="border-t border-outline-variant pt-lg">
              <div className="flex items-start gap-2 bg-secondary-container/10 p-md rounded-lg border border-outline-variant/40">
                <Info size={16} className="text-secondary shrink-0 mt-0.5" />
                <p className="text-[11px] text-on-secondary-container leading-relaxed">
                  Generating this invoice will register a billing ledger record and link it to customer <strong>{customerName || 'N/A'}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
