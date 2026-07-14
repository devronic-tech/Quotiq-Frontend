import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/axios';
import Card from '@/shared/components/ui/Card';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Modal from '@/shared/components/ui/Modal';
import { Plus, Building, Trash2, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  createdAt: string;
}

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');

  // Fetch departments
  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await api.get('/v1/departments');
      return data.data;
    },
  });

  // Create department mutation
  const createMutation = useMutation({
    mutationFn: async (newName: string) => {
      await api.post('/v1/departments', { name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to create department';
      toast.error(msg);
    },
  });

  // Update department mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      await api.put(`/v1/departments/${id}`, { name: newName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to update department';
      toast.error(msg);
    },
  });

  // Delete department mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to delete department';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, newName: name });
    } else {
      createMutation.mutate(name);
    }
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingDept(null);
    setName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Departments</h2>
          <p className="text-xs text-on-surface-variant mt-1">Manage organization departments for quotations</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsOpen(true)}>
          New Department
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : departments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 bg-white">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-slate-500">
            <Building size={24} />
          </div>
          <h3 className="text-sm font-bold text-on-surface">No departments found</h3>
          <p className="text-xs text-on-surface-variant max-w-[320px] leading-relaxed mt-1">
            Create departments to categorize quotations and manage team permissions.
          </p>
          <Button variant="outline" size="sm" className="mt-6" icon={<Plus size={14} />} onClick={() => setIsOpen(true)}>
            Create Department
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card key={dept.id} className="relative group overflow-hidden border border-slate-200 bg-white hover:border-slate-350 shadow-soft hover:shadow-md transition-all duration-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-550">
                    <Building size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{dept.name}</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      Created: {new Date(dept.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-150 hover:text-slate-700 transition-all duration-200 cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this department?')) {
                        deleteMutation.mutate(dept.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={editingDept ? 'Edit Department' : 'New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Software Development"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
