import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Eye, Users, Search, Mail, Phone, MapPin, Calendar, ArrowUpRight } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const customersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      // Sort client-side so users without createdAt are still shown
      customersList.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-text-main">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-text-main tracking-wide">Customers</h1>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="glass-panel p-4 rounded-xl border border-glass-border shadow-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main" size={20} />
              <input
                type="text"
                placeholder="Search customers by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-primary border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-text-main text-sm shadow-inner placeholder-gray-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-glass-border shadow-lg flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-green-400 text-xs font-bold uppercase tracking-wider">Total Customers</p>
            <h3 className="text-3xl font-display font-bold text-text-main mt-1">{customers.length}</h3>
          </div>
          <div className="bg-primary p-4 rounded-xl border border-glass-border shadow-inner relative z-10">
            <Users size={28} className="text-green-400" />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex justify-center py-12 bg-primary">
          <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl shadow-xl border border-glass-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-glass-border">
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Location</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Joined Date</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-text-main">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="bg-primary w-20 h-20 rounded-full flex items-center justify-center mb-2 border border-glass-border shadow-inner">
                          <Users size={36} className="text-gray-500" />
                        </div>
                        <p className="font-display font-bold text-xl text-text-main">No customers found</p>
                        <p className="text-sm font-medium">Try adjusting your search terms</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-green-400 font-display font-bold text-lg border border-glass-border shadow-inner group-hover:border-green-500/30 transition-colors">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <p className="text-base font-bold text-text-main tracking-wide">{customer.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">#{customer.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2 text-sm">
                          {customer.email && (
                            <div className="flex items-center gap-3 text-text-main">
                              <Mail size={16} className="text-green-400" />
                              <span className="truncate max-w-[180px] font-medium" title={customer.email}>{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-3 text-text-main">
                              <Phone size={16} className="text-olive-400" />
                              <span className="font-medium">{customer.phone}</span>
                            </div>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-gray-500 italic font-medium">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3 text-sm text-text-main max-w-[250px]">
                          <MapPin size={16} className="text-text-main mt-0.5 flex-shrink-0" />
                          <span className={!customer.address ? "italic text-gray-500 font-medium" : "font-medium leading-relaxed"}>
                            {customer.address ? (
                              customer.address.length > 50 ? customer.address.slice(0, 50) + '...' : customer.address
                            ) : 'No address provided'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 text-sm text-text-main font-medium">
                          <Calendar size={16} className="text-text-main" />
                          <span>{customer.createdAt?.toLocaleDateString() || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-gray-500 hover:text-green-400 p-2.5 rounded-lg hover:bg-green-500/10 transition-all border border-transparent hover:border-green-500/20 opacity-0 group-hover:opacity-100 focus:opacity-100" title="View Details">
                          <ArrowUpRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Placeholder */}
          {!loading && filteredCustomers.length > 0 && (
            <div className="bg-white/[0.02] px-6 py-4 border-t border-glass-border flex items-center justify-between text-sm text-text-main font-bold uppercase tracking-wider">
              <div>Showing {filteredCustomers.length} results</div>
              {/* Add pagination controls here if needed */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Customers;
