import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/axios';
import Card from '@/shared/components/ui/Card';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Modal from '@/shared/components/ui/Modal';
import { Plus, Tag, Trash2, Edit2, Loader2, Package, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  hsn: string | null;
  category: string | null;
  price: string;
  gstRate: string;
  description: string | null;
}

interface Service {
  id: string;
  name: string;
  sac: string | null;
  category: string | null;
  price: string;
  gstRate: string;
  description: string | null;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [isOpen, setIsOpen] = useState(false);

  // Edit / Add States
  const [editingItem, setEditingItem] = useState<Product | Service | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [skuOrSac, setSkuOrSac] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [description, setDescription] = useState('');

  // Fetch Products
  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/v1/products');
      return data.data;
    },
    enabled: activeTab === 'products',
  });

  // Fetch Services
  const { data: services = [], isLoading: loadingServices } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await api.get('/v1/services');
      return data.data;
    },
    enabled: activeTab === 'services',
  });

  // Mutation to Create/Update Product
  const productMutation = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: any }) => {
      if (id) {
        await api.put(`/v1/products/${id}`, payload);
      } else {
        await api.post('/v1/products', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(editingItem ? 'Product updated successfully' : 'Product created successfully');
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Action failed';
      toast.error(msg);
    },
  });

  // Mutation to Create/Update Service
  const serviceMutation = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: any }) => {
      if (id) {
        await api.put(`/v1/services/${id}`, payload);
      } else {
        await api.post('/v1/services', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success(editingItem ? 'Service updated successfully' : 'Service created successfully');
      handleClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Action failed';
      toast.error(msg);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete product');
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Failed to delete service');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      category: category || undefined,
      price: Number(price) || 0,
      gstRate: Number(gstRate) || 0,
      description: description || undefined,
      ...(activeTab === 'products' ? { sku: skuOrSac || undefined } : { sac: skuOrSac || undefined }),
    };

    if (activeTab === 'products') {
      productMutation.mutate({ id: editingItem?.id, payload });
    } else {
      serviceMutation.mutate({ id: editingItem?.id, payload });
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setSkuOrSac(activeTab === 'products' ? item.sku || '' : item.sac || '');
    setCategory(item.category || '');
    setPrice(item.price);
    setGstRate(item.gstRate);
    setDescription(item.description || '');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingItem(null);
    setName('');
    setSkuOrSac('');
    setCategory('');
    setPrice('');
    setGstRate('18');
    setDescription('');
  };

  const isLoading = activeTab === 'products' ? loadingProducts : loadingServices;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Products & Services</h2>
          <p className="text-xs text-slate-500 mt-1">Manage master catalog details, SKUs/SACs, pricing, and taxes</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setIsOpen(true)}
        >
          {activeTab === 'products' ? 'New Product' : 'New Service'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
            activeTab === 'products'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all duration-200 ${
            activeTab === 'services'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activeTab === 'products' && products.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-300 bg-white">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-slate-650">
            <Package size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 max-w-[320px] leading-relaxed mt-1">
            Create physical products to add to quotation item catalogs.
          </p>
          <Button variant="outline" size="sm" className="mt-6" icon={<Plus size={14} />} onClick={() => setIsOpen(true)}>
            Create Product
          </Button>
        </Card>
      ) : activeTab === 'services' && services.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-300 bg-white">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-slate-650">
            <Briefcase size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No services found</h3>
          <p className="text-xs text-slate-500 max-w-[320px] leading-relaxed mt-1">
            Create consulting, maintenance, installation, or AMC contracts.
          </p>
          <Button variant="outline" size="sm" className="mt-6" icon={<Plus size={14} />} onClick={() => setIsOpen(true)}>
            Create Service
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'products'
            ? (products as Product[]).map((p) => (
                <Card key={p.id} className="relative group border border-slate-200 hover:border-slate-300 hover:bg-slate-50/20 bg-white shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/5 flex items-center justify-center text-primary">
                          <Package size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{p.name}</h4>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{p.category || 'Uncategorized'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this product?')) {
                              deleteProductMutation.mutate(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-650 transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {p.description && <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.description}</p>}
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      SKU: <span className="text-slate-600">{p.sku || '-'}</span> | HSN: <span className="text-slate-600">{p.hsn || '-'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">₹{Number(p.price).toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500">GST: {p.gstRate}%</div>
                    </div>
                  </div>
                </Card>
              ))
            : (services as Service[]).map((s) => (
                <Card key={s.id} className="relative group border border-slate-200 hover:border-slate-300 hover:bg-slate-50/20 bg-white shadow-soft hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/5 flex items-center justify-center text-primary">
                          <Briefcase size={16} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{s.name}</h4>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{s.category || 'Uncategorized'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this service?')) {
                              deleteServiceMutation.mutate(s.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-650 transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {s.description && <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{s.description}</p>}
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      SAC: <span className="text-slate-600">{s.sac || '-'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">₹{Number(s.price).toLocaleString()}</div>
                      <div className="text-[9px] text-slate-500">GST: {s.gstRate}%</div>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={
          editingItem
            ? activeTab === 'products'
              ? 'Edit Product'
              : 'Edit Service'
            : activeTab === 'products'
            ? 'New Product'
            : 'New Service'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            placeholder={activeTab === 'products' ? 'e.g. Dell Latitude Laptop' : 'e.g. Annual Consulting Service'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={activeTab === 'products' ? 'SKU Code' : 'SAC Code'}
              placeholder="e.g. SKU-DELL-10"
              value={skuOrSac}
              onChange={(e) => setSkuOrSac(e.target.value)}
            />
            <Input
              label="Category"
              placeholder="e.g. Hardware"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Standard Unit Price (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-550">GST Rate (%)</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
              >
                <option value="0">0% (Nil)</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-550">Description</label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="Item specifications or description..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={productMutation.isPending || serviceMutation.isPending}
            >
              {editingItem ? 'Save Changes' : 'Create Catalog Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
