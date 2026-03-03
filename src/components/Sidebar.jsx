import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Home,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
  LogIn,
  LayoutDashboard,
  CreditCard,
  Truck,
  FileText
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/logged-out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    // Storefront Group
    { section: 'Storefront' },
    { path: '/', icon: <Home size={20} />, label: 'Home View' },

    // Management Group
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Product Mgt' },
    { path: '/admin/categories', icon: <FolderTree size={20} />, label: 'Categories' },

    // Logistics Group

    { path: '/admin/orders', icon: <FileText size={20} />, label: 'Payment & Invoice' },
    { path: '/admin/tracking', icon: <Truck size={20} />, label: 'Order Tracking' },
    { path: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },

    // System Group

    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];


  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-100 relative">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2.5 rounded-xl text-white shadow-sm">
                <Shield size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight text-gray-900 leading-tight">Oil Store</h1>
                <p className="text-[11px] text-green-600 font-semibold tracking-wider uppercase opacity-80">Admin Portal</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-text-sub hover:text-green-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item, index) => {
              if (item.section) {
                return (
                  <p key={`sec-${index}`} className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 first:mt-2">
                    {item.section}
                  </p>
                );
              }

              const isActive = location.pathname === item.path;
              const IconComponent = typeof item.icon === 'function' ? item.icon : null;
              const renderedIcon = typeof item.icon === 'object' ? item.icon : <IconComponent size={20} />;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1 border
                    ${isActive
                      ? 'bg-green-50 text-green-700 border-green-100 shadow-sm'
                      : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform duration-200 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`}>
                      {renderedIcon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section at bottom */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;