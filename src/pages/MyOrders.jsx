import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Package, Calendar, MapPin, ChevronRight, ShoppingBag, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                navigate('/'); // Redirect if not logged in
            } else {
                setUser(currentUser);
                fetchOrders(currentUser);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchOrders = async (currentUser) => {
        try {
            let q;
            const ordersRef = collection(db, 'orders');

            if (currentUser?.uid) {
                // Prefer querying by User ID if available
                q = query(ordersRef, where('userId', '==', currentUser.uid));
            } else {
                // Fallback to email
                q = query(ordersRef, where('email', '==', currentUser.email));
            }

            const querySnapshot = await getDocs(q);
            const ordersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side sorting to avoid composite index requirement
            ordersList.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA; // Descending order
            });

            setOrders(ordersList);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-primary">
                <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary font-sans text-text-main pb-20">
            {/* Header (Simplified) */}
            <header className="glass border-b-0 border-glass-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform group-hover:scale-105">
                            <Shield size={24} className="text-obsidian-950" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-display font-bold text-text-main tracking-wide">Sudha Oil Mill</h1>
                        </div>
                    </Link>
                    <Link to="/" className="text-text-main hover:text-gold-400 transition-colors flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                        <span className="hidden sm:inline">Back to Shop</span>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-gradient-to-br from-gold-400/20 to-gold-600/20 rounded-lg text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                        <ShoppingBag size={28} />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-text-main tracking-wide">My Orders</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center border border-glass-border shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>
                        <div className="bg-primary border border-glass-border w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Package size={40} className="text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-text-main mb-3">No orders found</h3>
                        <p className="text-text-main mb-8 max-w-sm mx-auto leading-relaxed">It seems you haven't placed an order yet. Browse our premium selection to get started.</p>
                        <Link to="/" className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all transform hover:-translate-y-1 uppercase tracking-wider">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6 lg:space-y-8">
                        {orders.map((order) => (
                            <div key={order.id} className="glass-panel border-glass-border overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 relative group">
                                <div className="absolute top-0 w-full left-0 h-[2px] bg-gradient-to-r from-gold-400/0 via-gold-400/50 to-gold-400/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Order Header */}
                                <div className="bg-white/[0.02] px-6 py-5 border-b border-glass-border flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm">
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase tracking-widest font-semibold mb-1">Order Placed</span>
                                            <span className="font-medium text-text-main flex items-center gap-2">
                                                <Calendar size={14} className="text-gold-400" />
                                                {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Just now'}
                                            </span>
                                        </div>
                                        <div className="hidden sm:block h-10 w-px bg-white/10"></div>
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase tracking-widest font-semibold mb-1">Order ID</span>
                                            <span className="font-mono font-medium text-text-main">#{order.id.slice(0, 8)}</span>
                                        </div>
                                        <div className="hidden sm:block h-10 w-px bg-white/10"></div>
                                        <div>
                                            <span className="block text-gray-500 text-xs uppercase tracking-widest font-semibold mb-1">Total Amount</span>
                                            <span className="font-bold text-gold-400 text-base">₹{order.total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-inner ${order.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                        {order.status || 'Processing'}
                                    </div>
                                    <div className="flex gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
                                        <Link
                                            to={`/invoice/${order.id}`}
                                            className="flex-1 sm:flex-none text-center px-4 py-2 bg-white/5 border border-glass-border rounded-lg text-xs font-bold uppercase tracking-widest text-text-main hover:text-text-main hover:bg-white/10 transition-all"
                                        >
                                            Invoice
                                        </Link>
                                        <Link
                                            to={`/tracking/${order.id}`}
                                            className="flex-1 sm:flex-none text-center px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-lg text-xs font-bold uppercase tracking-widest text-gold-400 hover:bg-gold-500/20 transition-all"
                                        >
                                            Track Order
                                        </Link>
                                    </div>
                                </div>

                                {/* Tracking / Address Info */}
                                <div className="px-6 py-4 border-b border-glass-border flex items-start gap-3 bg-primary">
                                    <MapPin size={18} className="text-gold-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-text-main leading-relaxed font-light">
                                        <span className="font-semibold text-text-main uppercase tracking-wider text-xs mr-2">Delivery to:</span> {order.address}
                                    </p>
                                </div>

                                {/* Items */}
                                <div className="p-6">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Items Summary</h4>
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-5 p-3 rounded-xl border border-glass-border hover:border-glass-border hover:bg-white/[0.02] transition-colors">
                                                <div className="h-20 w-20 bg-primary rounded-lg shrink-0 overflow-hidden flex items-center justify-center border border-glass-border">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover mix-blend-screen" />
                                                    ) : (
                                                        <Package size={24} className="text-gray-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-text-main mb-1 truncate text-base">{item.name}</h5>
                                                    <p className="text-sm text-gray-500 font-medium">Qty: <span className="text-text-main">{item.quantity}</span> × ₹{item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right pl-4">
                                                    <span className="font-bold text-gold-400 text-lg">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyOrders;
