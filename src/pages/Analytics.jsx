import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    conversionRate: 0,
    topProducts: [],
    recentOrders: []
  });

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalCustomers = usersSnapshot.size;

      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Mocking some sales data for top products since we don't have a real transactions subcollection yet
      const topProducts = products.slice(0, 5).map(p => ({
        ...p,
        sales: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 50000) + 10000
      })).sort((a, b) => b.revenue - a.revenue);

      setAnalyticsData({
        totalRevenue,
        averageOrderValue,
        totalOrders,
        totalCustomers,
        conversionRate: totalCustomers > 0 ? ((totalOrders / totalCustomers) * 100).toFixed(2) : 0,
        topProducts,
        recentOrders: orders.slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock Data for Charts
  const revenueData = [
    { name: 'Jan', revenue: 40000, orders: 24 },
    { name: 'Feb', revenue: 30000, orders: 18 },
    { name: 'Mar', revenue: 20000, orders: 12 },
    { name: 'Apr', revenue: 27800, orders: 20 },
    { name: 'May', revenue: 18900, orders: 15 },
    { name: 'Jun', revenue: 23900, orders: 19 },
    { name: 'Jul', revenue: 34900, orders: 25 },
  ];

  const categoryData = [
    { name: 'Extinguishers', value: 400 },
    { name: 'Alarms', value: 300 },
    { name: 'Hydrants', value: 300 },
    { name: 'Safety Gear', value: 200 },
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${analyticsData.totalRevenue.toLocaleString()}`,
      trend: '+12.5%',
      trendUp: true,
      icon: DollarSign,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'Total Orders',
      value: analyticsData.totalOrders,
      trend: '+8.2%',
      trendUp: true,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Customers',
      value: analyticsData.totalCustomers,
      trend: '-2.4%',
      trendUp: false,
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Avg Order Value',
      value: `₹${analyticsData.averageOrderValue.toFixed(0)}`,
      trend: '+4.1%',
      trendUp: true,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-primary">
        <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-text-main">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-main tracking-wide">Analytics</h1>
        </div>

        <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-glass-border shadow-lg">
          <Calendar size={16} className="text-green-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-sm border-none focus:ring-0 text-text-main font-medium bg-transparent cursor-pointer outline-none w-full"
          >
            <option value="week" className="bg-primary text-text-main">This Week</option>
            <option value="month" className="bg-primary text-text-main">This Month</option>
            <option value="quarter" className="bg-primary text-text-main">This Quarter</option>
            <option value="year" className="bg-primary text-text-main">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="glass-panel p-6 rounded-2xl border border-glass-border shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-green-400/0 via-green-400/50 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="p-3 rounded-xl bg-primary border border-glass-border shadow-inner">
                <stat.icon size={20} className="text-green-400" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-inner ${stat.trendUp ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-text-main uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-3xl font-display font-bold text-text-main">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-glass-border shadow-xl">
          <div className="mb-6">
            <h3 className="text-xl font-display font-bold text-text-main mb-1">Revenue Overview</h3>
            <p className="text-sm text-text-main font-medium">Monthly revenue breakdown</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', color: '#fff' }}
                  itemStyle={{ color: '#d4af37' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d4af37"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-glass-border shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-xl font-display font-bold text-text-main mb-1">Sales by Category</h3>
            <p className="text-sm text-text-main font-medium">Product category distribution</p>
          </div>
          <div className="h-64 w-full flex-grow relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="block text-2xl font-bold text-text-main">100%</span>
              <span className="block text-xs text-text-main uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-semibold text-text-main">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-text-main">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="glass-panel rounded-2xl border border-glass-border shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-display font-bold text-text-main text-lg">Top Products</h3>
            <button className="text-sm text-green-400 font-semibold hover:text-green-300 transition-colors uppercase tracking-wider">View All</button>
          </div>
          <div className="divide-y divide-white/5 flex-grow">
            {analyticsData.topProducts.map((product) => (
              <div key={product.id} className="p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 border border-glass-border">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover rounded-xl opacity-80 mix-blend-screen" />
                  ) : (
                    <Package size={20} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-text-main truncate">{product.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-main mt-1">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-green-400">₹{product.revenue.toLocaleString()}</p>
                  <p className="text-xs text-olive-400 font-bold tracking-wide mt-1">{product.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass-panel rounded-2xl border border-glass-border shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-display font-bold text-text-main text-lg">Recent Transactions</h3>
            <button className="text-sm text-green-400 font-semibold hover:text-green-300 transition-colors uppercase tracking-wider">View All</button>
          </div>
          <div className="divide-y divide-white/5 flex-grow">
            {analyticsData.recentOrders.map((order) => (
              <div key={order.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary border border-glass-border shadow-inner flex items-center justify-center text-text-main font-display font-bold text-lg">
                    {order.customerName ? order.customerName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <p className="text-base font-bold text-text-main">{order.customerName || 'Unknown'}</p>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mt-1">#{order.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-text-main">₹{order.total}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block border ${order.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-gray-500/10 text-text-main border-gray-500/20'
                    }`}>
                    {order.status || 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;