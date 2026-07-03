import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/shared/lib/axios';
import { 
  ArrowLeft, 
  Printer, 
  MapPin, 
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  address: string | null;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  discount: string;
  tax: string;
}

interface Payment {
  id: string;
  amount: string;
  paymentDate: string;
  paymentMethod: string;
  transactionReference: string | null;
  notes: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  notes: string | null;
  department: Department | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: string;
  status: 'draft' | 'unpaid' | 'partially_paid' | 'paid' | 'overdue' | 'voided';
  grandTotal: string;
  amountPaid: string;
  discountTotal: string;
  taxTotal: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string | null;
  createdAt: string;
  customer: Customer;
  quotation: Quotation | null;
  items: InvoiceItem[];
  payments: Payment[];
}

// Helper to convert numbers to words in Indian/Western styles
function numberToWords(num: number, currency: string = 'INR'): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWordsIndian = (n: number): string => {
    if (n < 20) return a[n] || '';
    if (n < 100) return (b[Math.floor(n / 10)] || '') + (n % 10 ? ' ' + (a[n % 10] || '') : '');
    if (n < 1000) return (a[Math.floor(n / 100)] || '') + ' Hundred' + (n % 100 ? ' and ' + numToWordsIndian(n % 100) : '');
    if (n < 100000) return numToWordsIndian(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWordsIndian(n % 1000) : '');
    if (n < 10000000) return numToWordsIndian(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWordsIndian(n % 100000) : '');
    return numToWordsIndian(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWordsIndian(n % 10000000) : '');
  };

  const numToWordsWestern = (n: number): string => {
    if (n < 20) return a[n] || '';
    if (n < 100) return (b[Math.floor(n / 10)] || '') + (n % 10 ? ' ' + (a[n % 10] || '') : '');
    if (n < 1000) return (a[Math.floor(n / 100)] || '') + ' Hundred' + (n % 100 ? ' and ' + numToWordsWestern(n % 100) : '');
    if (n < 1000000) return numToWordsWestern(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWordsWestern(n % 1000) : '');
    return numToWordsWestern(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 ? ' ' + numToWordsWestern(n % 1000000) : '');
  };

  if (num === 0) return 'Zero';
  const val = Math.floor(num);
  return (currency === 'INR' ? numToWordsIndian(val) : numToWordsWestern(val)) + ' Only';
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === 'true';

  // Fetch Invoice Details
  const { data: invoice, isLoading, error } = useQuery<Invoice>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data } = await api.get(`/v1/invoices/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    let timer: number | undefined;
    if (invoice && shouldPrint) {
      timer = window.setTimeout(() => {
        window.print();
      }, 500);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [invoice, shouldPrint]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-on-surface-variant font-bold">Failed to load invoice details.</p>
        <button onClick={() => navigate('/invoices')} className="text-primary hover:underline">
          Go back to list
        </button>
      </div>
    );
  }

  // Parse contact person and billing address from notes if linked
  const notesParts = invoice.quotation?.notes ? invoice.quotation.notes.split(' | ') : [];
  const contactPerson = notesParts[1]?.replace('Contact: ', '') || '';
  const billingAddress = notesParts[2]?.replace('Address: ', '') || invoice.customer.address || '';

  const handlePrint = () => {
    window.print();
  };

  // Date Formatting for template
  const issueDateText = new Date(invoice.issueDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const dueDateText = new Date(invoice.dueDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Dynamic template routing based on department
  const deptName = (invoice.quotation?.department?.name || '').toLowerCase();
  const isSocialMedia = deptName.includes('social') || deptName.includes('media');

  return (
    <div className="space-y-lg max-w-4xl mx-auto pb-xl">
      {/* Print Style Injections */}
      <style>{`
        /* =====================================================
           SCREEN STYLES: Fixed A4 page preview boxes
           ===================================================== */
        @media screen {
          .contract-body {
            width: 210mm;
            height: 297mm;
            overflow: hidden;
            padding: 40px !important;
            background-image: url(/back.png) !important;
            background-size: 100% 100% !important;
            background-repeat: no-repeat !important;
            background-position: center !important;
            background-color: white;
            box-sizing: border-box;
            margin-bottom: 20px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.13);
          }
          
          .contract-body p, .contract-body li {
            font-family: "Times New Roman", Times, serif;
            line-height: 1.6;
            color: #333333;
          }
        }

        /* =====================================================
           PRINT STYLES: Flowing document with tiling background
           ===================================================== */
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          /* Hide sidebar, header, buttons, chatbots, iframes */
          body > :not(#root),
          aside, header, nav,
          .no-print, button,
          .chat-widget,
          [class*="chat"], [id*="chat"],
          [class*="floating"],
          iframe {
            display: none !important;
            visibility: hidden !important;
          }

          /* Flatten all layout wrappers */
          html, body, #root {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
          }

          /* Sidebar padding killer */
          main,
          .min-h-screen,
          .flex-col,
          .space-y-lg,
          .max-w-4xl,
          .mx-auto,
          .flex,
          [class*="layout"],
          div[style*="paddingLeft"],
          div[style*="padding-left"] {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          /* Kill Tailwind space-y-* child gap */
          [class*="space-y-"] > * {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }

          /* Remove any page-level padding that pushes content down */
          [class*="pb-"], [class*="pt-"], [class*="py-"] {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }

          body {
            background: white !important;
            color: #1a1a1a !important;
            font-family: "Times New Roman", Times, serif !important;
          }

          /* The print document root: 210mm wide, background tiles every 297mm */
          .print-doc-root {
            display: block !important;
            width: 210mm !important;
            margin: 0 !important;
            margin-top: 0 !important;
            padding: 0 !important;
            position: relative !important;
            top: 0 !important;
            background-image: url(/back.png) !important;
            background-size: 210mm 297mm !important;
            background-repeat: repeat-y !important;
            background-position: top left !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }

          /* Each section becomes a transparent flowing block with 40px padding */
          .print-doc-root .contract-body {
            display: block !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 40px !important;
            box-sizing: border-box !important;
          }

          .table-header {
            background-color: #f1f5f9 !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ACTION BAR */}
      <div className="no-print flex items-center justify-between border-b border-outline-variant pb-md mb-lg">
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center gap-xs text-secondary hover:text-primary transition-all font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>

        <div className="flex gap-sm">
          <button
            onClick={handlePrint}
            className="px-md h-11 bg-primary text-white font-body-sm rounded-lg shadow-soft hover:bg-primary/95 transition-all flex items-center gap-xs cursor-pointer font-bold"
          >
            <Printer size={18} />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* PAYMENT HISTORY CARD — hidden on print */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="no-print border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Payment History</span>
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                {invoice.payments.length} transaction{invoice.payments.length > 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Collected: <span style={{ fontWeight: 700, color: '#059669' }}>₹{Number(invoice.amountPaid).toLocaleString('en-IN')}</span>
              {' '}/ <span style={{ color: '#475569' }}>₹{Number(invoice.grandTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payments Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px' }}>
                <th style={{ padding: '10px 20px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px 20px', textAlign: 'left' }}>Method</th>
                <th style={{ padding: '10px 20px', textAlign: 'left' }}>Ref / Transaction ID</th>
                <th style={{ padding: '10px 20px', textAlign: 'left' }}>Notes</th>
                <th style={{ padding: '10px 20px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map((pmt, idx) => (
                <tr
                  key={pmt.id}
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                  }}
                >
                  <td style={{ padding: '10px 20px', color: '#475569', whiteSpace: 'nowrap' }}>
                    {new Date(pmt.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '10px 20px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', textTransform: 'capitalize' }}>
                      {pmt.paymentMethod?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '10px 20px', color: '#64748b', fontFamily: 'monospace', fontSize: '11px' }}>
                    {pmt.transactionReference || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 20px', color: '#94a3b8', fontSize: '11px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pmt.notes || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 700, color: '#059669', fontFamily: 'monospace' }}>
                    +₹{Number(pmt.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer summary row */}
            <tfoot>
              <tr style={{ borderTop: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <td colSpan={4} style={{ padding: '10px 20px', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Collected</td>
                <td style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 800, fontSize: '14px', color: '#059669', fontFamily: 'monospace' }}>
                  ₹{Number(invoice.amountPaid).toLocaleString('en-IN')}
                </td>
              </tr>
              {Number(invoice.grandTotal) - Number(invoice.amountPaid) > 0 && (
                <tr style={{ backgroundColor: '#fff7ed' }}>
                  <td colSpan={4} style={{ padding: '8px 20px', fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remaining Balance</td>
                  <td style={{ padding: '8px 20px', textAlign: 'right', fontWeight: 800, fontSize: '13px', color: '#b45309', fontFamily: 'monospace' }}>
                    ₹{(Number(invoice.grandTotal) - Number(invoice.amountPaid)).toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      )}

      {/* DOCUMENT PAGE SHEET */}
      <div className="flex flex-col items-center print-doc-root">
        <div className="contract-body">
        
        {isSocialMedia ? (
          /* ============================================================
             TEMPLATE A: SOCIAL MEDIA DEPARTMENT INVOICE
             ============================================================ */
          <div className="space-y-lg">
            {/* Centered Brand Header block */}
            <div className="text-center space-y-1">
              <img src="/devronic.png" alt="Devronic Logo" className="h-16 mx-auto object-contain mb-2" />
              <h1 className="text-xl font-bold uppercase tracking-wide" style={{ color: '#101010', fontFamily: 'Times New Roman' }}>
                DEVRONIC TECHNOLOGIES
              </h1>
              <p className="text-xs font-bold font-serif uppercase tracking-tight" style={{ color: '#202020' }}>
                SADAR AZAD CHOWK, NAGPUR-440001.
              </p>
              <div className="flex justify-center items-center gap-2 text-xs font-sans text-on-surface-variant pt-0.5">
                <span><strong>Phone:</strong> 8530025346, 9158441435</span>
                <span>•</span>
                <span><strong>Website:</strong> <a href="https://www.devronic.com" className="underline text-blue-600">www.devronic.com</a></span>
              </div>
              <p className="text-xs font-sans text-on-surface-variant">
                <strong>Email:</strong> devronic.org@gmail.com
              </p>
              {/* Centered thick divider line */}
              <div className="border-b-2 border-black mt-3 mx-auto" />
            </div>

            {/* Document details */}
            <div className="space-y-md pt-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Times New Roman' }}>
                INVOICE
              </h2>

              <div className="space-y-1 text-xs" style={{ fontFamily: 'Times New Roman' }}>
                <p><strong>Client:</strong> {invoice.customer.name}</p>
                <p className="pt-2"><strong>Invoice Date:</strong> {issueDateText}</p>
                <p><strong>Due Date:</strong> {dueDateText}</p>
              </div>
            </div>

            {/* Structured double-column simple table */}
            <table className="w-full border-collapse border border-black text-xs" style={{ fontFamily: 'Times New Roman' }}>
              <thead>
                <tr className="border-b border-black bg-slate-50">
                  <th className="py-2.5 px-md border-r border-black font-bold text-left w-[35%]">Service Description</th>
                  <th className="py-2.5 px-md font-bold text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-on-surface">
                {invoice.items.map((item, itemIdx) => {
                  const descParts = item.description.split(' - ');
                  const title = descParts[0] || 'Deliverable';
                  const details = descParts[1] || '';
                  return (
                    <tr key={item.id || itemIdx} className="border-b border-black">
                      <td className="py-3 px-md border-r border-black font-bold">{title}</td>
                      <td className="py-3 px-md">
                        <span>{details}</span>
                        <span className="text-on-surface-variant font-sans font-medium text-[10px] ml-1">
                          (Qty: {item.quantity})
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-bold border-t border-black">
                  <td className="py-2.5 px-md border-r border-black font-bold text-[11px]">TOTAL AMOUNT PAYABLE</td>
                  <td className="py-2.5 px-md font-bold font-sans text-sm">
                    ₹{Number(invoice.grandTotal).toLocaleString('en-IN')}/-
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Dynamic Banking details block and footer */}
            <div className="space-y-md text-xs pt-md" style={{ fontFamily: 'Times New Roman' }}>
              <p>Kindly process the payment using the bank details provided below:</p>
              
              <div className="pl-md space-y-0.5 text-on-surface-variant font-medium">
                <p>Account Name: Sheikh Arbab Munir Sheikh</p>
                <p>Bank Name: State Bank of India</p>
                <p>Account Number: 41463051431</p>
                <p>IFSC Code: SBIN0011519</p>
                <p>Branch: Civil Lines Nagpur</p>
              </div>

              <p className="pt-sm">Once the payment has been completed, kindly share the transaction reference/UTR number for our records.</p>
              <p>Thank you for your trust and continued support. We look forward to continuing our association.</p>
              
              <p className="pt-xs">Best Regards,</p>
              
              <div className="space-y-1">
                <p className="font-bold">Devronic Technologies</p>
                <p className="flex items-center gap-xs text-[11px] font-sans">
                  <span className="text-red-500">📞</span> 8530025346, 9158441435
                </p>
                <p className="flex items-center gap-xs text-[11px] font-sans">
                  <span className="text-blue-500">✉</span> devronic.org@gmail.com
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================
             TEMPLATE B: TECHNICAL DEPARTMENT INVOICE
             ============================================================ */
          <div className="space-y-lg">
            {/* Top Header Block - centered logo and details */}
            <div className="pb-sm space-y-md text-center font-sans ">
              <div className="flex flex-col items-center justify-center space-y-2">
                <img src="/devronic.png" alt="Devronic Logo" className="h-16 object-contain" />
                <h2 className="text-xl font-extrabold tracking-wide text-slate-900" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                  Devronic Technologies
                </h2>
              </div>
              <div className="space-y-1 text-xs text-slate-700 leading-normal font-sans">
                <p>
                  <strong>Phone:</strong> Aqtab Zafar : +91 85300 25346 | Sheikh Arbab : +91 91584 41435
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:devronic.org@gmail.com" className="text-blue-600 underline">devronic.org@gmail.com</a> | <strong>Website:</strong> <a href="https://www.devronic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">www.devronic.com</a>
                </p>
                <p>
                  <strong>Address:</strong> Sadar Azad Chowk, Nagpur
                </p>
              </div>
            </div>

            {/* Invoice Main Title */}
            <div className="text-center py-sm space-y-2">
              <h1 className="text-lg font-bold tracking-wider text-on-surface uppercase border-y border-outline-variant/80 py-2 leading-snug font-sans">
                BILLING INVOICE
              </h1>
              <p className="text-xs text-on-surface-variant font-medium">
                Invoice Number: <span className="font-bold text-on-surface">{invoice.invoiceNumber}</span>
              </p>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-2 gap-lg border-b border-outline-variant/40 pb-lg">
              <div className="space-y-xs">
                <h3 className="text-[10px] font-sans font-bold tracking-wider uppercase text-primary border-b border-primary/20 pb-0.5">
                  FROM
                </h3>
                <p className="font-bold text-sm text-on-surface">Devronic Technologies</p>
                <div className="text-xs space-y-1 text-on-surface-variant font-sans">
                  <p>Sadar Azad Chowk, Nagpur</p>
                  <p>Email: devronic.org@gmail.com</p>
                  <p>Phone: +91 8530025346</p>
                </div>
              </div>

              <div className="space-y-xs">
                <h3 className="text-[10px] font-sans font-bold tracking-wider uppercase text-primary border-b border-primary/20 pb-0.5">
                  TO CLIENT
                </h3>
                <p className="font-bold text-sm text-on-surface">{invoice.customer.name}</p>
                <div className="text-xs space-y-1 text-on-surface-variant font-sans">
                  {billingAddress && <p>Address: {billingAddress}</p>}
                  {invoice.customer.email && <p>Email: {invoice.customer.email}</p>}
                  {contactPerson && <p>Contact Person: {contactPerson}</p>}
                </div>
              </div>
            </div>

            {/* Dates details */}
            <div className="grid grid-cols-2 gap-lg text-xs font-sans bg-slate-50 p-3 rounded-lg border border-outline-variant/50">
              <div>
                <span className="text-secondary font-semibold">Invoice Issue Date:</span>
                <span className="ml-2 font-bold text-on-surface">{issueDateText}</span>
              </div>
              <div>
                <span className="text-secondary font-semibold">Payment Due Date:</span>
                <span className="ml-2 font-bold text-on-surface">{dueDateText}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="space-y-sm">
              <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface">
                Line Item Details
              </h3>
              
              <table className="w-full border border-outline-variant text-left text-xs font-sans mt-sm print-table">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant">
                    <th className="py-2.5 px-md w-12 text-center border-r border-outline-variant/60">Sr.No</th>
                    <th className="py-2.5 px-md border-r border-outline-variant/60">Description</th>
                    <th className="py-2.5 px-md w-16 text-center border-r border-outline-variant/60">Qty</th>
                    <th className="py-2.5 px-md w-28 text-right border-r border-outline-variant/60">Unit Price</th>
                    <th className="py-2.5 px-md w-24 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                  {invoice.items.map((it, idx) => {
                    const rowSubtotal = it.quantity * Number(it.unitPrice);
                    return (
                      <tr key={it.id || idx}>
                        <td className="py-2.5 px-md text-center border-r border-outline-variant/30 font-data-mono">{idx + 1}.</td>
                        <td className="py-2.5 px-md border-r border-outline-variant/30">{it.description}</td>
                        <td className="py-2.5 px-md text-center border-r border-outline-variant/30 font-data-mono">{it.quantity}</td>
                        <td className="py-2.5 px-md text-right border-r border-outline-variant/30 font-data-mono">
                          ₹{Number(it.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-md text-right font-data-mono">
                          ₹{rowSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                  {Number(invoice.discountTotal) > 0 && (
                    <tr className="bg-surface-container-low/40">
                      <td colSpan={3} className="border-r border-outline-variant/30" />
                      <td className="py-2.5 px-md border-r border-outline-variant/30 text-right text-on-surface-variant font-bold">Discount:</td>
                      <td className="py-2.5 px-md text-right font-data-mono text-error font-bold">
                        -₹{Number(invoice.discountTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {Number(invoice.taxTotal) > 0 && (
                    <tr className="bg-surface-container-low/40">
                      <td colSpan={3} className="border-r border-outline-variant/30" />
                      <td className="py-2.5 px-md border-r border-outline-variant/30 text-right text-on-surface-variant font-bold">Sales Tax:</td>
                      <td className="py-2.5 px-md text-right font-data-mono font-bold">
                        +₹{Number(invoice.taxTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-surface-container-low font-bold">
                    <td colSpan={3} className="border-r border-outline-variant/30" />
                    <td className="py-2.5 px-md border-r border-outline-variant/30 text-right text-primary font-bold font-sans uppercase text-[10px]">Total Amount:</td>
                    <td className="py-2.5 px-md text-right font-data-mono text-primary text-sm font-bold border-t border-outline-variant/80">
                      ₹{Number(invoice.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Terms & Bank details clause */}
            <div className="space-y-sm pt-xs font-sans text-xs print-page-break">
              <h4 className="font-bold uppercase tracking-wider text-on-surface">Payment Methods & Directions</h4>
              <p className="text-on-surface-variant leading-relaxed">
                Please transfer the required funds using the details outlined below:
              </p>
              
              <div className="bg-slate-50 p-md rounded-lg border border-outline-variant/50 font-data-mono whitespace-pre-line text-[11px] leading-relaxed">
                {invoice.paymentTerms || 'Swift: QTFBNKUS66\nIBAN: US82 3904 2948 2903\nBank: Silicon Valley Trust'}
              </div>
            </div>

            {/* Bilateral Acceptance Signatures */}
            <div className="border-t-2 border-outline-variant pt-lg space-y-md font-sans print-avoid-break">
              <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface text-center mb-md">
                AUTHORIZATION SIGNATURES
              </h2>
              
              <div className="grid grid-cols-2 gap-xl pt-sm">
                <div className="space-y-sm text-left">
                  <p className="text-xs font-bold text-on-surface">Authorized Signatory (Devronic Technologies)</p>
                  <div className="h-16 border-b border-outline-variant/60 flex items-end">
                    <span className="text-[10px] text-secondary italic pb-1">Signature & Stamp</span>
                  </div>
                  <div className="space-y-0.5 text-xs text-on-surface-variant font-sans">
                    <p>Name: <span className="font-semibold text-on-surface">Aqtab Zafar</span></p>
                    <p>Designation: <span className="font-semibold text-on-surface">Director</span></p>
                  </div>
                </div>

                <div className="space-y-sm text-left">
                  <p className="text-xs font-bold text-on-surface">Client Handover Receipt ({invoice.customer.name})</p>
                  <div className="h-16 border-b border-outline-variant/60 flex items-end">
                    <span className="text-[10px] text-secondary italic pb-1">Signature & Stamp</span>
                  </div>
                  <div className="space-y-0.5 text-xs text-on-surface-variant font-sans">
                    <p>Name: <span className="font-semibold text-on-surface">{contactPerson || 'Authorized Recipient'}</span></p>
                    <p>Designation: <span className="font-semibold text-on-surface">Representative</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer Note */}
            <div className="border-t border-outline-variant/30 pt-md text-center text-[10px] text-on-surface-variant font-sans">
              <p>For questions or logs concerning this invoice ledger statement, contact billing@devronic.com.</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
