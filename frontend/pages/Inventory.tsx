
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  PackageCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Tags
} from 'lucide-react';
import { toast } from 'sonner';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import StockBadge from '../components/StockBadge';
import { useInventory, useAuth } from '../context';
import { Product, StockStatus } from '../types';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, searchTerm } = useInventory();
  const { user } = useAuth();

  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [adjustData, setAdjustData] = useState<{ id: string, name: string, type: 'IN' | 'OUT', qty: number }>({ id: '', name: '', type: 'IN', qty: 0 });

  const getStatus = (stock: number, min: number): StockStatus => {
    if (stock <= 0) return 'Out of Stock';
    if (stock < min) return 'Low';
    return 'Safe';
  };

  const filteredProducts = products.filter(p => {
    const status = getStatus(p.stock, p.minStock);
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const statuses = ['All', 'Safe', 'Low', 'Out of Stock'];

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct?.id) {
      await updateProduct(currentProduct as Product);
    } else {
      const newProduct = {
        ...currentProduct,
        id: `p_${Date.now()}`,
        updatedAt: new Date().toISOString().split('T')[0]
      } as Product;
      await addProduct(newProduct);
    }
    setIsModalOpen(false);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustData.qty <= 0) {
      toast.error('Enter a valid quantity');
      return;
    }
    const prod = products.find(p => p.id === adjustData.id);
    if (adjustData.type === 'OUT' && prod && prod.stock < adjustData.qty) {
      toast.error('Insufficient stock');
      return;
    }
    await adjustStock(adjustData.id, adjustData.type, adjustData.qty, user?.name || 'System');
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500">Manage your warehouse items and stock levels.</p>
        </div>
        <Button onClick={() => { setCurrentProduct({ name: '', sku: '', category: '', price: 0, stock: 0, minStock: 0 }); setIsModalOpen(true); }} icon={<Plus size={18} className="mr-2" />}>
          Add Product
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-wrap justify-between items-center bg-slate-50/50 gap-4">
          <div className="text-sm font-medium text-slate-600">
            Showing {filteredProducts.length} items
            {searchTerm && <span> for "<span className="text-sky-600">{searchTerm}</span>"</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
              <select
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold outline-none focus:ring-2 focus:ring-sky-500/20"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
              <select
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-semibold outline-none focus:ring-2 focus:ring-sky-500/20"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(p => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                          <PackageCheck size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Tags size={12} className="text-slate-300" />
                        <span className="text-xs font-medium">{p.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {p.stock} <span className="text-[10px] text-slate-400">/ {p.minStock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StockBadge status={getStatus(p.stock, p.minStock)} />
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">${p.price}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setAdjustData({ id: p.id, name: p.name, type: 'IN', qty: 0 }); setIsAdjustModalOpen(true); }} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Stock In">
                          <ArrowDownLeft size={16} />
                        </button>
                        <button onClick={() => { setAdjustData({ id: p.id, name: p.name, type: 'OUT', qty: 0 }); setIsAdjustModalOpen(true); }} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Stock Out">
                          <ArrowUpRight size={16} />
                        </button>
                        <button onClick={() => { setCurrentProduct(p); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-sky-600 rounded-lg transition-colors"><Edit3 size={16} /></button>
                        <button onClick={() => { setProductToDelete(p.id); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Search size={40} className="text-slate-200 mb-2" />
                      <p className="text-slate-400 font-medium italic">No products match your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjustment Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title={adjustData.type === 'IN' ? 'Stock In' : 'Stock Out'}>
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Product</p>
            <p className="text-sm font-bold text-slate-900">{adjustData.name}</p>
          </div>
          <Input label="Adjustment Quantity" type="number" min="1" value={adjustData.qty} onChange={e => setAdjustData({ ...adjustData, qty: parseInt(e.target.value) || 0 })} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant={adjustData.type === 'IN' ? 'success' : 'warning'}>Confirm Action</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentProduct?.id ? 'Edit Product' : 'New Product'} size="lg">
        <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input label="Product Name" value={currentProduct?.name || ''} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} required />
          </div>
          <Input label="SKU / Barcode" value={currentProduct?.sku || ''} onChange={e => setCurrentProduct({ ...currentProduct, sku: e.target.value })} required />
          <Input label="Category" value={currentProduct?.category || ''} onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })} required />
          <Input label="Unit Price ($)" type="number" step="0.01" value={currentProduct?.price || 0} onChange={e => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })} required />
          <Input label="Min Alert Stock" type="number" value={currentProduct?.minStock || 0} onChange={e => setCurrentProduct({ ...currentProduct, minStock: parseInt(e.target.value) })} required />
          {!currentProduct?.id && (
            <Input label="Initial Stock" type="number" value={currentProduct?.stock || 0} onChange={e => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value) })} required />
          )}
          <div className="md:col-span-2 flex justify-end gap-2 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Are you sure you want to delete this product? This action will remove all historical data associated with it.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Go Back</Button>
            <Button variant="danger" onClick={async () => { await deleteProduct(productToDelete || ''); setIsDeleteModalOpen(false); }}>Delete Permanently</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
