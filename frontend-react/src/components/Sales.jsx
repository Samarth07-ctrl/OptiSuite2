import React, { useState, useEffect } from 'react';
import apiService from '../utils/apiService';

function Sales({ isAdmin }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const statuses = ['Processing', 'Lens Ordered', 'Ready for Pickup', 'Completed'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSales();
      setSales(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      await apiService.updateSaleStatus(saleId, newStatus);
      setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: newStatus } : s));
      // In a real app, add a success toast here
    } catch (e) {
      console.error('Failed to update status:', e);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Sales History...</div>;
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-4">Sales History ({sales.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[hsl(var(--c-border))]">
              <th className="p-3 font-semibold">ID</th>
              <th className="p-3 font-semibold">Customer</th>
              <th className="p-3 font-semibold">Date</th>
              <th className="p-3 font-semibold text-right">Amount</th>
              <th className="p-3 font-semibold border-l border-[hsl(var(--c-border))] pl-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b border-[hsl(var(--c-border))] hover:bg-[hsla(var(--c-primary),0.05)]">
                <td className="p-3 text-sm">#{s.id}</td>
                <td className="p-3 font-medium">{s.customer_name}</td>
                <td className="p-3 text-sm">{new Date(s.sale_date).toLocaleDateString()}</td>
                <td className="p-3 text-right font-semibold">{formatCurrency(parseFloat(s.total_amount))}</td>
                <td className="p-3 border-l border-[hsl(var(--c-border))] pl-4">
                  {!isAdmin ? (
                    <span className="font-medium text-sm text-[hsl(var(--c-text-subtle))]">{s.status}</span>
                  ) : (
                    <select 
                      value={s.status}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      className="status-dropdown text-sm p-1 rounded border border-[hsl(var(--c-border))] bg-[hsl(var(--c-surface))]"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[hsl(var(--c-text-subtle))]">No sales records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sales;
