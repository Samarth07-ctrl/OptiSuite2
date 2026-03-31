import React, { useState, useEffect } from 'react';
import { Package, Users, DollarSign, AlertTriangle, Search, Plus, UserPlus, ShoppingCart } from 'lucide-react';
import apiService from '../utils/apiService';

function Dashboard({ setActivePage, isAdmin }) {
  const [data, setData] = useState({
    products: [],
    sales: [],
    customers: [],
    loading: true,
    error: null
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await apiService.getProducts();
        const sales = isAdmin ? await apiService.getSales() : [];
        const customers = isAdmin ? await apiService.getCustomers() : [];
        
        setData({
          products,
          sales,
          customers,
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({ ...prev, loading: false, error: 'Failed to load dashboard data.' }));
      }
    };
    
    fetchData();
  }, [isAdmin]);

  if (data.loading) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
  }

  if (data.error) {
    return <div className="p-8 text-center text-red-500">{data.error}</div>;
  }

  const { products, sales, customers } = data;
  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
  const lowStockItems = products.filter(p => (p.quantity || 0) < 10);

  const statCards = [
    { label: 'Total Products', value: products.length, icon: Package },
    { label: 'Total Customers', value: isAdmin ? customers.length : 'N/A', icon: Users },
    { label: 'Total Revenue', value: isAdmin ? formatCurrency(totalRevenue) : 'N/A', icon: DollarSign },
    { label: 'Low Stock Items', value: lowStockItems.length, icon: AlertTriangle }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[hsl(var(--c-text-subtle))]">{stat.label}</span>
                <Icon className="w-5 h-5 text-[hsl(var(--c-text-subtle))]" />
              </div>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-semibold mb-4 text-lg">Recent Sales</h3>
          {isAdmin && sales.length > 0 ? (
            <div className="space-y-3">
              {sales.slice(0, 5).map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-[hsla(var(--c-primary),0.05)] transition-colors">
                  <div>
                    <p className="font-medium">{s.customer_name}</p>
                    <p className="text-xs text-[hsl(var(--c-text-subtle))]">
                      {new Date(s.sale_date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(s.total_amount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[hsl(var(--c-text-subtle))] text-center py-8">No sales data available.</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 text-lg">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActivePage('pos')} 
              className="btn btn-secondary w-full !justify-start"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> New Sale
            </button>
            {isAdmin && (
              <>
                <button 
                  onClick={() => setActivePage('inventory')} 
                  className="btn btn-secondary w-full !justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </button>
                <button 
                  onClick={() => setActivePage('customers')} 
                  className="btn btn-secondary w-full !justify-start"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Add Customer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
