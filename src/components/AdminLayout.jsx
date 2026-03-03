import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, User, Sun, Moon } from 'lucide-react';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const user = auth.currentUser;

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden font-sans text-text-main items-start justify-start text-left">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 z-10 sticky top-0 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-3 rounded-2xl text-text-sub hover:text-gold-400 hover:bg-gold-500/10 focus:outline-none transition-all"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-2xl text-text-sub hover:text-gold-400 hover:bg-gold-500/10 transition-all group shadow-inner"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button className="p-2.5 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all relative group">
                <Bell size={20} className="group-hover:animate-bounce" />
                <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              </button>

              <div className="flex items-center gap-4 pl-6 border-l border-glass-border">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-black text-text-main tracking-tight uppercase leading-tight">
                    {user?.displayName || 'Admin Console'}
                  </p>
                  <p className="text-[10px] text-gold-500 font-black tracking-widest uppercase opacity-70">
                    {user?.email || 'admin@oilstore.com'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-600/20 flex items-center justify-center text-gold-500 font-black border border-gold-500/20 shadow-xl cursor-pointer hover:border-gold-500/50 hover:bg-gold-500/10 transition-all group overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <User size={20} className="group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto z-10 p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;