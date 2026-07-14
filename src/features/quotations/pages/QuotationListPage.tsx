import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/shared/lib/axios';
import Card from '@/shared/components/ui/Card';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import { Plus, FileText, Trash2, Loader2, Calendar, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  company: string | null;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  grandTotal: string;
  status: 'draft' | 'pending' | 'sent' | 'accepted' | 'rejected' | 'approved' | 'expired';
  createdAt: string;
  customer: Customer;
}

export default function QuotationListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch quotations
  const { data: quotations = [], isLoading } = useQuery<Quotation[]>({
    queryKey: ['quotations'],
    queryFn: async () => {
      const { data } = await api.get('/v1/quotations');
      return data.data;
    },
  });

  // Delete quotation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/quotations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete quotation');
    },
  });

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/v1/quotations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to update status');
    },
  });

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      case 'sent': return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'accepted': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'approved': return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-300';
      case 'expired': return 'bg-gray-100 text-gray-500 border-gray-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="space-y-lg max-w-7xl mx-auto pb-xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h2 className="font-page-title text-page-title text-on-surface">Quotations</h2>
          <p className="text-on-surface-variant font-body-md">Manage, edit, and send project quotations</p>
        </div>
        <div className="flex items-center gap-sm">
          <button className="px-md h-11 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm rounded-lg hover:bg-surface-container transition-colors flex items-center gap-xs cursor-pointer">
            <Calendar size={18} className="text-secondary" />
            <span>Last 30 Days</span>
          </button>
          <button
            onClick={() => navigate('/quotations/new')}
            className="px-md h-11 bg-primary text-white font-body-sm rounded-lg shadow-soft hover:bg-primary/90 transition-all flex items-center gap-xs cursor-pointer font-semibold"
          >
            <Plus size={18} />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : quotations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant bg-surface-container-lowest shadow-soft">
          <div className="h-14 w-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4 text-primary">
            <FileText size={24} />
          </div>
          <h3 className="font-card-title text-card-title text-on-surface">No quotations found</h3>
          <p className="text-body-sm text-on-surface-variant max-w-[320px] leading-relaxed mt-1">
            Create your first project quote manually, or use the AI voice requirement assistant.
          </p>
          <Link to="/quotations/new" className="mt-6">
            <Button variant="outline" size="sm" icon={<Plus size={14} />}>
              Create Quotation
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-0 border border-outline-variant overflow-hidden bg-surface-container-lowest shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">Quote Number</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">Project</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">Client</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs text-right">Grand Total</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">Status</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs">Created Date</th>
                  <th className="px-lg py-md font-label-uppercase text-label-uppercase text-on-surface-variant text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-sm">
                {quotations.map((q) => (
                  <tr 
                    key={q.id} 
                    onClick={() => navigate(`/quotations/${q.id}`)}
                    className="hover:bg-surface-container-low/50 transition-colors text-on-surface cursor-pointer"
                  >
                    <td className="px-lg py-md font-data-mono text-data-mono">{q.quotationNumber}</td>
                    <td className="px-lg py-md font-bold text-on-surface">{q.projectName}</td>
                    <td className="px-lg py-md">
                      <div className="font-semibold text-on-surface">{q.customer?.name || 'Unknown Client'}</div>
                      {q.customer?.company && <div className="text-[11px] text-on-surface-variant">{q.customer?.company}</div>}
                    </td>
                    <td className="px-lg py-md font-data-mono text-right font-semibold text-on-surface">
                      ₹{Number(q.grandTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-lg py-md">
                      {/* Inline status dropdown */}
                      <select
                        value={q.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          statusMutation.mutate({ id: q.id, status: e.target.value });
                        }}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer outline-none appearance-none pr-6 ${getStatusColor(q.status)}`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="approved">Approved</option>
                        <option value="expired">Expired</option>
                      </select>
                    </td>
                    <td className="px-lg py-md text-[12px] text-on-surface-variant">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="px-lg py-md text-right">
                      <div className="flex justify-end gap-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/quotations/${q.id}?print=true`, '_blank');
                          }}
                          className="p-1.5 rounded hover:bg-primary/10 hover:text-primary text-secondary transition-all cursor-pointer"
                          title="Download / Print PDF"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this quotation?')) {
                              deleteMutation.mutate(q.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-error-container hover:text-error text-secondary transition-all cursor-pointer"
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
        </Card>
      )}
    </div>
  );
}
