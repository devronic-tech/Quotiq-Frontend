import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/shared/lib/axios';
import Button from '@/shared/components/ui/Button';
import { Plus, Trash2, Loader2, FileSignature, Search, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface OfferLetter {
  id: string;
  offerNumber: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  jobTitle: string;
  department: 'technical' | 'social_media';
  jobType: 'full_time' | 'internship' | 'freelance';
  workplaceType: 'remote' | 'onsite' | 'hybrid';
  salaryPerMonth: string;
  joiningDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
}

export default function OfferListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Offer Letters
  const { data: offers = [], isLoading } = useQuery<OfferLetter[]>({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data } = await api.get('/v1/offers');
      return data.data;
    },
  });

  // Delete Offer Letter mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      toast.success('Offer letter deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete offer letter');
    },
  });

  // Status badge style helper
  const getStatusStyle = (status: OfferLetter['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'declined':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: OfferLetter['status']) => {
    switch (status) {
      case 'accepted': return '✔ Accepted';
      case 'sent': return '✉ Sent';
      case 'declined': return '✘ Declined';
      case 'draft': return 'Draft';
      default: return status;
    }
  };

  const getJobTypeLabel = (type: OfferLetter['jobType']) => {
    switch (type) {
      case 'full_time': return 'Full-Time';
      case 'internship': return 'Internship';
      case 'freelance': return 'Freelance';
      default: return type;
    }
  };

  const getWorkplaceLabel = (mode: OfferLetter['workplaceType']) => {
    switch (mode) {
      case 'remote': return 'Remote';
      case 'onsite': return 'Onsite';
      case 'hybrid': return 'Hybrid';
      default: return mode;
    }
  };

  // Filter based on search query
  const filteredOffers = offers.filter(off => {
    const num = (off.offerNumber || '').toLowerCase();
    const candidate = (off.candidateName || '').toLowerCase();
    const title = (off.jobTitle || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return num.includes(query) || candidate.includes(query) || title.includes(query);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-on-surface">Offer Letters</h2>
          <p className="text-xs text-on-surface-variant">Generate, manage, and print employment offer letters for candidates</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search candidate or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-on-surface"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => navigate('/offers/new')}
            className="h-10"
          >
            New Offer Letter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white ">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-primary">
            <FileSignature size={24} />
          </div>
          <h3 className="text-sm font-bold text-on-surface">No offer letters found</h3>
          <p className="text-xs text-on-surface-variant  leading-relaxed mt-1 wt-200  ">
            Build and issue formal employment offer letters for prospective candidates.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            icon={<Plus size={14} />}
            onClick={() => navigate('/offers/new')}
          >
            Create Offer Letter
          </Button>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Offer #</th>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Job Title</th>
                  <th className="px-5 py-3.5">Type & Mode</th>
                  <th className="px-5 py-3.5">Joining Date</th>
                  <th className="px-5 py-3.5">Salary / Month</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-on-surface">
                {filteredOffers.map((off) => (
                  <tr
                    key={off.id}
                    onClick={() => navigate(`/offers/${off.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-bold font-mono text-primary">{off.offerNumber}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-on-surface">{off.candidateName}</div>
                      <div className="text-[10px] text-slate-400">{off.candidateEmail}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold">{off.jobTitle}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{off.department.replace('_', ' ')}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-600">
                      {getJobTypeLabel(off.jobType)} — {getWorkplaceLabel(off.workplaceType)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(off.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-on-surface">
                      ₹{Number(off.salaryPerMonth).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(off.status)}`}>
                        {getStatusLabel(off.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => navigate(`/offers/${off.id}?print=true`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Download / Print PDF"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this offer letter?')) {
                              deleteMutation.mutate(off.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Offer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
