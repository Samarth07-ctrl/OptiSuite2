import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { TrendingUp } from 'lucide-react';
import apiService from '../utils/apiService';

// Build a full 30-day date array and merge with actual sales data
// so days with no sales show ₹0 instead of being skipped
function buildLast30Days(salesOverTime) {
  const dateMap = {};
  salesOverTime.forEach(d => {
    // Normalise the date key (e.g. "2026-03-28")
    const key = new Date(d.sale_date).toISOString().slice(0, 10);
    dateMap[key] = parseFloat(d.daily_revenue || 0);
  });

  const result = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({
      date: key,
      label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: dateMap[key] ?? 0,
    });
  }
  return result;
}

function Reports() {
  const [data, setData] = useState({
    salesOverTime: [],
    salesByType: [],
    bestSellers: [],
    totalProfit: 0,
    loading: true,
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportData = await apiService.getFullReport();
        setData({ ...reportData, loading: false });
      } catch (e) {
        console.error('Reports Error:', e);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchReports();
  }, []);

  if (data.loading) {
    return <div className="p-8 text-center text-slate-500">Loading Analytics...</div>;
  }

  const isDarkMode = document.documentElement.classList.contains('dark');

  // ------- Colour tokens -------
  const axisColor   = isDarkMode ? '#64748b' : '#94a3b8';
  const gridColor   = isDarkMode ? '#1e293b' : '#e2e8f0';
  const tooltipTheme = isDarkMode ? 'dark' : 'light';
  const chartBg     = 'transparent';

  // ------- 30-day area chart -------
  const days30 = buildLast30Days(data.salesOverTime);
  const hasAnyRevenue = days30.some(d => d.revenue > 0);

  const salesOptions = {
    chart: {
      type: 'area',
      background: chartBg,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout', speed: 600 },
      zoom: { enabled: false },
    },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    colors: ['#3b82f6'],
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.03,
        stops: [0, 100],
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: days30.map(d => d.label),
      tickAmount: 10,
      labels: {
        rotate: -30,
        style: { colors: axisColor, fontSize: '11px' },
      },
      axisBorder: { color: gridColor },
      axisTicks: { color: gridColor },
    },
    yaxis: {
      labels: {
        style: { colors: axisColor, fontSize: '11px' },
        formatter: v => `₹${Number(v).toLocaleString('en-IN')}`,
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      padding: { left: 8, right: 8 },
    },
    tooltip: {
      theme: tooltipTheme,
      y: { formatter: v => formatCurrency(v) },
    },
    markers: {
      size: hasAnyRevenue ? 4 : 0,
      colors: ['#3b82f6'],
      strokeColors: isDarkMode ? '#1e293b' : '#fff',
      strokeWidth: 2,
      hover: { size: 6 },
    },
    noData: {
      text: 'No sales in the last 30 days',
      align: 'center',
      verticalAlign: 'middle',
      style: { color: axisColor, fontSize: '14px' },
    },
  };

  const salesSeries = [{ name: 'Revenue', data: days30.map(d => d.revenue) }];

  // ------- Donut chart -------
  const typeOptions = {
    chart: { type: 'donut', background: chartBg },
    theme: { mode: isDarkMode ? 'dark' : 'light' },
    labels: data.salesByType.map(d => d.type || 'Unknown'),
    colors: ['#3b82f6', '#0ea5e9', '#60a5fa', '#38bdf8', '#93c5fd'],
    legend: {
      position: 'bottom',
      labels: { colors: axisColor },
    },
    tooltip: {
      theme: tooltipTheme,
      y: { formatter: v => formatCurrency(v) },
    },
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '65%' } } },
    dataLabels: {
      style: { fontSize: '12px', colors: ['#fff'] },
      dropShadow: { enabled: false },
    },
    noData: {
      text: 'No sales data yet',
      align: 'center',
      verticalAlign: 'middle',
      style: { color: axisColor, fontSize: '14px' },
    },
  };

  const typeSeries = data.salesByType.map(d => parseFloat(d.type_revenue || 0));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

      {/* Profit banner */}
      <div className="lg:col-span-4 glass-card p-6">
        <div className="flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-[hsl(var(--c-primary))]" />
          <div>
            <span className="text-sm font-medium text-[hsl(var(--c-text-subtle))]">Total Calculated Profit</span>
            <p className="text-3xl font-bold">{formatCurrency(data.totalProfit)}</p>
          </div>
        </div>
        <p className="text-xs text-[hsl(var(--c-text-subtle))] mt-2">
          *Based on products with a valid 'Purchase Rate' entered.
        </p>
      </div>

      {/* Revenue (Last 30 Days) — area chart */}
      <div className="lg:col-span-3 glass-card p-6">
        <h3 className="font-semibold mb-2 text-lg">Revenue (Last 30 Days)</h3>
        <p className="text-xs text-[hsl(var(--c-text-subtle))] mb-4">
          Daily totals — hover a point for details
        </p>
        <div style={{ minHeight: '320px' }}>
          <ReactApexChart
            key={isDarkMode ? 'dark' : 'light'}
            options={salesOptions}
            series={salesSeries}
            type="area"
            height={320}
          />
        </div>
      </div>

      {/* Revenue by Type — donut */}
      <div className="lg:col-span-1 glass-card p-6 flex flex-col">
        <h3 className="font-semibold mb-4 text-lg">Revenue by Type</h3>
        <div className="flex-1" style={{ minHeight: '280px' }}>
          <ReactApexChart
            key={`donut-${isDarkMode ? 'dark' : 'light'}`}
            options={typeOptions}
            series={typeSeries}
            type="donut"
            height={280}
          />
        </div>
      </div>

      {/* Best Sellers table */}
      <div className="lg:col-span-4 glass-card p-6">
        <h3 className="font-semibold mb-4 text-lg">Top Best Sellers (by Units Sold)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[hsl(var(--c-border))]">
                <th className="p-3 font-semibold">#</th>
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">Brand</th>
                <th className="p-3 font-semibold text-right">Units Sold</th>
                <th className="p-3 font-semibold text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.bestSellers.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[hsl(var(--c-border))] hover:bg-[hsla(var(--c-primary),0.05)]"
                >
                  <td className="p-3 text-[hsl(var(--c-text-subtle))]">{idx + 1}</td>
                  <td className="p-3 font-medium">{item.product_name}</td>
                  <td className="p-3 text-[hsl(var(--c-text-subtle))]">{item.product_brand || 'N/A'}</td>
                  <td className="p-3 text-right font-semibold">{item.total_units_sold}</td>
                  <td className="p-3 text-right font-semibold text-[hsl(var(--c-primary))]">
                    {formatCurrency(parseFloat(item.total_revenue))}
                  </td>
                </tr>
              ))}
              {data.bestSellers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-[hsl(var(--c-text-subtle))]">
                    No sales data yet. Complete a sale to see results here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
