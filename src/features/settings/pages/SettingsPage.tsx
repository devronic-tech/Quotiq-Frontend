import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/axios';
import Button from '@/shared/components/ui/Button';
import {
  Loader2,
  Save,
  Building2,
  Key,
  Globe,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  Volume2,
  Bot
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OrgAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface OrgSettings {
  groqApiKey?: string;
  deepgramApiKey?: string;
  defaultPaymentTerms?: string;
  defaultQuotationValidity?: number;
  defaultInvoiceDueDays?: number;
}

interface Organization {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: OrgAddress | null;
  currency: string;
  settings: OrgSettings;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Show/hide state for API keys
  const [showGroq, setShowGroq] = useState(false);
  const [showDeepgram, setShowDeepgram] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Address sub-states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  // Settings sub-states
  const [groqKey, setGroqKey] = useState('');
  const [deepgramKey, setDeepgramKey] = useState('');

  // Fetch Organization details
  const { data: org, isLoading } = useQuery<Organization>({
    queryKey: ['organization'],
    queryFn: async () => {
      const { data } = await api.get('/v1/organization');
      return data.data;
    },
  });

  // Populate states when organization data is loaded
  useEffect(() => {
    if (org) {
      setName(org.name || '');
      setEmail(org.email || '');
      setPhone(org.phone || '');
      setWebsite(org.website || '');
      setCurrency(org.currency || 'USD');

      if (org.address) {
        setStreet(org.address.street || '');
        setCity(org.address.city || '');
        setState(org.address.state || '');
        setZipCode(org.address.zipCode || '');
        setCountry(org.address.country || '');
      }

      if (org.settings) {
        setGroqKey(org.settings.groqApiKey || '');
        setDeepgramKey(org.settings.deepgramApiKey || '');
      }
    }
  }, [org]);

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.put('/v1/organization', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Organization settings saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to save settings');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Organization Name is required');
      return;
    }

    const payload = {
      name,
      email: email || null,
      phone: phone || null,
      website: website || null,
      currency,
      address: {
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
      },
      settings: {
        groqApiKey: groqKey || undefined,
        deepgramApiKey: deepgramKey || undefined,
      },
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-lg max-w-4xl mx-auto pb-xl">
      {/* Header — same pattern as Dashboard and Invoices */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h2 className="font-page-title text-page-title font-bold text-on-surface">Settings</h2>
          <p className="text-on-surface-variant font-body-md">Configure organization profiles, billing defaults, and API keys</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Save size={16} />}
          onClick={handleSave}
          isLoading={saveMutation.isPending}
          className="h-11 px-md"
        >
          Save Settings
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-lg">
        {/* Section 1: Org Details */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft space-y-lg">
          <div className="flex items-center gap-md border-b border-outline-variant/40 pb-md">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="font-card-title text-card-title text-on-surface">Organization Profile</h3>
              <p className="text-body-sm text-on-surface-variant">Update identity, billing credentials, and currency defaults</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
                placeholder="e.g. Devronic Solutions"
              />
            </div>

            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Website Link</label>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full h-11 pl-9 pr-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
                  placeholder="e.g. https://devronic.org"
                />
              </div>
            </div>

            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Billing Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-9 pr-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
                  placeholder="e.g. finance@devronic.org"
                />
              </div>
            </div>

            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Support Phone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 pl-9 pr-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Billing Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all cursor-pointer"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Address Details */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft space-y-lg">
          <div className="flex items-center gap-md border-b border-outline-variant/40 pb-md">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-card-title text-card-title text-on-surface">Registered Office Address</h3>
              <p className="text-body-sm text-on-surface-variant">Default billing address appended to invoices and quotations</p>
            </div>
          </div>

          <div className="space-y-sm">
            <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Street Line</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
              placeholder="e.g. 102 First Floor, Kamptee Road"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
                placeholder="Nagpur"
              />
            </div>
            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
                placeholder="Maharashtra"
              />
            </div>
            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Zip Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
                placeholder="441001"
              />
            </div>
            <div className="space-y-sm">
              <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-11 px-md bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface transition-all placeholder:text-on-surface-variant/60"
                placeholder="India"
              />
            </div>
          </div>
        </section>

        {/* Section 3: AI & Voice Developer Keys */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-soft space-y-lg">
          <div className="flex items-center gap-md border-b border-outline-variant/40 pb-md">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Key size={18} />
            </div>
            <div>
              <h3 className="font-card-title text-card-title text-on-surface">AI &amp; Developer API Settings</h3>
              <p className="text-body-sm text-on-surface-variant">Enable automated SOW generation and speech transcription keys</p>
            </div>
          </div>

          <div className="space-y-lg">
            <div className="space-y-sm">
              <div className="flex items-center gap-xs">
                <Bot size={14} className="text-on-surface-variant" />
                <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Groq API Key</label>
              </div>
              <div className="relative">
                <input
                  type={showGroq ? 'text' : 'password'}
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  className="w-full h-11 pl-md pr-10 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface font-mono transition-all placeholder:text-on-surface-variant/60"
                  placeholder="gsk_..."
                />
                <button
                  type="button"
                  onClick={() => setShowGroq(!showGroq)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface cursor-pointer transition-colors"
                >
                  {showGroq ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant/70">Used for quick structure generation and SOW quotation summarization.</p>
            </div>

            <div className="space-y-sm">
              <div className="flex items-center gap-xs">
                <Volume2 size={14} className="text-on-surface-variant" />
                <label className="font-label-uppercase text-label-uppercase text-on-surface-variant">Deepgram API Key</label>
              </div>
              <div className="relative">
                <input
                  type={showDeepgram ? 'text' : 'password'}
                  value={deepgramKey}
                  onChange={(e) => setDeepgramKey(e.target.value)}
                  className="w-full h-11 pl-md pr-10 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface font-mono transition-all placeholder:text-on-surface-variant/60"
                  placeholder="Enter Deepgram Key"
                />
                <button
                  type="button"
                  onClick={() => setShowDeepgram(!showDeepgram)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface cursor-pointer transition-colors"
                >
                  {showDeepgram ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant/70">Used for real-time speech transcription to draft quotations from voice logs.</p>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
