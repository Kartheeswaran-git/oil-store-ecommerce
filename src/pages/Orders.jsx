import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  X,
  Truck,
  FileText,
  TrendingUp,
  MapPin,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Packed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-gray-500/10 text-text-main border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={14} />;
      case 'Packed': return <Package size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      case 'Pending': return <Clock size={14} />;
      default: return <Package size={14} />;
    }
  };

  const statusOptions = ['Pending', 'Packed', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-text-main">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-text-main tracking-wide">Orders</h1>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-xl border border-glass-border shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main" size={18} />
          <input
            type="text"
            placeholder="Search orders, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-primary border border-glass-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-text-main text-sm shadow-inner placeholder-gray-500 transition-all"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-primary rounded-lg border border-glass-border shadow-inner">
            <Filter size={16} className="text-green-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none text-text-main font-medium cursor-pointer"
            >
              <option value="All" className="bg-primary text-text-main">All Status</option>
              {statusOptions.map(s => (
                <option key={s} value={s} className="bg-primary text-text-main">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

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
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest">Date</th>
                  <th className="px-6 py-5 text-xs font-bold text-text-main uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-text-main">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="bg-primary w-20 h-20 rounded-full flex items-center justify-center mb-2 border border-glass-border shadow-inner">
                          <Truck size={36} className="text-gray-500" />
                        </div>
                        <p className="font-display font-bold text-xl text-text-main">No orders found</p>
                        <p className="text-sm font-medium">Wait for new orders to come in</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5 font-mono text-xs font-semibold text-text-main uppercase tracking-widest">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-main tracking-wide">{order.customerName}</span>
                          <span className="text-xs text-gray-500 font-medium mt-1">{order.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className={`appearance-none pl-9 pr-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-obsidian-950 transition-colors ${getStatusColor(order.status)}`}
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s} className="bg-primary text-text-main">{s}</option>
                            ))}
                          </select>
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-80 flex items-center justify-center">
                            {getStatusIcon(order.status)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-bold text-green-400">₹{order.total}</span>
                      </td>
                      <td className="px-6 py-5 text-sm text-text-main font-medium">
                        {order.createdAt?.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/invoice/${order.id}`)}
                            title="View Invoice"
                            className="p-2 text-text-main hover:text-green-400 hover:bg-white/5 rounded-lg transition-all"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/tracking/${order.id}`)}
                            title="Track Shipment"
                            className="p-2 text-text-main hover:text-green-400 hover:bg-white/5 rounded-lg transition-all"
                          >
                            <Truck size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetails(true);
                            }}
                            title="View Details"
                            className="p-2 text-text-main hover:text-text-main hover:bg-white/5 rounded-lg transition-all"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary backdrop-blur-md">
          <div className="glass-panel rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-glass-border w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100 opacity-100">
            <div className="px-8 py-6 border-b border-glass-border flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-2xl font-display font-bold text-text-main tracking-wide">Order Details</h3>
                <p className="text-xs font-mono uppercase tracking-widest text-green-400 mt-1">#{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-text-main hover:text-text-main hover:bg-white/10 p-2.5 rounded-xl transition-all border border-transparent hover:border-glass-border"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="p-5 rounded-xl bg-primary border border-glass-border shadow-inner">
                  <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users size={14} className="text-green-400" /> Customer Info
                  </h4>
                  <p className="font-display font-bold text-text-main text-lg">{selectedOrder.customerName}</p>
                  <p className="text-sm font-medium text-text-main mt-1">{selectedOrder.email}</p>
                  <p className="text-sm font-medium text-text-main mt-1">{selectedOrder.phone}</p>
                </div>
                <div className="p-5 rounded-xl bg-primary border border-glass-border shadow-inner">
                  <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={14} className="text-green-400" /> Shipping Address
                  </h4>
                  <p className="text-sm font-medium text-text-main whitespace-pre-wrap leading-relaxed">{selectedOrder.address}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package size={14} className="text-green-400" /> Order Items
                </h4>
                <div className="bg-primary rounded-xl border border-glass-border shadow-inner overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.02] border-b border-glass-border">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-text-main uppercase tracking-wider text-xs">Item</th>
                        <th className="px-6 py-4 text-center font-bold text-text-main uppercase tracking-wider text-xs">Qty</th>
                        <th className="px-6 py-4 text-right font-bold text-text-main uppercase tracking-wider text-xs">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(selectedOrder.items || selectedOrder.cartItems) ? (selectedOrder.items || selectedOrder.cartItems).map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 font-bold text-text-main">{item.name}</td>
                          <td className="px-6 py-4 text-center font-medium text-text-main">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-bold text-text-main">₹{item.price}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-8 text-center text-gray-500 font-medium">No items data available</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-white/[0.02] border-t border-glass-border">
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-right font-bold text-text-main uppercase tracking-wider text-xs">Total Amount</td>
                        <td className="px-6 py-4 text-right font-display font-bold text-xl text-green-400">₹{selectedOrder.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl border border-glass-border">
                  <h4 className="text-xs font-bold text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp size={14} className="text-green-400" /> Update Order Status
                  </h4>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                      className={`flex-1 px-4 py-3 bg-primary rounded-xl border border-glass-border focus:outline-none focus:ring-2 focus:ring-green-500/50 text-sm font-bold shadow-inner ${getStatusColor(selectedOrder.status)}`}
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s} className="bg-primary text-text-main">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-glass-border flex flex-col justify-center gap-3">
                  <button
                    onClick={() => navigate(`/invoice/${selectedOrder.id}`)}
                    className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={18} /> Export Invoice
                  </button>
                  <button
                    onClick={() => navigate(`/tracking/${selectedOrder.id}`)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-text-main border border-glass-border rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Truck size={18} /> Track Shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

