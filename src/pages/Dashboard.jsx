import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  LogOut,
  LogIn,
  Home,
  Truck,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const lowStockProducts = productsSnapshot.docs.filter(
          doc => doc.data().stock < 10
        ).length;

        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const pendingOrders = ordersSnapshot.docs.filter(
          doc => doc.data().status === 'Pending'
        ).length;
        const usersSnapshot = await getDocs(collection(db, 'users'));

        setStats({
          totalProducts: productsSnapshot.size,
          totalCategories: categoriesSnapshot.size,
          totalOrders: ordersSnapshot.size,
          totalUsers: usersSnapshot.size,
          lowStockProducts,
          pendingOrders
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      () => fetchStats()
    );
    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      () => fetchStats()
    );

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Package size={24} />,
      accentColor: 'blue'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: <FolderTree size={24} />,
      accentColor: 'emerald'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart size={24} />,
      accentColor: 'violet'
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers,
      icon: <Users size={24} />,
      accentColor: 'orange'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockProducts,
      icon: <AlertTriangle size={24} />,
      accentColor: 'red',
      urgent: true
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <TrendingUp size={24} />,
      accentColor: 'amber',
      urgent: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-primary">
        <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-text-main">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1 text-sm">Real-time performance metrics and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`
              bg-white p-6 rounded-2xl border transition-all duration-300 hover:shadow-md relative overflow-hidden group
              ${stat.urgent ? 'border-red-200 shadow-sm' : 'border-gray-100'}
            `}
          >
            <div className={`absolute top-0 w-full left-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity ${stat.urgent ? 'from-red-500 to-rose-600' : 'from-green-400 via-green-500 to-green-600'}`}></div>

            <div className="flex flex-col relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl transition-all duration-300
                ${stat.accentColor === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                    stat.accentColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                      stat.accentColor === 'violet' ? 'bg-violet-500/10 text-violet-500' :
                        stat.accentColor === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                          stat.accentColor === 'red' ? 'bg-red-500/10 text-red-500' :
                            'bg-amber-500/10 text-amber-500'
                  }`}>
                  {stat.icon}
                </div>

                {stat.urgent && (
                  <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border border-red-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    Critical
                  </div>
                )}
              </div>

              <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 tracking-tight transition-colors">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm lg:col-span-1 flex flex-col transition-all duration-300">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Package size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Quick Actions</h2>
          </div>

          <div className="space-y-4 flex-grow">
            <button
              onClick={() => navigate('/admin/products')}
              className="w-full group flex items-center justify-between p-4 bg-primary/20 hover:bg-green-500/5 border border-glass-border hover:border-green-500/30 text-text-sub hover:text-text-main rounded-xl transition-all duration-300 shadow-inner"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                  <Package size={18} />
                </div>
                <span className="font-bold text-sm tracking-wide">Add New Product</span>
              </div>
              <ArrowRight size={18} className="text-green-400 opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </button>

            <button
              onClick={() => navigate('/admin/orders')}
              className="w-full group flex items-center justify-between p-4 bg-primary/20 hover:bg-green-500/5 border border-glass-border hover:border-green-500/30 text-text-sub hover:text-text-main rounded-xl transition-all duration-300 shadow-inner"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors border border-violet-500/20">
                  <ShoppingCart size={18} />
                </div>
                <span className="font-bold text-sm tracking-wide">Process Orders</span>
              </div>
              <ArrowRight size={18} className="text-green-400 opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </button>

            <button
              onClick={() => navigate('/admin/tracking')}
              className="w-full group flex items-center justify-between p-4 bg-primary/20 hover:bg-green-500/5 border border-glass-border hover:border-green-500/30 text-text-sub hover:text-text-main rounded-xl transition-all duration-300 shadow-inner"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors border border-orange-500/20">
                  <Truck size={18} />
                </div>
                <span className="font-bold text-sm tracking-wide">Track Orders</span>
              </div>
              <ArrowRight size={18} className="text-green-400 opacity-0 transform -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </button>
          </div>
        </div>

      </div>

      {/* Module Center Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <Package size={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Integrated Modules</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { label: 'Home', icon: <Home size={18} />, path: '/', color: 'text-blue-500 bg-blue-50' },
            { label: 'Invoice', icon: <FileText size={18} />, path: '/admin/orders', color: 'text-green-500 bg-green-50' },
            { label: 'Tracking', icon: <Truck size={18} />, path: '/admin/tracking', color: 'text-amber-500 bg-amber-50' },
            { label: 'Logout', icon: <LogOut size={18} />, path: '/logged-out', color: 'text-red-500 bg-red-50', isLogout: true }
          ].map((mod, i) => (
            <button
              key={i}
              onClick={() => mod.isLogout ? navigate('/logged-out') : navigate(mod.path)}
              className="flex flex-col items-center gap-3 p-4 bg-gray-50 border border-transparent rounded-2xl hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className={`p-3 rounded-xl ${mod.color} group-hover:scale-110 transition-transform`}>
                {mod.icon}
              </div>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{mod.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;