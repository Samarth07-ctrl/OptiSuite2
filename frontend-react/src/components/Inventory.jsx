import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit3, Trash2, X } from 'lucide-react';
import apiService from '../utils/apiService';

function Inventory({ isAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentSearch, setCurrentSearch] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', type: 'Frames', brand: '', price: '', quantity: '1',
    purchase_rate: '', barcode: '', frame_size: '', material: '', color: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
      // alert('Error loading inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['All', 'Frames', 'Lenses', 'Contact Lenses', 'Sunglasses', 'Accessories'];
  // Form options
  const typeOptions = ['Frames', 'Lenses', 'Contact Lenses', 'Sunglasses', 'Accessories'];

  const filteredProducts = useMemo(() => {
    const categoryFiltered = currentCategory === 'All' 
      ? products 
      : products.filter(p => p.type === currentCategory);

    const searchStr = currentSearch.toLowerCase();
    if (!searchStr) return categoryFiltered;

    return categoryFiltered.filter(p => 
      p.name.toLowerCase().includes(searchStr) ||
      (p.brand && p.brand.toLowerCase().includes(searchStr)) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchStr))
    );
  }, [products, currentCategory, currentSearch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(id);
        fetchProducts();
      } catch (e) {
        console.error(e);
        alert('Error: ' + e.message);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createProduct(formData);
      setIsAddModalOpen(false);
      setFormData({
        name: '', type: 'Frames', brand: '', price: '', quantity: '1',
        purchase_rate: '', barcode: '', frame_size: '', material: '', color: ''
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Failed to add product. Check console details.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Inventory...</div>;
  }

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Products ({products.length})</h2>
        {isAdmin && (
          <button className="btn btn-primary flex-shrink-0" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-[hsl(var(--c-border))] pb-2">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`filter-tab btn btn-secondary !py-1.5 !px-4 ${currentCategory === cat ? 'active' : ''}`}
            onClick={() => setCurrentCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--c-text-subtle))] pointer-events-none" />
        <input 
          type="text" 
          value={currentSearch}
          onChange={(e) => setCurrentSearch(e.target.value)}
          placeholder={`Search within '${currentCategory}'...`} 
          className="pl-10 w-full md:w-64" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full text-center text-[hsl(var(--c-text-subtle))] py-8">
            No products found.
          </p>
        ) : (
          filteredProducts.map(p => (
            <div key={p.id} className="glass-card p-4 flex flex-col transition-all hover:shadow-lg border border-transparent hover:border-[hsl(var(--c-border))]">
              <div className="flex-1 mb-3">
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-[hsl(var(--c-text-subtle))]">
                  {p.brand || ''} {p.color ? `(${p.color})` : ''}
                </p>
                {p.frame_size && <p className="text-xs text-[hsl(var(--c-text-subtle))] mt-1">Size: {p.frame_size}</p>}
                {p.material && <p className="text-xs text-[hsl(var(--c-text-subtle))] mt-1">Material: {p.material}</p>}
                <p className="mt-2 text-lg font-bold text-[hsl(var(--c-primary))]">
                  {formatCurrency(p.price)}
                </p>
                {p.barcode && <p className="text-xs text-[hsl(var(--c-text-subtle))] mt-1 truncate">Barcode: {p.barcode}</p>}
              </div>
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-[hsl(var(--c-border))]">
                <span className="text-sm font-medium text-[hsl(var(--c-text-subtle))]">Stock: {p.quantity}</span>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button className="p-2 rounded-full hover:bg-[hsla(var(--c-primary),0.1)]" title="Edit">
                      <Edit3 className="w-4 h-4 text-[hsl(var(--c-primary))]" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-full hover:bg-[hsla(0,72%,51%,0.1)]" title="Delete">
                      <Trash2 className="w-4 h-4 text-[hsl(var(--c-danger))]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card p-6 w-full max-w-2xl relative bg-[hsl(var(--c-bg))] my-8">
            <button 
              className="absolute top-4 right-4 text-[hsl(var(--c-text-subtle))] hover:text-[hsl(var(--c-text))]"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-6 text-[hsl(var(--c-text))]">Add New Product</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Type *</label>
                  <select name="type" required value={formData.type} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]">
                    {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Price (Sale) *</label>
                  <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Purchase Rate</label>
                  <input type="number" step="0.01" name="purchase_rate" value={formData.purchase_rate} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Initial Stock *</label>
                  <input type="number" name="quantity" required value={formData.quantity} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Barcode</label>
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Color</label>
                  <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Frame Size</label>
                  <input type="text" name="frame_size" value={formData.frame_size} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Material</label>
                  <input type="text" name="material" value={formData.material} onChange={handleInputChange} className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]" />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
