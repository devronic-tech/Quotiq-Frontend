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
        /* =====================================================
           GLOBAL PAGE PROPERTIES (Must be at top-level)
           ===================================================== */
        @page {
          size: A4 portrait;
          margin: 0;
        }

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
          html, body {
            width: 210mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* ── 1. Nuke header completely (sticky header is 64px tall) ── */
          header,
          [class*="sticky"],
          [class*="h-16"],
          nav,
          aside {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* ── 2. Hide all UI chrome ── */
          body > :not(#root),
          .no-print, button,
          .chat-widget,
          [class*="chat"], [id*="chat"],
          [class*="floating"],
          iframe {
            display: none !important;
            visibility: hidden !important;
          }

          /* ── 3. Flatten and nuke positioning of all ancestors ── */
          #root, #root > div, main, main > div,
          .min-h-screen,
          .flex-col,
          .space-y-lg,
          .max-w-4xl,
          .mx-auto,
          .flex,
          [class*="p-layout"],
          [class*="layout"],
          div[style*="paddingLeft"],
          div[style*="padding-left"],
          div[style*="paddingTop"],
          div[style*="padding-top"] {
            display: block !important;
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            transform: none !important;
            filter: none !important;
          }

          /* ── 4. Kill Tailwind space-y-* child margin-top ── */
          [class*="space-y-"] > * + * {
            margin-top: 0 !important;
          }
          [class*="space-y-"] > * {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }

          /* ── 5. Kill any remaining padding utility classes ── */
          [class*="pb-"], [class*="pt-"], [class*="py-"],
          [class*="px-"], [class*="pl-"], [class*="pr-"] {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }

          body {
            background: white !important;
            color: #1a1a1a !important;
            font-family: "Times New Roman", Times, serif !important;
          }

          /*
           * ── 6. THE PRINT DOCUMENT ROOT ──
           * Positioned absolutely at top:0, left:0 relative to the body
           * so the background image starts exactly at the physical page top/left.
           */
          .print-doc-root {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background-image: url(/back.png) !important;
            background-size: 210mm 297mm !important;
            background-repeat: repeat-y !important;
            background-position: 0 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }

          /*
           * ── 7. Each contract-body: transparent flowing block ──
           * 40px inner padding per page section.
           */
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
            padding: 40px 40px !important;
            box-sizing: border-box !important;
          }

          /* Force each logical section to start on its own physical A4 page */
          .print-doc-root .contract-body + .contract-body {
            page-break-before: always !important;
            break-before: page !important;
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
      <div className="flex flex-col items-center print-doc-root">
        {isSocialMedia ? (
          /* ============================================================
             TEMPLATE A: SOCIAL MEDIA DEPARTMENT INVOICE
             ============================================================ */
          <div className="print-card contract-body shadow-soft">
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
                  <span>â€¢</span>
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
                    <span className="text-red-500">ðŸ“ž</span> 8530025346, 9158441435
                  </p>
                  <p className="flex items-center gap-xs text-[11px] font-sans">
                    <span className="text-blue-500">âœ‰</span> devronic.org@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================
             TEMPLATE B: TECHNICAL QUOTATION â€” SINGLE FLOWING DOCUMENT
             ============================================================ */
          <div className="print-card contract-body shadow-soft">
            {/* â”€â”€ LETTERHEAD HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              {/* Left: logo + company name + tagline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/nobglogo.png" alt="Devronic Logo" style={{ height: '56px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.04em', color: '#0d1a2e', fontFamily: '"Times New Roman", Times, serif', lineHeight: 1.15 }}>
                    DEVRONIC TECHNOLOGIES
                  </div>
                  <div style={{ fontSize: '10px', color: '#4a5568', fontStyle: 'italic', fontFamily: 'Georgia, serif', marginTop: '1px' }}>
                    Develop. Design. Deploy. Disrupt
                  </div>
                </div>
              </div>
              {/* Right: QUOTATION label */}
              <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '0.08em', color: '#0d1a2e', fontFamily: '"Times New Roman", Times, serif', textAlign: 'right', paddingTop: '8px' }}>
                QUOTATION
              </div>
            </div>

            {/* Address line */}
            <div style={{ fontSize: '11px', color: '#2d3748', fontFamily: 'Georgia, serif', lineHeight: 1.6, marginBottom: '4px' }}>
              Azad Chowk, Sadar Nagpur - 440001
            </div>
            <div style={{ fontSize: '11px', color: '#2d3748', fontFamily: 'Georgia, serif', marginBottom: '10px' }}>
              <strong>Email:</strong> devronic.org@gmail.com &nbsp;|&nbsp; <strong>Web:</strong> www.devronic.com
            </div>

            {/* Horizontal rule */}
            <div style={{ borderTop: '1.5px solid #1a202c', marginBottom: '14px' }} />

            {/* â”€â”€ INFO GRID TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Georgia, serif', marginBottom: '16px', tableLayout: 'fixed' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #4a5568', padding: '8px 12px', width: '50%', textAlign: 'center', verticalAlign: 'middle' }}>
                    Prepared For: <strong>{quotation.customer.name}</strong>
                  </td>
                  <td style={{ border: '1px solid #4a5568', padding: '8px 12px', width: '50%', textAlign: 'center', verticalAlign: 'middle' }}>
                    Date: <strong>{executionDate}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #4a5568', padding: '8px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                    Industry: <strong>{quotation.department?.name || 'Technology Services'}</strong>
                  </td>
                  <td style={{ border: '1px solid #4a5568', padding: '8px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                    Validity: <strong>15 Days from Issue</strong>
                  </td>
                </tr>
                {quotation.projectName && (
                  <tr>
                    <td colSpan={2} style={{ border: '1px solid #4a5568', padding: '8px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                      Project Name: <strong>{quotation.projectName}</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* â”€â”€ FLOWING CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                All sections use page-break-inside: avoid so that
                sentences are never cut mid-line across pages.
            â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div style={{ fontSize: '12px', fontFamily: 'Georgia, serif', color: '#1a202c', lineHeight: 1.7 }}>

              {/* Project Overview */}
              {quotation.description && (
                <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '3px' }}>Project Overview</div>
                  <div style={{ textAlign: 'justify' }}>{quotation.description}</div>
                </div>
              )}

              {/* Scope of Work & Deliverables */}
              {quotation.sections && quotation.sections.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    Scope of Work &amp; Deliverables
                  </div>

                  {quotation.sections.map((sec, secIdx) => {
                    const parts = sec.name.split('|||');
                    const moduleName = parts[0]?.trim() || sec.name;
                    const scopeText = parts[1]?.trim() || '';
                    const scopeLines = scopeText
                      ? scopeText.split('\n').map((l: string) => l.trim()).filter(Boolean)
                      : [];
                    const itemFeatures = sec.items.map((it: { description: string }) => {
                      const p = it.description.split(' - ');
                      return { title: p[0] || '', detail: p[1] || '' };
                    });

                    return (
                      <div key={sec.id || secIdx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, marginBottom: '3px' }}>
                          {secIdx + 1}. <strong>{moduleName}</strong>
                        </div>

                        {/* Scope lines */}
                        {scopeLines.length > 0 && (
                          <ul style={{ margin: '0 0 4px 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                            {scopeLines.map((line: string, li: number) => (
                              <li key={li} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '1px' }}>
                                {line.replace(/^[â€¢\-]\s*/, '')}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Item features */}
                        {itemFeatures.length > 0 && (
                          <ul style={{ margin: '0 0 4px 0', paddingLeft: scopeLines.length > 0 ? '36px' : '20px', listStyleType: scopeLines.length > 0 ? 'circle' : 'disc' }}>
                            {itemFeatures.map((feat: { title: string; detail: string }, fi: number) => (
                              <li key={fi} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '1px' }}>
                                {feat.detail ? (
                                  <><strong>{feat.title}</strong>: {feat.detail}</>
                                ) : feat.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Commercials & Financial Investment */}
              <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Commercials &amp; Financial Investment</div>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
                    Item Description: {quotation.projectType || 'End-to-End Platform Development'}
                  </li>
                  {duration && (
                    <li style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
                      Estimated Timeline: <strong>{duration}</strong>
                    </li>
                  )}
                  <li style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
                    Total Fixed Investment Amount (Net): <strong>{quotation.currency} {Number(quotation.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </li>
                </ul>
              </div>

              {/* Payment Milestone Schedule */}
              {quotation.paymentTerms ? (
                <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '3px' }}>Payment Milestone Schedule</div>
                  <div style={{ marginBottom: '4px' }}>
                    To ensure a smooth workflow and mutual commitment, the financial terms are structured around project milestones:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                    {(() => {
                      const parts = quotation.paymentTerms.split(',').map((s: string) => s.trim()).filter(Boolean);
                      const labels = ['Project Initiation Advance', 'Mid-Project Development', 'Final Delivery & Deployment'];
                      const total = Number(quotation.grandTotal);
                      return parts.map((pct: string, pi: number) => {
                        const num = parseFloat(pct);
                        const amt = isNaN(num) ? '' : `${quotation.currency} ${(total * num / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                        return (
                          <li key={pi} style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '4px' }}>
                            <strong>{labels[pi] || `Milestone ${pi + 1}`} ({isNaN(num) ? pct : `${num}%`})</strong>
                            {amt && (
                              <ul style={{ paddingLeft: '18px', margin: '2px 0', listStyleType: 'circle' }}>
                                <li>Amount: {amt}</li>
                              </ul>
                            )}
                          </li>
                        );
                      });
                    })()}
                  </ul>
                </div>
              ) : null}

              {/* Terms & Conditions */}
              <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '10px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Terms &amp; Conditions</div>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
                    <strong>Scope Adjustments:</strong> Any feature requests or functional modifications outside this specified document will be assessed and billed separately as an addendum.
                  </li>
                  <li style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
                    <strong>Content Provision:</strong> The client will provide all initial course copy, branding assets, and media files.
                  </li>
                  <li style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
                    <strong>Validity:</strong> This quotation remains valid for 15 days from the date of issue.
                  </li>
                  <li style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
                    <strong>Intellectual Property:</strong> Upon receipt of full payment, all custom source codes and designs shall transfer to the Client's complete ownership.
                  </li>
                  <li style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '2px' }}>
                    <strong>Warranty:</strong> A six (6) month post-launch warranty period. Bug fixes for implemented features resolved without additional charge.
                  </li>
                </ul>
              </div>

              {/* Closing & Signature */}
              <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '16px' }}>
                <div>Warm regards,</div>
                <div style={{ height: '48px', display: 'flex', alignItems: 'flex-end', marginTop: '4px' }}>
                  <div style={{ fontStyle: 'italic', fontSize: '20px', fontFamily: 'cursive', color: '#1a202c' }}>Aqtab Zafar</div>
                </div>
                <div style={{ fontWeight: 700 }}>Aqtab Zafar</div>
                <div>Director,</div>
                <div>Devronic Technologies</div>
              </div>

              {/* Project Acceptance */}
              <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', borderTop: '1px solid #a0aec0', paddingTop: '10px' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Project Acceptance</div>
                <div style={{ marginBottom: '4px' }}>
                  I, the undersigned, accept the scope, deliverables, and payment milestones detailed in this quotation.
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li>Signature: <span style={{ display: 'inline-block', width: '160px', borderBottom: '1px solid #1a202c', marginLeft: '4px' }}>&nbsp;</span></li>
                  <li>Date: <span style={{ display: 'inline-block', width: '140px', borderBottom: '1px solid #1a202c', marginLeft: '4px' }}>&nbsp;</span></li>
                </ul>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

