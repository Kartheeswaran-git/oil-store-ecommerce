import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, Package, Truck, CheckCircle2, MapPin, Clock, ArrowLeft, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';

const Tracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'orders', orderId));
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const steps = [
        { id: 'Pending', label: 'Order Placed', icon: Clock, desc: 'We have received your order' },
        { id: 'Processing', label: 'Processing', icon: Shield, desc: 'Your oil is being quality-checked' },
        { id: 'Shipped', label: 'In Transit', icon: Truck, desc: 'Your premium blend is on its way' },
        { id: 'Delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Enjoy your liquid gold' }
    ];

    const getStatusIndex = (status) => {
        return steps.findIndex(step => step.id === status);
    };

    const currentIndex = getStatusIndex(order?.status || 'Pending');

    if (loading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <Loader2 className="animate-spin text-gold-500" size={48} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
                <div className="glass-panel p-12 text-center border border-glass-border shadow-2xl max-w-md w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-display font-bold text-text-main mb-4">Order Not Found</h2>
                    <p className="text-text-main mb-8">The tracking details for this order ID could not be retrieved.</p>
                    <button onClick={() => navigate('/')} className="w-full bg-white/5 hover:bg-white/10 text-text-main font-bold py-3 rounded-xl border border-glass-border transition-all">
                        Return to Store
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary font-sans text-text-main pb-20">
            {/* Header */}
            <header className="glass border-b-0 border-glass-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 lg:py-5 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform group-hover:scale-105">
                            <Shield size={24} className="text-obsidian-950" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-display font-bold text-text-main tracking-wide">Sudha Oil Mill</h1>
                    </Link>
                    <button onClick={() => navigate(-1)} className="text-text-main hover:text-text-main transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                        <ArrowLeft size={18} />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div>
                        <h1 className="text-4xl font-display font-black text-text-main mb-3 tracking-wide">Track Shipment</h1>
                        <p className="text-text-main flex items-center gap-2 font-mono">
                            Order ID: <span className="text-gold-500 font-bold uppercase tracking-wider">#{order.id.slice(0, 12)}</span>
                        </p>
                    </div>
                    <Link
                        to={`/invoice/${order.id}`}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-glass-border rounded-xl text-sm font-bold text-text-main hover:bg-white/10 hover:border-glass-border transition-all uppercase tracking-widest"
                    >
                        <Package size={18} className="text-gold-400" />
                        View Invoice
                    </Link>
                </div>

                {/* Tracking Timeline Card */}
                <div className="glass-panel border-glass-border shadow-2xl p-8 lg:p-12 relative overflow-hidden mb-12 bg-primary">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"></div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[24px] md:left-1/2 top-4 bottom-4 w-px bg-white/10 -translate-x-1/2 hidden md:block"></div>

                        <div className="space-y-12 relative z-10">
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentIndex;
                                const isCurrent = index === currentIndex;

                                return (
                                    <div key={step.id} className={`flex flex-col md:flex-row items-center gap-6 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                        {/* Content */}
                                        <div className={`flex-1 w-full text-center md:text-left ${index % 2 === 0 ? 'md:text-left md:pl-16' : 'md:text-right md:pr-16'}`}>
                                            <div className={`p-6 rounded-2xl border transition-all duration-500 ${isCurrent
                                                ? 'bg-gold-500/10 border-gold-500/30 shadow-[0_0_30px_rgba(212,175,55,0.1)]'
                                                : isCompleted
                                                    ? 'bg-white/5 border-glass-border opacity-70'
                                                    : 'bg-transparent border-glass-border opacity-30 grayscale'
                                                }`}>
                                                <h4 className={`text-xl font-display font-bold mb-2 ${isCompleted ? 'text-text-main' : 'text-gray-500'}`}>
                                                    {step.label}
                                                </h4>
                                                <p className="text-sm font-medium text-text-main">
                                                    {isCompleted ? step.desc : 'Pending processing'}
                                                </p>
                                                {isCurrent && (
                                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 text-gold-400 text-[10px] font-black uppercase tracking-widest">
                                                        Current Status
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Icon Circle */}
                                        <div className="relative flex items-center justify-center shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 z-20 transition-all duration-500 ${isCompleted
                                                ? 'bg-primary border-gold-500 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                                : 'bg-primary border-glass-border'
                                                }`}>
                                                <step.icon size={20} className={isCompleted ? 'text-gold-400' : 'text-gray-600'} />
                                            </div>
                                            {/* Pulse effect for current state */}
                                            {isCurrent && (
                                                <div className="absolute inset-0 bg-gold-400/20 rounded-full animate-ping z-10"></div>
                                            )}
                                        </div>

                                        <div className="flex-1 hidden md:block"></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Delivery Details Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="glass-panel p-8 border-glass-border bg-primary h-full">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gold-500 mb-6 flex items-center gap-2">
                            <MapPin size={16} /> Destination
                        </h3>
                        <div className="space-y-2">
                            <p className="text-xl font-bold text-text-main">{order.customerName}</p>
                            <p className="text-text-main font-medium leading-relaxed">{order.address}</p>
                            <p className="text-text-main font-medium pt-2">{order.phone}</p>
                        </div>
                    </div>

                    <div className="glass-panel p-8 border-glass-border bg-primary h-full">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gold-500 mb-6 flex items-center gap-2">
                            <ShoppingBag size={16} /> Summary
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-glass-border">
                                <span className="text-text-main font-medium">Items</span>
                                <span className="text-text-main font-bold">{order.items.reduce((sum, i) => sum + i.quantity, 0)} Units</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-glass-border">
                                <span className="text-text-main font-medium">Total Value</span>
                                <span className="text-gold-400 font-black text-lg">₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Support */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-widest">Need real-time assistance?</p>
                    <a href="tel:+918608605264" className="inline-flex items-center gap-3 px-8 py-3.5 bg-white/5 hover:bg-white/10 text-text-main rounded-xl border border-glass-border font-black text-sm transition-all uppercase tracking-widest group">
                        <Truck size={18} className="group-hover:translate-x-1 transition-transform" />
                        Contact Delivery Partner
                    </a>
                </div>
            </main>
        </div>
    );
};

export default Tracking;
