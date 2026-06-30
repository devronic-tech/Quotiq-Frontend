import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/shared/lib/axios';
import Card from '@/shared/components/ui/Card';
import { 
  ArrowLeft, 
  Printer, 
  User, 
  MapPin, 
  Calendar,
  Clock,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  discount: string;
  tax: string;
}

interface QuotationSection {
  id: string;
  name: string;
  items: QuotationItem[];
}

interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  address: string | null;
}

interface Department {
  id: string;
  name: string;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  projectType: string | null;
  description: string | null;
  status: string;
  currency: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  grandTotal: string;
  validUntil: string | null;
  paymentTerms: string | null;
  termsAndConditions: string | null;
  notes: string | null;
  createdAt: string;
  customer: Customer;
  department: Department | null;
  sections: QuotationSection[];
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

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldPrint = searchParams.get('print') === 'true';

  // Fetch single quotation details
  const { data: quotation, isLoading, error } = useQuery<Quotation>({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const { data } = await api.get(`/v1/quotations/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    let timer: number | undefined;
    if (quotation && shouldPrint) {
      timer = window.setTimeout(() => {
        window.print();
      }, 500);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [quotation, shouldPrint]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-on-surface-variant font-bold">Failed to load quotation details.</p>
        <button onClick={() => navigate('/quotations')} className="text-primary hover:underline">
          Go back to list
        </button>
      </div>
    );
  }

  // Parse contact person and billing address from notes
  const notesParts = quotation.notes ? quotation.notes.split(' | ') : [];
  const duration = notesParts[0] || '12 Weeks';
  const contactPerson = notesParts[1]?.replace('Contact: ', '') || '';
  const billingAddress = notesParts[2]?.replace('Address: ', '') || quotation.customer.address || '';

  const handlePrint = () => {
    window.print();
  };

  // Date Formatting for template
  const rawDate = new Date(quotation.createdAt);
  const executionDate = rawDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Calculate Due Date (+4 days to match the uploaded social-media invoice screenshot)
  const dueDateRaw = new Date(rawDate.getTime() + 4 * 24 * 60 * 60 * 1000);
  const dueDate = dueDateRaw.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Dynamic template routing based on department
  const deptName = (quotation.department?.name || '').toLowerCase();
  const isSocialMedia = deptName.includes('social') || deptName.includes('media');

  return (
    <div className="space-y-lg max-w-4xl mx-auto pb-xl">
      {/* Print Style Injections */}
      <style>{`
        @media print {
          @page {
            margin-top: 20px;
            margin-bottom: 20px;
            margin-left: 2cm;
            margin-right: 2cm;
          }
          aside, header, nav, .no-print, button, .chat-widget, [class*="chat"], [id*="chat"], [class*="floating"] {
            display: none !important;
          }
          div[style*="paddingLeft"], div[style*="padding-left"] {
            padding-left: 0 !important;
          }
          body {
            background-color: white !important;
            color: #1a1a1a !important;
            font-family: "Times New Roman", Times, serif !important;
            margin: 0 !important;
            padding-top: 20px !important;
            padding-bottom: 20px !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .table-header {
            background-color: #f1f5f9 !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-page-break {
            page-break-before: always !important;
            break-before: page !important;
            margin-top: 2.5cm !important; /* Spacious margin at the top of the new page */
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        
        .contract-body p, .contract-body li {
          font-family: "Times New Roman", Times, serif;
          line-height: 1.6;
          color: #333333;
        }
      `}</style>

      {/* ACTION BAR */}
      <div className="no-print flex items-center justify-between border-b border-outline-variant pb-md mb-lg">
        <button 
          onClick={() => navigate('/quotations')}
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

      {/* DOCUMENT PAGE SHEET */}
      <Card className="print-card border border-outline-variant bg-white p-12 rounded-xl shadow-soft space-y-xl text-on-surface contract-body">
        
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
                <p><strong>Client:</strong> {quotation.customer.name}</p>
                <p className="pt-2"><strong>Invoice Date:</strong> {executionDate}</p>
                <p><strong>Due Date:</strong> {dueDate}</p>
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
                {quotation.sections.map((sec, secIdx) => (
                  <tr key={sec.id || secIdx} className="border-b border-black">
                    <td className="py-3 px-md border-r border-black font-bold">{sec.name}</td>
                    <td className="py-3 px-md space-y-1">
                      {sec.items.map((item, itemIdx) => {
                        const descParts = item.description.split(' - ');
                        const title = descParts[0] || 'Deliverable';
                        const details = descParts[1] || '';
                        return (
                          <div key={item.id || itemIdx}>
                            <span>{title}</span>
                            {details && <span className="text-on-surface-variant font-sans font-medium text-[10px]"> ({details})</span>}
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-t border-black">
                  <td className="py-2.5 px-md border-r border-black font-bold text-[11px]">TOTAL AMOUNT PAYABLE</td>
                  <td className="py-2.5 px-md font-bold font-sans text-sm">
                    {Number(quotation.grandTotal).toLocaleString('en-IN')}/-
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
             TEMPLATE B: TECHNICAL DEPARTMENT SOFTWARE DEVELOPMENT CONTRACT
             ============================================================ */
          <div className="space-y-lg">
            {/* Top Header Block - centered logo and details */}
            <div className="pb-sm space-y-md text-center font-sans">
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

            {/* Contract Main Title */}
            <div className="text-center py-sm space-y-2">
              <h1 className="text-lg font-bold tracking-wider text-on-surface uppercase border-y border-outline-variant/80 py-2 leading-snug">
                SOFTWARE DEVELOPMENT AGREEMENT
              </h1>
              {quotation.projectName && (
                <h2 className="text-sm font-bold text-primary font-sans uppercase tracking-wide">
                  ({quotation.projectName})
                </h2>
              )}
              <p className="text-xs text-on-surface-variant font-medium">
                Agreement Number: <span className="font-bold text-on-surface">{quotation.quotationNumber}</span>
              </p>
            </div>

            {/* Execution Clause */}
            <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-md">
              <p className="text-xs leading-relaxed text-on-surface">
                This Software Development Agreement (<strong>“Agreement”</strong>) is executed on <span className="font-bold border-b border-on-surface pb-0.5 px-2">{executionDate}</span> by and between the parties:
              </p>
            </div>

            {/* BETWEEN parties columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg border-b border-outline-variant/40 pb-lg">
              <div className="space-y-xs">
                <h3 className="text-[10px] font-sans font-bold tracking-wider uppercase text-primary border-b border-primary/20 pb-0.5">
                  SERVICE PROVIDER
                </h3>
                <p className="font-bold text-sm text-on-surface">Devronic Technologies</p>
                <div className="text-xs space-y-1 text-on-surface-variant font-sans">
                  <p className="flex items-start gap-xs">
                    <MapPin size={12} className="text-secondary mt-0.5 shrink-0" />
                    <span>Address: Sadar Azad Chowk, Nagpur</span>
                  </p>
                  <p className="flex items-center gap-xs">
                    <Mail size={12} className="text-secondary shrink-0" />
                    <span>Email: devronic.org@gmail.com</span>
                  </p>
                  <p className="flex items-center gap-xs">
                    <Phone size={12} className="text-secondary shrink-0" />
                    <span>Phone: +91 8530025346 | +91 9158441435</span>
                  </p>
                </div>
              </div>

              <div className="space-y-xs">
                <h3 className="text-[10px] font-sans font-bold tracking-wider uppercase text-primary border-b border-primary/20 pb-0.5">
                  AND CLIENT
                </h3>
                <p className="font-bold text-sm text-on-surface">{quotation.customer.name}</p>
                <div className="text-xs space-y-1 text-on-surface-variant font-sans">
                  {billingAddress && (
                    <p className="flex items-start gap-xs">
                      <MapPin size={12} className="text-secondary mt-0.5 shrink-0" />
                      <span>Address: {billingAddress}</span>
                    </p>
                  )}
                  {quotation.customer.email && (
                    <p className="flex items-center gap-xs">
                      <Mail size={12} className="text-secondary shrink-0" />
                      <span>Email: {quotation.customer.email}</span>
                    </p>
                  )}
                  {(quotation.customer.phone || contactPerson) && (
                    <p className="flex items-center gap-xs">
                      <Phone size={12} className="text-secondary shrink-0" />
                      <span>Phone/Contact: {quotation.customer.phone || contactPerson}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 1. PURPOSE */}
            <div className="space-y-sm">
              <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface border-l-2 border-primary pl-xs">
                1. PURPOSE OF AGREEMENT
              </h2>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                The Client appoints Devronic Technologies to develop and host a <strong>{quotation.projectType || 'Custom Software Solution'}</strong>, strictly in accordance with the scope defined in this Agreement.
              </p>
              {quotation.description && (
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  {quotation.description}
                </p>
              )}
            </div>

            {/* 2. SOW */}
            <div className="space-y-sm">
              <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface border-l-2 border-primary pl-xs">
                2. DETAILED SCOPE OF WORK – MODULES / FEATURES
              </h2>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                The system shall support the following modules and features:
              </p>

              {quotation.sections.map((sec, secIdx) => {
                // Parse encoded scope description from section name
                const parts = sec.name.split('|||');
                const moduleName = parts[0]?.trim() || sec.name;
                const scopeText = parts[1]?.trim() || '';
                const scopeLines = scopeText
                  ? scopeText.split('\n').map(l => l.trim()).filter(Boolean)
                  : [];
                const itemFeatures = sec.items.map(it => it.description.split(' - ')).map(p => ({ title: p[0] || '', detail: p[1] || '' }));

                return (
                  <div key={sec.id || secIdx} className="pl-sm space-y-xs pt-1">
                    <h3 className="font-bold text-xs text-primary font-sans flex items-center gap-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Module {secIdx + 1}: {moduleName}</span>
                    </h3>

                    {/* Scope lines (from the scope textarea) */}
                    {scopeLines.length > 0 && (
                      <ul className="list-none pl-md space-y-1 text-xs text-on-surface-variant">
                        {scopeLines.map((line, li) => (
                          <li key={li} className="flex items-start gap-1.5">
                            <span className="text-primary mt-0.5 shrink-0">{line.startsWith('•') ? '' : '•'}</span>
                            <span>{line.replace(/^[•\-]\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Item features (from line items) */}
                    {itemFeatures.length > 0 && scopeLines.length === 0 && (
                      <ul className="list-disc pl-md space-y-1 text-xs text-on-surface-variant">
                        {itemFeatures.map((feat, fi) => (
                          <li key={fi}>
                            <strong>{feat.title}</strong>{feat.detail ? ` — ${feat.detail}` : ''}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* If both scope and items exist, show items as sub-features */}
                    {itemFeatures.length > 0 && scopeLines.length > 0 && (
                      <ul className="list-none pl-md mt-1 space-y-1 text-xs text-on-surface-variant/80">
                        {itemFeatures.map((feat, fi) => (
                          <li key={fi} className="flex items-start gap-1.5">
                            <span className="text-secondary/60 shrink-0">◦</span>
                            <span><strong>{feat.title}</strong>{feat.detail ? ` — ${feat.detail}` : ''}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3. COST & PAYMENTS */}
            <div className="space-y-sm mt-8">
              <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface border-l-2 border-primary pl-xs">
                3. PAYMENT TERMS
              </h2>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                The total development cost for the {quotation.projectName} as defined in the Scope of Work shall be:
              </p>
              <div className="bg-surface-container-low border border-outline-variant/60 rounded-lg p-md font-sans space-y-1">
                <p className="text-xs text-on-surface font-bold">
                  Total Project Cost: {quotation.currency} {Number(quotation.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-secondary font-bold italic">
                  ({numberToWords(Number(quotation.grandTotal), quotation.currency)})
                </p>
              </div>

              <table className="w-full border border-outline-variant text-left text-xs font-sans mt-sm print-table">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant">
                    <th className="py-2.5 px-md w-16 text-center border-r border-outline-variant/60">Sr.No</th>
                    <th className="py-2.5 px-md border-r border-outline-variant/60">Modules</th>
                    <th className="py-2.5 px-md w-36 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                  {quotation.sections.map((sec, idx) => {
                    // Parse module name (strip encoded scope description)
                    const displayName = sec.name.split('|||')[0]?.trim() || sec.name;
                    const secTotal = sec.items.reduce((sum, it) => sum + (it.quantity * Number(it.unitPrice)), 0);
                    return (
                      <tr key={sec.id || idx}>
                        <td className="py-2.5 px-md text-center border-r border-outline-variant/30 font-data-mono">{idx + 1}.</td>
                        <td className="py-2.5 px-md border-r border-outline-variant/30">{displayName}</td>
                        <td className="py-2.5 px-md text-right font-data-mono font-semibold">
                          {secTotal > 0 ? `${secTotal.toLocaleString('en-IN')}/-` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  {Number(quotation.discountTotal) > 0 && (
                    <tr className="bg-surface-container-low/40">
                      <td className="border-r border-outline-variant/30" />
                      <td className="py-2.5 px-md border-r border-outline-variant/30 text-right text-on-surface-variant font-bold">Discount:</td>
                      <td className="py-2.5 px-md text-right font-data-mono text-error font-bold">
                        -{Number(quotation.discountTotal).toLocaleString('en-IN')}/-
                      </td>
                    </tr>
                  )}
                  {Number(quotation.taxTotal) > 0 && (
                    <tr className="bg-surface-container-low/40">
                      <td className="border-r border-outline-variant/30" />
                      <td className="py-2.5 px-md border-r border-outline-variant/30 text-right text-on-surface-variant font-bold">GST / Tax:</td>
                      <td className="py-2.5 px-md text-right font-data-mono font-bold">
                        +{Number(quotation.taxTotal).toLocaleString('en-IN')}/-
                      </td>
                    </tr>
                  )}
                  <tr className="bg-surface-container-low font-bold border-t-2 border-outline-variant">
                    <td className="border-r border-outline-variant/30" />
                    <td className="py-2.5 px-md border-r border-outline-variant/30 text-right text-primary font-bold font-sans uppercase text-[10px]">Total:</td>
                    <td className="py-2.5 px-md text-right font-data-mono text-primary text-sm font-bold">
                      {Number(quotation.grandTotal).toLocaleString('en-IN')}/-
                    </td>
                  </tr>
                </tbody>
              </table>

              {quotation.paymentTerms && (
                <p className="text-xs leading-relaxed text-on-surface-variant font-sans pt-1">
                  * The client can pay the described amount based on the following schedule: Upfront Deposit (<strong>{quotation.paymentTerms.split(',')[0] || '30'}%</strong>), Mid-Project Milestone (<strong>{quotation.paymentTerms.split(',')[1] || '40'}%</strong>), and Final handover (<strong>{quotation.paymentTerms.split(',')[2] || '30'}%</strong>).
                </p>
              )}
            </div>

            {/* 4. COST DETAILS */}
            <div className="space-y-sm">
              <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface border-l-2 border-primary pl-xs">
                4. WHAT THE COST COVERS
              </h2>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                The total cost of <strong className="text-primary">₹{Number(quotation.grandTotal).toLocaleString('en-IN')}/-</strong> covers <strong>complete professional software development</strong>, not just basic coding. This includes:
              </p>
              <ol className="list-decimal pl-md space-y-2 text-xs text-on-surface-variant">
                <li><strong>Built to Handle Growth</strong> — The app is designed so that as your business grows and more users join, it continues to run smoothly without slowing down or crashing.</li>
                <li><strong>Security</strong> — Your data and your clients' data are protected using industry-standard security practices, including secure login systems, verified access controls, and encrypted communications.</li>
                <li><strong>Server Setup & Deployment</strong> — Setting up and configuring the live server so your app runs reliably 24/7 on the internet with proper security certificates.</li>
                <li><strong>Clean, Maintainable Code</strong> — The code is written in an organized, professional manner so that future updates, new features, or bug fixes can be done efficiently without rebuilding everything from scratch.</li>
                <li><strong>Full Documentation & Code Handover</strong> — Complete technical documentation of the app's architecture, database structure, and workflows shall be provided so that if at any point the Client wishes to discontinue the engagement with Devronic Technologies, any other development agency or developer can understand, maintain, and extend the application independently. However, source code and documentation for each module/phase shall be released only upon receipt of full payment for that respective module/phase.</li>
              </ol>
            </div>

            {/* 5. TIMELINES */}
            <div className="space-y-sm">
              <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface border-l-2 border-primary pl-xs">
                5. TIME DURATION
              </h2>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                A Total of <strong>{duration}</strong> would be required to complete the development of this project.
              </p>

              <table className="w-full border border-outline-variant text-left text-xs font-sans mt-sm print-table">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant">
                    <th className="py-2.5 px-md w-16 text-center border-r border-outline-variant/60">Sr.No</th>
                    <th className="py-2.5 px-md border-r border-outline-variant/60">SOW Module / Feature List</th>
                    <th className="py-2.5 px-md w-36 text-center">Estimated Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface">
                  {quotation.sections.map((sec, idx) => {
                    const displayName = sec.name.split('|||')[0]?.trim() || sec.name;
                    return (
                      <tr key={sec.id || idx}>
                        <td className="py-2.5 px-md text-center border-r border-outline-variant/30 font-data-mono">{idx + 1}.</td>
                        <td className="py-2.5 px-md border-r border-outline-variant/30">{displayName}</td>
                        <td className="py-2.5 px-md text-center font-semibold">
                          {Math.ceil(Number(duration.split(' ')[0] || 12) / quotation.sections.length)} {duration.split(' ')[1] || 'Weeks'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-surface-container-low font-bold">
                    <td className="border-r border-outline-variant/30" />
                    <td className="py-2.5 px-md border-r border-outline-variant/30 text-right text-primary font-bold font-sans uppercase text-[10px]">Total Duration:</td>
                    <td className="py-2.5 px-md text-center text-primary font-bold border-t border-outline-variant/80">
                      {duration}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Standard Legal Clauses */}
            <div className="space-y-md pt-xs">
              <div className="space-y-xs">
                <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface">6. CHANGE REQUEST POLICY</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Any feature, functionality, or requirement not explicitly defined within the agreed Scope of Work (SOW) shall be considered out of scope. Change requests shall be estimated separately and commenced only upon written approval.
                </p>
              </div>

              <div className="space-y-xs">
                <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface">7. INTELLECTUAL PROPERTY</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Upon receipt of full payment, all custom source codes and designs developed specifically for this project shall be handed over and transition to the Client's complete ownership.
                </p>
              </div>

              <div className="space-y-xs">
                <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface">8. WARRANTY & SUPPORT</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  The Company provides a six (6) month post-launch warranty period starting from the official production deployment date. Bug fixes related to implemented features shall be resolved without additional charges during this period.
                </p>
              </div>

              <div className="space-y-xs">
                <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface">9. LIMITATION OF LIABILITY</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  The Company's total liability under this Agreement shall not exceed the total fees paid by the Client under this Agreement. The Company shall not be liable for any indirect or consequential damages.
                </p>
              </div>

              <div className="space-y-xs">
                <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface">10. GOVERNING LAW & JURISDICTION</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  This Agreement shall be governed and interpreted in accordance with the laws of India. Any disputes arising under or relating to this Agreement shall be subject to the exclusive jurisdiction of courts located in Nagpur, Maharashtra.
                </p>
              </div>
            </div>

            {/* ACCEPTANCE & SIGNATURES Block */}
            <div className="border-t-2 border-outline-variant pt-lg space-y-md font-sans print-avoid-break">
              <h2 className="text-xs font-bold font-sans uppercase tracking-wider text-on-surface text-center mb-md">
                ACCEPTANCE & SIGNATURES
              </h2>
              
              <div className="grid grid-cols-2 gap-xl pt-sm">
                <div className="space-y-sm text-left">
                  <p className="text-xs font-bold text-on-surface">For Devronic Technologies</p>
                  <div className="h-16 border-b border-outline-variant/60 flex items-end">
                    <span className="text-[10px] text-secondary italic pb-1">Signature & Stamp</span>
                  </div>
                  <div className="space-y-0.5 text-xs text-on-surface-variant font-sans">
                    <p>Name: <span className="font-semibold text-on-surface">Aqtab Zafar</span></p>
                    <p>Designation: <span className="font-semibold text-on-surface">Director</span></p>
                    <p>Date: <span className="font-semibold text-on-surface">{executionDate}</span></p>
                  </div>
                </div>

                <div className="space-y-sm text-left">
                  <p className="text-xs font-bold text-on-surface">For Client ({quotation.customer.name})</p>
                  <div className="h-16 border-b border-outline-variant/60 flex items-end">
                    <span className="text-[10px] text-secondary italic pb-1">Signature & Stamp</span>
                  </div>
                  <div className="space-y-0.5 text-xs text-on-surface-variant font-sans">
                    <p>Name: <span className="font-semibold text-on-surface">{contactPerson || 'Authorized Signatory'}</span></p>
                    <p>Designation: <span className="font-semibold text-on-surface">{quotation.department?.name || 'Director'}</span></p>
                    <p>Date: <span className="font-semibold text-on-surface">{executionDate}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer Note */}
            <div className="border-t border-outline-variant/30 pt-md text-center text-[10px] text-on-surface-variant font-sans">
              <p>Thank you for your business. For questions regarding this proposal, contact dev@quotaflow.com.</p>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
}
