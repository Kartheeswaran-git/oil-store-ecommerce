import React, { useState, useEffect } from "react";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  User,
  Store,
  Lock,
  Save,
  Loader2,
  ShieldCheck,
  CreditCard
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [storeData, setStoreData] = useState({
    storeName: "Fire Safety Tamil Nadu",
    phone: "",
    address: "",
    gstNumber: "",
    codEnabled: true
  });

  useEffect(() => {
    if (auth.currentUser) {
      setProfileData({
        displayName: auth.currentUser.displayName || "",
        email: auth.currentUser.email || "",
        newPassword: "",
        confirmPassword: ""
      });
    }
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "store"));
      if (snap.exists()) setStoreData(snap.data());
    } catch (error) {
      console.error("Error fetching store settings:", error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (profileData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profileData.displayName });
      }

      if (profileData.email !== user.email) {
        await updateEmail(user, profileData.email);
      }

      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          showMessage('error', "Passwords do not match");
          return;
        }
        await updatePassword(user, profileData.newPassword);
      }

      showMessage('success', "Profile updated successfully!");
    } catch (e) {
      showMessage('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const saveStore = async () => {
    try {
      setLoading(true);
      await setDoc(doc(db, "settings", "store"), storeData, { merge: true });
      showMessage('success', "Store settings saved!");
    } catch (e) {
      showMessage('error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'store', label: 'Store Settings', icon: Store },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 font-sans text-text-main">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-text-main tracking-wide">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation for Settings */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="glass-panel rounded-2xl border border-glass-border shadow-xl overflow-hidden p-2">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                    : 'text-text-main hover:bg-white/5 hover:text-text-main border border-transparent'
                    }`}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? 'text-green-400' : 'text-gray-500 group-hover:text-text-main'} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="glass-panel rounded-2xl border border-glass-border shadow-xl p-8 lg:p-10">
            {message.text && (
              <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-bold uppercase tracking-wider border ${message.type === 'error'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                {message.type === 'error' ? <X size={18} /> : <ShieldCheck size={18} />}
                {message.text}
              </div>
            )}

            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-2xl font-display font-bold text-text-main tracking-wide">Profile Information</h2>
                  <p className="text-sm font-medium text-text-main mt-2">Update your personal account details</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main uppercase tracking-widest pl-1">Display Name</label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                      className="w-full px-5 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner transition-all placeholder-gray-600"
                      placeholder="Your Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main uppercase tracking-widest pl-1">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-5 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner transition-all placeholder-gray-600"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-glass-border">
                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="group flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-obsidian-950 font-bold uppercase tracking-wider text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Store Settings */}
            {activeTab === "store" && (
              <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-2xl font-display font-bold text-text-main tracking-wide">Store Configuration</h2>
                  <p className="text-sm font-medium text-text-main mt-2">Manage store details and global preferences</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main uppercase tracking-widest pl-1">Store Name</label>
                    <input
                      type="text"
                      value={storeData.storeName}
                      onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                      className="w-full px-5 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner transition-all placeholder-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-main uppercase tracking-widest pl-1">Phone</label>
                      <input
                        type="tel"
                        value={storeData.phone}
                        onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                        className="w-full px-5 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner transition-all placeholder-gray-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-main uppercase tracking-widest pl-1">GST Number</label>
                      <input
                        type="text"
                        value={storeData.gstNumber}
                        onChange={(e) => setStoreData({ ...storeData, gstNumber: e.target.value })}
                        className="w-full px-5 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner transition-all placeholder-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main uppercase tracking-widest pl-1">Store Address</label>
                    <textarea
                      rows={3}
                      value={storeData.address}
                      onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                      className="w-full px-5 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner transition-all resize-none placeholder-gray-600 custom-scrollbar"
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-glass-border">
                  <button
                    onClick={saveStore}
                    disabled={loading}
                    className="group flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-obsidian-950 font-bold uppercase tracking-wider text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                    Save Store Settings
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-2xl font-display font-bold text-text-main tracking-wide">Security</h2>
                  <p className="text-sm font-medium text-text-main mt-2">Update your password and manage security preferences</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main uppercase tracking-widest pl-1">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={20} />
                      <input
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                        className="w-full pl-12 pr-5 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner transition-all placeholder-gray-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-main uppercase tracking-widest pl-1">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-400 transition-colors" size={20} />
                      <input
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-5 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner transition-all placeholder-gray-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-glass-border">
                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="group flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-obsidian-950 font-bold uppercase tracking-wider text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />}
                    Update Password
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
