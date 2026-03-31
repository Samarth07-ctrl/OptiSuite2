import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, UserPlus, X } from 'lucide-react';
import apiService from '../utils/apiService';

function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(true);
  const [completingSale, setCompletingSale] = useState(false);
  
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const fetchData = async () => {
    try {
      const [fetchedProducts, fetchedCustomers] = await Promise.all([
        apiService.getProducts(),
        apiService.getCustomers()
      ]);
      setProducts(fetchedProducts);
      setCustomers(fetchedCustomers);
    } catch (e) {
      console.error("POS Data Error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    const lowerFilter = productSearch.toLowerCase();
    if (!lowerFilter) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerFilter) || 
      (p.brand && p.brand.toLowerCase().includes(lowerFilter)) || 
      (p.barcode && p.barcode.toLowerCase().includes(lowerFilter))
    );
  }, [products, productSearch]);

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      alert('Product is out of stock.');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id && item.price === product.price);
      if (existingItem) {
        if (existingItem.quantity < product.quantity) {
          return prevCart.map(item => 
            item.id === product.id && item.price === product.price 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        } else {
          alert('No more stock available for this item.');
          return prevCart;
        }
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleCompleteSale = async () => {
    const customer_id = parseInt(selectedCustomer);
    if (!customer_id) {
      alert('Please select a customer.');
      return;
    }

    setCompletingSale(true);
    const total_amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const items = cart.map(item => ({ product_id: item.id, quantity: item.quantity, price_at_sale: item.price }));
    
    try {
      await apiService.createSale({ customer_id, total_amount, items });
      alert('Sale completed successfully!');
      setCart([]);
      setSelectedCustomer('');
      
      // Refresh product stock
      const freshProducts = await apiService.getProducts();
      setProducts(freshProducts);
    } catch (error) {
      alert(`Sale failed: ${error.message}`);
    } finally {
      setCompletingSale(false);
    }
  };

  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCustomer = await apiService.createCustomer(customerFormData);
      setIsAddCustomerModalOpen(false);
      setCustomerFormData({ name: '', phone: '', email: '', address: '' });
      await fetchData();
      if (newCustomer && newCustomer.id) {
        setSelectedCustomer(newCustomer.id.toString());
      }
    } catch (error) {
      console.error(error);
      alert('Failed to add customer. Check console for details.');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const canCompleteSale = cart.length > 0 && selectedCustomer;

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading POS...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full pb-10">
      
      {/* Products Column */}
      <div className="lg:col-span-2 glass-card flex flex-col h-[80vh]">
        <div className="p-4 border-b border-[hsl(var(--c-border))]">
          <h3 className="text-lg font-semibold">Products</h3>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--c-text-subtle))]" />
            <input 
              type="text" 
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by name or brand..." 
              className="pl-10 w-full bg-[hsl(var(--c-bg-glass))] border-[hsl(var(--c-border))]"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {filteredProducts.length === 0 ? (
            <p className="text-[hsl(var(--c-text-subtle))] p-4 text-center">No products found.</p>
          ) : (
            filteredProducts.map(p => (
              <div 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[hsla(var(--c-primary),0.05)] cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-[hsl(var(--c-text-subtle))]">
                    {p.brand || 'No Brand'} - Stock: {p.quantity}
                  </p>
                </div>
                <span className="font-semibold text-[hsl(var(--c-primary))]">
                  {formatCurrency(p.price)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Column */}
      <div className="lg:col-span-2 glass-card flex flex-col h-[80vh]">
        <div className="p-4 border-b border-[hsl(var(--c-border))]">
          <h3 className="text-lg font-semibold">Current Sale</h3>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {cart.length === 0 ? (
            <div className="text-center text-[hsl(var(--c-text-subtle))] py-10 mt-10">
              <ShoppingCart className="mx-auto h-12 w-12 text-[hsl(var(--c-border))]" />
              <p className="mt-2 text-lg">Cart is empty</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[hsl(var(--c-bg))] rounded-md shadow-sm border border-[hsl(var(--c-border))]">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-[hsl(var(--c-text-subtle))]">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
                <div className="font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[hsl(var(--c-border))] bg-[hsla(var(--c-primary),0.02)] rounded-b-[var(--radius)]">
          <div className="flex justify-between items-center font-semibold text-lg mb-4">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <button 
            onClick={handleCompleteSale}
            disabled={!canCompleteSale || completingSale}
            className="btn w-full !py-3 bg-[hsl(var(--c-primary))] text-white shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            {completingSale ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>

      {/* Customer Column */}
      <div className="lg:col-span-1 glass-card flex flex-col p-4 h-fit">
        <h3 className="text-lg font-semibold mb-4">Customer</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--c-text-subtle))] mb-1">Select Customer</label>
            <select 
              value={selectedCustomer} 
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full bg-[hsl(var(--c-bg-glass))] border-[hsl(var(--c-border))]"
            >
              <option value="">-- Walk-in Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email || 'No Email'})
                </option>
              ))}
            </select>
          </div>
          <div className="text-center">
            <span className="text-xs text-[hsl(var(--c-text-subtle))] block py-2">OR</span>
          </div>
          <button className="btn btn-secondary w-full" onClick={() => setIsAddCustomerModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add New
          </button>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-md relative bg-[hsl(var(--c-bg))]">
            <button 
              className="absolute top-4 right-4 text-[hsl(var(--c-text-subtle))] hover:text-[hsl(var(--c-text))]"
              onClick={() => setIsAddCustomerModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-[hsl(var(--c-text))]">Add New Customer</h3>
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={customerFormData.name} 
                  onChange={handleCustomerInputChange} 
                  className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Phone</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={customerFormData.phone} 
                  onChange={handleCustomerInputChange} 
                  className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={customerFormData.email} 
                  onChange={handleCustomerInputChange} 
                  className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[hsl(var(--c-text-subtle))]">Address</label>
                <textarea 
                  name="address" 
                  value={customerFormData.address} 
                  onChange={handleCustomerInputChange} 
                  className="w-full bg-[hsl(var(--c-bg-glass))] border border-[hsl(var(--c-border))] rounded-lg p-2 text-[hsl(var(--c-text))] min-h-[80px]"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddCustomerModalOpen(false)}>
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

export default POS;
