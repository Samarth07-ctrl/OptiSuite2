import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Edit3, Trash2, X } from 'lucide-react';
import apiService from '../utils/apiService';

function Customers({ isAdmin }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await apiService.deleteCustomer(id);
        fetchCustomers();
      } catch (e) {
        console.error(e);
        alert('Cannot delete customer with existing sales records.');
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
      await apiService.createCustomer(formData);
      setIsAddModalOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '' });
      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert('Failed to add customer. Check console for details.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Customers...</div>;
  }

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Customers ({customers.length})</h2>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Customer
        </button>
      </div>

      <div className="space-y-3">
        {customers.map(c => (
          <div key={c.id} className="flex justify-between items-center p-4 glass-card border-transparent transition-all hover:shadow-lg hover:border-[hsl(var(--c-border))]">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-[hsl(var(--c-text-subtle))]">
                {c.email || 'No email'} {c.phone ? `| ${c.phone}` : ''}
              </p>
            </div>
            <div className="flex gap-1">
              <button className="p-2 rounded-full hover:bg-[hsla(187,82%,42%,0.1)]" title="View Report">
                <FileText className="w-4 h-4 text-[hsl(var(--c-accent))]" />
              </button>
              <button className="p-2 rounded-full hover:bg-[hsla(var(--c-primary),0.1)]" title="Edit">
                <Edit3 className="w-4 h-4 text-[hsl(var(--c-primary))]" />
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-2 rounded-full hover:bg-[hsla(0,72%,51%,0.1)]" title="Delete">
                <Trash2 className="w-4 h-4 text-[hsl(var(--c-danger))]" />
              </button>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <p className="text-[hsl(var(--c-text-subtle))] text-center py-8">No customers found.</p>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md relative bg-[hsl(var(--c-bg))]">
            <button 
              className="absolute top-4 right-4 text-[hsl(var(--c-text-subtle))] hover:text-[hsl(var(--c-text))]"
              onClick={() => setIsAddModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--c-text))]">Add New Customer</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Phone</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Address</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))] min-h-[80px]"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
