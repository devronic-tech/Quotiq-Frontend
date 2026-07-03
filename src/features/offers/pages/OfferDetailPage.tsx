import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/shared/lib/axios';
import Button from '@/shared/components/ui/Button';
import {
  ArrowLeft,
  Download,
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building,
  Calendar,
  Briefcase
} from 'lucide-react';
import { useEffect } from 'react';

interface OrgAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Organization {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: OrgAddress | null;
}

interface OfferLetter {
  id: string;
  offerNumber: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  candidateAddress: string;
  jobTitle: string;
  department: 'technical' | 'social_media';
  jobType: 'full_time' | 'internship' | 'freelance';
  workplaceType: 'remote' | 'onsite' | 'hybrid';
  salaryPerMonth: string;
  joiningDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  notes: string | null;
  letterContent: string;
  createdAt: string;
}

export default function OfferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPrintMode = searchParams.get('print') === 'true';

  // Fetch Offer Letter Details
  const { data: offer, isLoading: isOfferLoading } = useQuery<OfferLetter>({
    queryKey: ['offers', id],
    queryFn: async () => {
      const { data } = await api.get(`/v1/offers/${id}`);
      return data.data;
    },
  });

  // Fetch Org Details
  const { data: org, isLoading: isOrgLoading } = useQuery<Organization>({
    queryKey: ['organization'],
    queryFn: async () => {
      const { data } = await api.get('/v1/organization');
      return data.data;
    },
  });

  // Trigger print if param ?print=true is present
  useEffect(() => {
    let timer: any;
    if (offer && org && isPrintMode) {
      timer = setTimeout(() => {
        window.print();
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [offer, org, isPrintMode]);

  if (isOfferLoading || isOrgLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="text-center py-20">
        <h3 className="text-sm font-bold text-on-surface">Offer Letter not found</h3>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/offers')}>
          Back to List
        </Button>
      </div>
    );
  }

  const creationDate = new Date(offer.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const joiningDateFormatted = new Date(offer.joiningDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Address line construction helper
  const renderOrgAddress = () => {
    if (!org?.address) return 'Sadar Azad Chowk, Nagpur, Maharashtra, India';
    const { street, city, state, zipCode, country } = org.address;
    return [street, city, state, zipCode, country].filter(Boolean).join(', ');
  };

  return (
    <div className="max-w-[210mm] mx-auto space-y-6 pb-12">
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
          .print\\:hidden, button,
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
          .space-y-6,
          .max-w-\\[210mm\\],
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

          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Action Bar (hidden in Print Mode) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
        <div className="flex items-center gap-xs">
          <button
            onClick={() => navigate('/offers')}
            className="text-secondary hover:text-primary flex items-center gap-1.5 text-body-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Offer Letters
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/offers/new?id=${offer.id}`)}
            className="h-10 cursor-pointer"
          >
            Edit Offer
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => window.print()}
            className="h-10 cursor-pointer"
          >
            Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center print-doc-root">
        <div className="contract-body bg-white border border-slate-200 rounded-xl shadow-sm text-slate-800 font-serif leading-relaxed text-xs">
        
        {/* Top Centered Corporate Logo */}
        <div className="flex flex-col items-center justify-center border-b-2 border-primary/20 pb-6 mb-8">
          <img src="/nobglogo.png" alt="Devronic Logo" className="h-12 object-contain mb-2" />
          <h1 className="text-base font-bold font-sans tracking-wide uppercase text-primary">
            {org?.name || 'Devronic Solutions'}
          </h1>
          <p className="text-[10px] text-slate-500 font-sans tracking-wider mt-0.5">
            {org?.website || 'www.devronic.org'} | {org?.email || 'devronic.org@gmail.com'}
          </p>
        </div>

        {/* Letter Metadata */}
        <div className="flex justify-between items-start mb-6 font-sans">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Offer Reference</p>
            <p className="font-bold text-primary font-mono text-xs">{offer.offerNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Date of Issue</p>
            <p className="font-semibold text-xs">{creationDate}</p>
          </div>
        </div>

        {/* Sender & Recipient addresses */}
        <div className="grid grid-cols-2 gap-8 mb-8 font-sans">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-bold text-primary tracking-wide border-b border-primary/10 pb-0.5 mb-1.5">
              ISSUED BY
            </p>
            <p className="font-bold text-xs text-slate-900">{org?.name || 'Devronic Solutions'}</p>
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <p className="flex items-start gap-1">
                <MapPin size={10} className="text-slate-400 mt-0.5 shrink-0" />
                <span>{renderOrgAddress()}</span>
              </p>
              {org?.email && (
                <p className="flex items-center gap-1">
                  <Mail size={10} className="text-slate-400 shrink-0" />
                  <span>{org.email}</span>
                </p>
              )}
              {org?.phone && (
                <p className="flex items-center gap-1">
                  <Phone size={10} className="text-slate-400 shrink-0" />
                  <span>{org.phone}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] uppercase font-bold text-primary tracking-wide border-b border-primary/10 pb-0.5 mb-1.5">
              PROFFERED TO
            </p>
            <p className="font-bold text-xs text-slate-900">{offer.candidateName}</p>
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <p className="flex items-start gap-1">
                <MapPin size={10} className="text-slate-400 mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap">{offer.candidateAddress}</span>
              </p>
              <p className="flex items-center gap-1">
                <Mail size={10} className="text-slate-400 shrink-0" />
                <span>{offer.candidateEmail}</span>
              </p>
              {offer.candidatePhone && (
                <p className="flex items-center gap-1">
                  <Phone size={10} className="text-slate-400 shrink-0" />
                  <span>{offer.candidatePhone}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Subject Header */}
        <div className="bg-slate-50 border-y border-slate-200/80 py-2.5 px-4 mb-6 text-center font-sans">
          <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
            Subject: Offer of Employment as {offer.jobTitle}
          </p>
        </div>

        {/* Offer Letter Matter Content */}
        <div className="whitespace-pre-wrap text-[12px] leading-relaxed mb-10 text-slate-800 font-serif pr-4">
          {offer.letterContent}
        </div>

        {/* Acceptance Signatures Block */}
        <div className="border-t border-slate-200/80 pt-8 mt-12 font-sans print:avoid-break-inside">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 text-center mb-6">
            Acceptance & Signatures
          </h3>
          
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-800">For Devronic Solutions</p>
              <div className="h-14 border-b border-slate-200 flex items-end">
                <span className="text-[9px] text-slate-400 italic pb-1">Signature & Company Seal</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p>Name: <span className="font-semibold text-slate-900">Sheikh Altamash</span></p>
                <p>Designation: <span className="font-semibold text-slate-900">Director</span></p>
                <p>Date: <span className="font-semibold text-slate-900">{creationDate}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-800">For Candidate ({offer.candidateName})</p>
              <div className="h-14 border-b border-slate-200 flex items-end">
                <span className="text-[9px] text-slate-400 italic pb-1">Candidate Signature Acceptance</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p>Name: <span className="font-semibold text-slate-900">{offer.candidateName}</span></p>
                <p>Signature Date: <span className="font-semibold text-slate-900">___________________</span></p>
                <p>Joining Target Date: <span className="font-semibold text-slate-900">{joiningDateFormatted}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-8 mt-12 font-sans">
          This is a system-generated corporate document issued under Devronic Solutions guidelines.
        </div>
      </div>
      </div>
    </div>
  );
}
