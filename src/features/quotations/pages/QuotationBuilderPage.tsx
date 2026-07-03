import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/shared/lib/axios';
import Card from '@/shared/components/ui/Card';
import Button from '@/shared/components/ui/Button';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  ChevronRight, 
  Calculator, 
  FileCode, 
  Mic, 
  Square, 
  Loader2, 
  Sparkles,
  ChevronDown,
  UploadCloud,
  FileUp,
  Share2,
  Calendar,
  Layers,
  UserPlus,
  X
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
  addresses?: Address[];
}

interface Department {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  gstRate: string;
  description: string | null;
}

interface Service {
  id: string;
  name: string;
  price: string;
  gstRate: string;
  description: string | null;
}

interface BuilderItem {
  type: 'catalog_product' | 'catalog_service' | 'custom';
  productId?: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  tax: number;
}

interface BuilderSection {
  name: string;
  scopeDescription: string; // Detailed scope/features for this module
  items: BuilderItem[];
}

export default function QuotationBuilderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customer');

  // Master Data Queries
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/v1/customers');
      return data.data;
    },
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/v1/departments');
      return data.data;
    },
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/v1/products');
      return data.data;
    },
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await api.get('/v1/services');
      return data.data;
    },
  });

  // Builder States
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Design & Development');
  const [description, setDescription] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30%,40%,30%'); // upfront, mid, final
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [notes, setNotes] = useState('12 Weeks'); // duration maps here
  const [currency, setCurrency] = useState('INR');
  const [applyTax, setApplyTax] = useState(false);

  // Prefill customer details if customer ID param is present
  useEffect(() => {
    if (customerIdParam && customers.length > 0) {
      const selectedCustomer = customers.find((c) => c.id === customerIdParam);
      if (selectedCustomer) {
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
        }
      }
    }
  }, [customerIdParam, customers]);

  // Collapsible sections state
  const [activeSections, setActiveSections] = useState({
    customerInfo: true,
    projectDesc: true,
    coreDeliverables: true,
  });

  const toggleSection = (section: 'customerInfo' | 'projectDesc' | 'coreDeliverables') => {
    setActiveSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [sections, setSections] = useState<BuilderSection[]>([
    { name: 'Core Deliverables', scopeDescription: '', items: [] },
  ]);
  const [draggedItem, setDraggedItem] = useState<{ secIndex: number; itemIndex: number } | null>(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  // Voice Recording / AI states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio Visualizer states & refs
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 30, 15, 45, 20, 35, 15, 25]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      // Set up AudioContext for volume visualization
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevels = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        const levels: number[] = [];
        const step = Math.floor(bufferLength / 8) || 1;
        for (let i = 0; i < 8; i++) {
          const val = dataArray[i * step] || 0;
          // Scale value from 0-255 to a percentage height (15% min height so it always shows lines)
          const height = Math.max(15, Math.floor((val / 255) * 100));
          levels.push(height);
        }
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };

      mediaRecorder.start();
      setIsRecording(true);
      updateLevels();
      toast.success('Recording started...');
    } catch (err: any) {
      console.error('Failed to start recording', err);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      setAudioLevels([15, 30, 15, 45, 20, 35, 15, 25]);
      
      toast.success('Recording saved');
    }
  };

  const handleAiGenerate = async () => {
    if (!uploadedFile && !audioBlob && !descriptionInput.trim()) {
      toast.error('Please upload a file, record a voice description, or type raw notes');
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('AI is transcribing and generating quotation structure...');

    try {
      let response;
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        response = await api.post('/v1/ai/generate-quotation', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        response = await api.post('/v1/ai/generate-quotation', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/v1/ai/generate-quotation', {
          description: descriptionInput,
        });
      }

      const { data } = response;
      if (data.success && data.data?.quotation) {
        const q = data.data.quotation;
        if (q.projectName) setProjectName(q.projectName);
        if (q.projectType) setProjectType(q.projectType);
        if (q.description) setDescription(q.description);
        if (q.currency) setCurrency(q.currency);
        if (q.paymentTerms) setPaymentTerms(q.paymentTerms);
        if (q.termsAndConditions) setTermsAndConditions(q.termsAndConditions);
        if (q.customerName) setCustomerName(q.customerName);
        if (q.contactPerson) setContactPerson(q.contactPerson);
        if (q.billingAddress) setBillingAddress(q.billingAddress);
        if (q.departmentName) {
          const matchedDept = departments.find(
            (d) => d.name.toLowerCase().includes(q.departmentName.toLowerCase()) || 
                   q.departmentName.toLowerCase().includes(d.name.toLowerCase())
          );
          if (matchedDept) {
            setDepartmentId(matchedDept.id);
          }
        }
        if (q.duration) setNotes(q.duration);
        if (q.estimatedStart) {
          try {
            const dateVal = new Date(q.estimatedStart).toISOString().split('T')[0];
            if (dateVal) setValidUntil(dateVal);
          } catch (e) {}
        } else if (q.validUntil) {
          try {
            const dateVal = new Date(q.validUntil).toISOString().split('T')[0];
            if (dateVal) setValidUntil(dateVal);
          } catch (e) {}
        }
        if (q.sections && Array.isArray(q.sections)) {
          const formattedSections = q.sections.map((sec: any) => ({
            name: sec.name || 'SOW Section',
            scopeDescription: sec.scopeDescription || sec.scope || '',
            items: (sec.items || []).map((item: any) => ({
              type: item.productId ? 'catalog_product' : item.serviceId ? 'catalog_service' : 'custom',
              productId: item.productId || undefined,
              serviceId: item.serviceId || undefined,
              description: item.description || '',
              quantity: item.quantity || 1,
              unit: item.unit || 'units',
              unitPrice: item.unitPrice || 0,
              discount: item.discount || 0,
              tax: item.tax || (applyTax ? 15 : 0),
            })),
          }));
          setSections(formattedSections);
        }
        
        if (data.data.transcript) {
          setDescriptionInput(data.data.transcript);
        }

        toast.success('Quotation generated and populated successfully!', { id: toastId });
      } else {
        throw new Error('Invalid structure returned from AI');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || err.message || 'Generation failed', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.toLowerCase().split('.').pop();
      if (ext !== 'pdf' && ext !== 'doc' && ext !== 'docx') {
        toast.error('Only PDF or Word (.doc/.docx) files are supported.');
        return;
      }
      setUploadedFile(file);
      toast.success(`Selected file: ${file.name}`);
    }
  };

  // Polish overview with AI
  const handlePolishOverview = async () => {
    if (!description.trim()) {
      toast.error('Scope summary is empty. Please enter some notes to polish.');
      return;
    }
    const toastId = toast.loading('Polishing executive summary with AI...');
    try {
      const response = await api.post('/v1/ai/generate-quotation', {
        description: `Improve and expand this project executive summary professionally: ${description}`,
      });
      const { data } = response;
      if (data.success && data.data?.quotation?.description) {
        setDescription(data.data.quotation.description);
        toast.success('Overview polished successfully!', { id: toastId });
      } else {
        throw new Error('Failed to polish text');
      }
    } catch (err: any) {
      toast.error(err.message || 'Polish failed', { id: toastId });
    }
  };

  // Calculations helper
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        const itemSub = item.quantity * item.unitPrice;
        const itemDisc = itemSub * (item.discount / 100);
        const itemTaxable = itemSub - itemDisc;
        const itemTax = applyTax ? (itemTaxable * 0.15) : (itemTaxable * (item.tax / 100));

        subtotal += itemSub;
        discountTotal += itemDisc;
        taxTotal += itemTax;
      });
    });

    const grandTotal = subtotal - discountTotal + taxTotal;

    return { subtotal, discountTotal, taxTotal, grandTotal };
  };

  const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals();

  // Save quotation mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/v1/quotations', payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation drafted successfully');
      if (data?.id) {
        navigate(`/quotations/${data.id}`);
      } else {
        navigate('/quotations');
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
        toast.error(apiError?.message || 'Failed to save quotation');
      }
    },
  });

  const handleSave = () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!projectName.trim()) {
      toast.error('Project Name is required');
      return;
    }
    if (sections.length === 0 || sections.every(s => s.items.length === 0)) {
      toast.error('Please add at least one line item in a section');
      return;
    }

    const payload = {
      customerId: customerIdParam || undefined,
      customerName,
      departmentId: departmentId || undefined,
      projectName,
      projectType: projectType || undefined,
      description: description || undefined,
      validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
      paymentTerms,
      termsAndConditions: termsAndConditions || undefined,
      notes: `${notes} | Contact: ${contactPerson} | Address: ${billingAddress}`,
      currency,
      sections: sections.map((sec) => ({
        // Encode scope description in section name using ||| separator
        name: sec.scopeDescription ? `${sec.name}|||${sec.scopeDescription}` : sec.name,
        items: sec.items.map((item) => ({
          productId: item.productId || undefined,
          serviceId: item.serviceId || undefined,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: applyTax ? 15 : item.tax,
        })),
      })),
    };

    saveMutation.mutate(payload);
  };

  const addSection = () => {
    setSections([...sections, { name: `Section ${sections.length + 1}`, scopeDescription: '', items: [] }]);
  };

  const removeSection = (secIndex: number) => {
    setSections(sections.filter((_, idx) => idx !== secIndex));
  };

  const addLineItem = (secIndex: number) => {
    const updated = [...sections];
    updated[secIndex]?.items.push({
      type: 'custom',
      description: 'Custom Service / Item',
      quantity: 1,
      unit: 'units',
      unitPrice: 0,
      discount: 0,
      tax: applyTax ? 15 : 0,
    });
    setSections(updated);
  };

  const removeLineItem = (secIndex: number, itemIndex: number) => {
    const updated = [...sections];
    updated[secIndex]!.items = updated[secIndex]!.items.filter((_, idx) => idx !== itemIndex);
    setSections(updated);
  };

  const handleCatalogSelect = (secIndex: number, itemIndex: number, catalogType: 'product' | 'service', itemId: string) => {
    const updated = [...sections];
    if (catalogType === 'product') {
      const prod = products.find(p => p.id === itemId);
      if (prod && updated[secIndex]?.items[itemIndex]) {
        const item = updated[secIndex]!.items[itemIndex]!;
        item.productId = prod.id;
        item.serviceId = undefined;
        item.description = prod.name;
        item.unitPrice = Number(prod.price);
        item.tax = applyTax ? 15 : Number(prod.gstRate);
        item.unit = 'units';
      }
    } else {
      const serv = services.find(s => s.id === itemId);
      if (serv && updated[secIndex]?.items[itemIndex]) {
        const item = updated[secIndex]!.items[itemIndex]!;
        item.serviceId = serv.id;
        item.productId = undefined;
        item.description = serv.name;
        item.unitPrice = Number(serv.price);
        item.tax = applyTax ? 15 : Number(serv.gstRate);
        item.unit = 'fixed';
      }
    }
    setSections(updated);
  };

  const updateItemField = (secIndex: number, itemIndex: number, field: keyof BuilderItem, value: any) => {
    const updated = [...sections];
    if (updated[secIndex]?.items[itemIndex]) {
      (updated[secIndex]!.items[itemIndex] as any)[field] = value;
    }
    setSections(updated);
  };

  // Reordering handlers
  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index - 1]!;
    updated[index - 1] = temp!;
    setSections(updated);
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[index + 1]!;
    updated[index + 1] = temp!;
    setSections(updated);
  };

  const moveItemUp = (secIndex: number, itemIndex: number) => {
    if (itemIndex === 0) return;
    const updated = [...sections];
    const section = updated[secIndex];
    if (section) {
      const temp = section.items[itemIndex];
      section.items[itemIndex] = section.items[itemIndex - 1]!;
      section.items[itemIndex - 1] = temp!;
      setSections(updated);
    }
  };

  const moveItemDown = (secIndex: number, itemIndex: number) => {
    const updated = [...sections];
    const section = updated[secIndex];
    if (section && itemIndex < section.items.length - 1) {
      const temp = section.items[itemIndex];
      section.items[itemIndex] = section.items[itemIndex + 1]!;
      section.items[itemIndex + 1] = temp!;
      setSections(updated);
    }
  };

  const handleDragStart = (e: React.DragEvent, secIndex: number, itemIndex: number) => {
    setDraggedItem({ secIndex, itemIndex });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSecIndex: number, targetItemIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { secIndex: sourceSecIndex, itemIndex: sourceItemIndex } = draggedItem;

    const updated = [...sections];
    const sourceSection = updated[sourceSecIndex];
    const targetSection = updated[targetSecIndex];

    if (sourceSection && targetSection) {
      const [movedItem] = sourceSection.items.splice(sourceItemIndex, 1);
      if (movedItem) {
        targetSection.items.splice(targetItemIndex, 0, movedItem);
        setSections(updated);
      }
    }

    setDraggedItem(null);
  };

  return (
    <div className="space-y-lg max-w-7xl mx-auto pb-xl">
      {/* BUILDER HEADER */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-md mb-lg">
        <div className="flex items-center gap-md text-sm text-secondary">
          <span className="font-bold text-on-surface">New Quotation</span>
          <span className="h-4 w-[1px] bg-outline-variant"></span>
          <span className="font-data-mono text-xs opacity-75">QO-2024-0892</span>
        </div>
        <div className="flex items-center gap-sm">
          <span className="text-xs text-on-surface-variant flex items-center gap-[2px] opacity-75">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Auto-saved
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Left Column: Form Content */}
        <div className="lg:col-span-8 space-y-lg">
          
          {/* Section: Customer Info */}
          <section className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden transition-all">
            <div 
              onClick={() => toggleSection('customerInfo')}
              className="px-lg py-md flex items-center justify-between bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-md">
                <UserPlus className="text-primary" size={20} />
                <h2 className="font-card-title text-on-surface">Customer Information</h2>
              </div>
              <ChevronDown className={`text-outline transition-transform duration-200 ${activeSections.customerInfo ? 'rotate-180' : ''}`} size={20} />
            </div>

            {activeSections.customerInfo && (
              <div className="px-lg py-lg grid grid-cols-1 md:grid-cols-2 gap-lg border-t border-outline-variant bg-white">
                <div className="space-y-sm">
                  <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">CLIENT NAME</label>
                  <input 
                    className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none" 
                    placeholder="e.g. Acme Corp Industries" 
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

                <div className="space-y-sm">
                  <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">BILLING ADDRESS</label>
                  <textarea 
                    className="w-full p-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all resize-none text-on-surface outline-none" 
                    placeholder="Street, City, Zip, Country" 
                    rows={3}
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-md">
                  <div className="space-y-sm">
                    <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">DEPARTMENT</label>
                    <select
                      className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none"
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
            )}
          </section>

          {/* Section: Project Overview */}
          <section className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden transition-all">
            <div 
              onClick={() => toggleSection('projectDesc')}
              className="px-lg py-md flex items-center justify-between bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-md">
                <FileText className="text-primary" size={20} />
                <h2 className="font-card-title text-on-surface">Project Overview</h2>
              </div>
              <ChevronDown className={`text-outline transition-transform duration-200 ${activeSections.projectDesc ? 'rotate-180' : ''}`} size={20} />
            </div>

            {activeSections.projectDesc && (
              <div className="px-lg py-lg space-y-lg border-t border-outline-variant bg-white">
                <div className="space-y-sm">
                  <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">PROJECT TITLE</label>
                  <input 
                    className="w-full h-11 px-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all text-on-surface outline-none" 
                    placeholder="Design & Development of Enterprise Portal" 
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div className="space-y-sm">
                  <label className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider">EXECUTIVE SUMMARY</label>
                  <div className="relative">
                    <textarea 
                      className="w-full p-md rounded-lg border border-outline-variant bg-white font-body-md focus:border-primary transition-all resize-none text-on-surface outline-none pb-12" 
                      placeholder="Briefly describe the scope and value proposition..." 
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={handlePolishOverview}
                      className="absolute bottom-3 right-3 flex items-center gap-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all font-semibold text-xs border border-primary/20 shadow-soft cursor-pointer"
                    >
                      <Sparkles size={13} className="text-primary" />
                      <span>Polish with AI</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section: Core Deliverables */}
          <section className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="px-lg py-md flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-md">
                <Layers className="text-primary" size={20} />
                <h2 className="font-card-title text-on-surface">Core Deliverables</h2>
              </div>
              <button 
                type="button"
                onClick={addSection}
                className="flex items-center gap-sm bg-white border border-outline-variant px-md py-1.5 rounded-lg hover:border-primary transition-all text-xs font-bold cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Section</span>
              </button>
            </div>

            {sections.map((sec, secIndex) => (
              <div key={secIndex} className="border-t border-outline-variant p-lg space-y-md">
                <div className="flex justify-between items-center border-b border-outline-variant pb-3">
                  <div className="flex items-center gap-2">
                    {/* Up / Down buttons for Section reordering */}
                    <button
                      type="button"
                      disabled={secIndex === 0}
                      onClick={() => moveSectionUp(secIndex)}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[10px] font-bold"
                      title="Move Section Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={secIndex === sections.length - 1}
                      onClick={() => moveSectionDown(secIndex)}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[10px] font-bold"
                      title="Move Section Down"
                    >
                      ▼
                    </button>
                    <input
                      className="bg-transparent border-b border-dashed border-outline-variant font-bold text-on-surface focus:outline-none focus:border-primary text-sm px-1 py-0.5 outline-none font-page-title ml-1"
                      value={sec.name}
                      onChange={(e) => {
                        const updated = [...sections];
                        if (updated[secIndex]) {
                          updated[secIndex]!.name = e.target.value;
                          setSections(updated);
                        }
                      }}
                    />
                  </div>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(secIndex)}
                      className="text-xs text-red-500 hover:text-red-600 font-bold"
                    >
                      Delete Section
                    </button>
                  )}
                </div>

                {/* Scope of Work Description for this module */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary/70 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    Module Scope of Work / Features
                    <span className="text-on-surface-variant font-normal normal-case tracking-normal ml-1">(appears in Technical quotation document)</span>
                  </label>
                  <textarea
                    className="w-full p-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest text-xs text-on-surface focus:border-primary focus:outline-none resize-none leading-relaxed placeholder:text-on-surface-variant/50"
                    rows={4}
                    placeholder={`Describe features for this module, one per line:\n• User Authentication — Sign up, Login, OTP verification\n• Profile Management — Name, email, photo upload\n• Dashboard — Overview stats, quick actions`}
                    value={sec.scopeDescription}
                    onChange={(e) => {
                      const updated = [...sections];
                      if (updated[secIndex]) {
                        updated[secIndex]!.scopeDescription = e.target.value;
                        setSections(updated);
                      }
                    }}
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface-container-lowest border-b border-outline-variant text-[11px] font-bold text-on-surface-variant">
                        <th className="w-12 py-3"></th>
                        <th className="text-left font-label-uppercase py-3 px-md">ITEM & DESCRIPTION</th>
                        <th className="text-right font-label-uppercase py-3 px-md w-24">QTY</th>
                        <th className="text-right font-label-uppercase py-3 px-md w-32">UNIT PRICE</th>
                        <th className="text-right font-label-uppercase py-3 px-md w-32">TOTAL</th>
                        <th className="w-12 py-3 px-md"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items.map((item, itemIndex) => (
                        <tr 
                          key={itemIndex}
                          draggable
                          onDragStart={(e) => handleDragStart(e, secIndex, itemIndex)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, secIndex, itemIndex)}
                          className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group"
                        >
                          <td className="py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 px-2">
                              <span className="material-symbols-outlined text-outline-variant/70 group-hover:text-outline transition-colors cursor-grab select-none">
                                drag_indicator
                              </span>
                              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  disabled={itemIndex === 0}
                                  onClick={() => moveItemUp(secIndex, itemIndex)}
                                  className="text-[8px] p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                  title="Move Up"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={itemIndex === sec.items.length - 1}
                                  onClick={() => moveItemDown(secIndex, itemIndex)}
                                  className="text-[8px] p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                  title="Move Down"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-md">
                            <div className="flex flex-col gap-1 w-full">
                              <input 
                                className="bg-transparent border-none p-0 font-semibold focus:ring-0 w-full text-sm text-on-surface outline-none" 
                                type="text"
                                placeholder="Deliverable name..."
                                value={item.description.split(' - ')[0] || ''}
                                onChange={(e) => {
                                  const parts = item.description.split(' - ');
                                  parts[0] = e.target.value;
                                  updateItemField(secIndex, itemIndex, 'description', parts.join(' - '));
                                }}
                              />
                              <input 
                                className="bg-transparent border-none p-0 text-xs text-on-surface-variant focus:ring-0 w-full outline-none" 
                                type="text"
                                placeholder="Describe details..."
                                value={item.description.split(' - ')[1] || ''}
                                onChange={(e) => {
                                  const parts = item.description.split(' - ');
                                  parts[1] = e.target.value;
                                  updateItemField(secIndex, itemIndex, 'description', parts.join(' - '));
                                }}
                              />
                              {/* Catalog link options */}
                              <select 
                                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] text-primary hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-[200px] cursor-pointer mt-1.5 font-bold transition-all duration-200"
                                value={item.productId ? `p:${item.productId}` : item.serviceId ? `s:${item.serviceId}` : 'custom'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val.startsWith('p:')) {
                                    handleCatalogSelect(secIndex, itemIndex, 'product', val.replace('p:', ''));
                                  } else if (val.startsWith('s:')) {
                                    handleCatalogSelect(secIndex, itemIndex, 'service', val.replace('s:', ''));
                                  } else {
                                    const updated = [...sections];
                                    if (updated[secIndex]?.items[itemIndex]) {
                                      const i = updated[secIndex]!.items[itemIndex]!;
                                      i.productId = undefined;
                                      i.serviceId = undefined;
                                    }
                                    setSections(updated);
                                  }
                                }}
                              >
                                <option value="custom">✍️ Custom Entry</option>
                                <optgroup label="Products Catalog">
                                  {products.length === 0 ? (
                                    <option disabled value="">No products in catalog</option>
                                  ) : (
                                    products.map(p => <option key={p.id} value={`p:${p.id}`}>🎁 {p.name}</option>)
                                  )}
                                </optgroup>
                                <optgroup label="Services Catalog">
                                  {services.length === 0 ? (
                                    <option disabled value="">No services in catalog</option>
                                  ) : (
                                    services.map(s => <option key={s.id} value={`s:${s.id}`}>🛠️ {s.name}</option>)
                                  )}
                                </optgroup>
                              </select>
                            </div>
                          </td>
                          <td className="py-4 px-md text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <input 
                                className="bg-transparent border-none p-0 text-right focus:ring-0 w-full font-data-mono text-sm text-on-surface outline-none" 
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemField(secIndex, itemIndex, 'quantity', Number(e.target.value) || 1)}
                              />
                              <select
                                className="bg-transparent border-none p-0 text-[10px] text-slate-550 hover:text-slate-750 focus:ring-0 outline-none cursor-pointer font-bold uppercase text-right"
                                value={item.unit}
                                onChange={(e) => updateItemField(secIndex, itemIndex, 'unit', e.target.value)}
                              >
                                <option value="units">units</option>
                                <option value="fixed">fixed</option>
                                <option value="hours">hours</option>
                                <option value="days">days</option>
                                <option value="weeks">weeks</option>
                                <option value="months">months</option>
                              </select>
                            </div>
                          </td>
                          <td className="py-4 px-md text-right">
                            <input 
                              className="bg-transparent border-none p-0 text-right focus:ring-0 w-full font-data-mono text-sm text-on-surface outline-none" 
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItemField(secIndex, itemIndex, 'unitPrice', Number(e.target.value) || 0)}
                            />
                          </td>
                          <td className="py-4 px-md text-right font-semibold font-data-mono text-on-surface">
                            ₹{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-md text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              type="button"
                              onClick={() => removeLineItem(secIndex, itemIndex)}
                              className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={() => addLineItem(secIndex)}
                  className="w-full py-2 border border-dashed border-outline-variant hover:border-outline rounded-xl text-xs text-secondary hover:text-primary flex items-center justify-center gap-1.5 cursor-pointer bg-surface-container-lowest transition-all"
                >
                  <Plus size={14} />
                  <span>Add Item</span>
                </button>
              </div>
            ))}
          </section>

          {/* Section: Timeline & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <section className="bg-white rounded-xl border border-outline-variant shadow-sm p-lg">
              <div className="flex items-center gap-md mb-md">
                <Calendar className="text-primary" size={20} />
                <h2 className="font-card-title text-on-surface">Project Timeline</h2>
              </div>
              <div className="space-y-md">
                <div className="flex items-center gap-sm border border-outline-variant rounded-lg p-md">
                  <span className="material-symbols-outlined text-secondary">calendar_today</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-label-uppercase text-on-surface-variant font-bold">ESTIMATED START</p>
                    <input 
                      type="date" 
                      className="bg-transparent border-none p-0 font-semibold focus:ring-0 w-full text-sm text-on-surface outline-none"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-sm border border-outline-variant rounded-lg p-md">
                  <span className="material-symbols-outlined text-secondary">flag</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-label-uppercase text-on-surface-variant font-bold">DURATION</p>
                    <input 
                      type="text" 
                      className="bg-transparent border-none p-0 font-semibold focus:ring-0 w-full text-sm text-on-surface outline-none"
                      placeholder="e.g. 12 Weeks"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-outline-variant shadow-sm p-lg">
              <div className="flex items-center gap-md mb-md">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h2 className="font-card-title text-on-surface">Payment Schedule</h2>
              </div>
              <div className="space-y-sm">
                <div className="flex justify-between items-center py-2.5 border-b border-outline-variant/50">
                  <span className="text-sm font-medium text-on-surface">Upfront Deposit</span>
                  <input 
                    type="text" 
                    className="bg-transparent border-none p-0 text-right focus:ring-0 w-16 font-data-mono font-bold text-sm text-on-surface outline-none"
                    value={paymentTerms.split(',')[0] || '30%'}
                    onChange={(e) => {
                      const parts = paymentTerms.split(',');
                      parts[0] = e.target.value;
                      setPaymentTerms(parts.join(','));
                    }}
                  />
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-outline-variant/50">
                  <span className="text-sm font-medium text-on-surface">Mid-Project</span>
                  <input 
                    type="text" 
                    className="bg-transparent border-none p-0 text-right focus:ring-0 w-16 font-data-mono font-bold text-sm text-on-surface outline-none"
                    value={paymentTerms.split(',')[1] || '40%'}
                    onChange={(e) => {
                      const parts = paymentTerms.split(',');
                      parts[1] = e.target.value;
                      setPaymentTerms(parts.join(','));
                    }}
                  />
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-sm font-medium text-on-surface">Final Delivery</span>
                  <input 
                    type="text" 
                    className="bg-transparent border-none p-0 text-right focus:ring-0 w-16 font-data-mono font-bold text-sm text-on-surface outline-none"
                    value={paymentTerms.split(',')[2] || '30%'}
                    onChange={(e) => {
                      const parts = paymentTerms.split(',');
                      parts[2] = e.target.value;
                      setPaymentTerms(parts.join(','));
                    }}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column: Sticky Side Panel */}
        <div className="lg:col-span-4 space-y-lg lg:sticky lg:top-[80px]">
          
          {/* AI Assistant Panel */}
          <section className="bg-white rounded-2xl border border-outline-variant shadow-md p-lg overflow-hidden relative group">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/10 opacity-20 blur-3xl group-hover:opacity-40 transition-opacity"></div>
            <div className="flex items-center gap-md mb-lg relative">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="text-primary animate-pulse" size={20} />
              </div>
              <div>
                <h3 className="font-card-title text-slate-800">AI Assistant</h3>
                <p className="text-xs text-slate-500">Smart Draft Generator</p>
              </div>
            </div>

            <div className="space-y-md relative">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-md">
                <p className="text-sm text-slate-650 leading-relaxed">
                  "Upload your project brief or paste the requirements below. I'll automatically populate the deliverables, costs, and timeline."
                </p>
              </div>

              {/* Upload & Voice switches */}
              <div className="flex gap-sm">
                <div 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex-1 border-2 border-dashed rounded-xl p-md flex flex-col items-center justify-center gap-sm transition-all cursor-pointer ${
                    isRecording 
                      ? 'border-red-500 bg-red-50 text-red-650' 
                      : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  {isRecording ? (
                    <div className="flex items-end justify-center gap-[3px] h-[20px] mb-1">
                      {audioLevels.map((lvl, idx) => (
                        <div 
                          key={idx} 
                          className="w-[3px] bg-red-500 rounded-full transition-all duration-75"
                          style={{ height: `${lvl}%` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Mic size={20} />
                  )}
                  <span className="text-[10px] font-semibold">
                    {isRecording ? 'Stop Recording' : 'Voice Input'}
                  </span>
                </div>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 border-2 border-dashed rounded-xl p-md flex flex-col items-center justify-center gap-sm transition-all cursor-pointer ${
                    uploadedFile 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-650' 
                      : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  <UploadCloud size={20} />
                  <span className="text-[10px] font-semibold">
                    {uploadedFile ? 'Change File' : 'Upload Brief'}
                  </span>
                </div>
              </div>

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange} 
              />

              {uploadedFile && (
                <div className="flex items-center justify-between bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={16} className="text-primary shrink-0" />
                    <span className="truncate font-semibold">{uploadedFile.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setUploadedFile(null)} 
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {audioUrl && !isRecording && (
                <div className="w-full flex justify-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <audio src={audioUrl} controls className="h-8 max-w-full" />
                </div>
              )}

              <textarea 
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-md text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary transition-all resize-none outline-none focus:ring-1 focus:ring-primary" 
                placeholder="Paste raw notes here..." 
                rows={3}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
              />

              <button 
                type="button"
                onClick={handleAiGenerate}
                disabled={isGenerating || isRecording}
                className="w-full bg-primary py-3 rounded-xl font-bold text-white flex items-center justify-center gap-md hover:bg-primary/95 transition-all active:scale-95 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span>Generate with AI</span>
              </button>
            </div>
          </section>

          {/* Summary Panel */}
          <section className="bg-white rounded-xl border border-outline-variant shadow-lg p-lg">
            <h3 className="font-label-uppercase text-xs font-bold text-on-surface-variant tracking-wider mb-lg">QUOTATION SUMMARY</h3>
            <div className="space-y-md mb-xl">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Subtotal</span>
                <span className="font-data-mono font-semibold text-on-surface">
                  ₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Tax {applyTax ? '(15%)' : ''}</span>
                <span className="font-data-mono font-semibold text-on-surface">
                  ₹{taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-[1px] bg-outline-variant/30"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-on-surface">Total Amount</span>
                <span className="font-data-mono font-bold text-xl text-primary">
                  ₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="space-y-md">
              <button 
                type="button"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-md hover:bg-primary/95 transition-all active:scale-95 shadow-lg shadow-primary/10 cursor-pointer"
              >
                <FileText size={18} />
                <span>Generate PDF</span>
              </button>
              <div className="grid grid-cols-2 gap-md">
                <button 
                  type="button"
                  onClick={() => toast.success('Quotation share link copied!')}
                  className="border border-outline-variant hover:bg-surface-container py-3 rounded-xl font-bold text-on-surface flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  className="border border-outline-variant hover:bg-surface-container py-3 rounded-xl font-bold text-on-surface flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
                >
                  <Save size={14} />
                  <span>Save Draft</span>
                </button>
              </div>
            </div>
          </section>

          {/* Pro Tip Panel */}
          <div className="bg-surface-container-low border border-primary-fixed rounded-xl p-md flex gap-sm text-xs text-on-surface-variant shadow-soft">
            <span className="material-symbols-outlined text-primary">info</span>
            <div>
              <span className="font-bold text-on-surface block mb-0.5">Pro Tip</span>
              <p className="leading-relaxed">
                You can drag and drop items in the deliverables table to reorder them before generating the final PDF.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
