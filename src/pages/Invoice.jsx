import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, Printer, Download, ArrowLeft, Loader2, CheckCircle2, Clock, Truck, Package } from 'lucide-react';

const Invoice = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [storeSettings, setStoreSettings] = useState({ storeName: '', address: '', gstNumber: '', phone: '' });
    const invoiceRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orderSnap, storeSnap] = await Promise.all([
                    getDoc(doc(db, 'orders', orderId)),
                    getDoc(doc(db, 'settings', 'store')),
                ]);
                if (orderSnap.exists()) {
                    setOrder({ id: orderSnap.id, ...orderSnap.data() });
                }
                if (storeSnap.exists()) {
                    setStoreSettings(storeSnap.data());
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderId]);

    const handlePrint = () => {
        window.print();
    };

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
                    <h2 className="text-2xl font-display font-bold text-text-main mb-4">Invoice Not Found</h2>
                    <p className="text-text-main mb-8">The requested invoice could not be located in our records.</p>
                    <button onClick={() => navigate('/')} className="w-full bg-white/5 hover:bg-white/10 text-text-main font-bold py-3 rounded-xl border border-glass-border transition-all">
                        Return to Store
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary font-sans text-text-main pb-20 print:bg-white print:text-black">
            {/* Action Header - Hidden on Print */}
            <header className="glass border-b-0 border-glass-border sticky top-0 z-50 print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-bold text-text-main hover:text-text-main transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-obsidian-950 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] transform hover:-translate-y-0.5"
                        >
                            <Printer size={18} />
                            <span>Print Invoice</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-12 lg:py-20">
                <div ref={invoiceRef} className="glass-panel border-glass-border shadow-2xl relative overflow-hidden p-8 lg:p-16 print:border-0 print:shadow-none print:p-0 print:bg-white bg-primary">
                    {/* Header Accents */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 print:hidden"></div>

                    {/* Invoice Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-gold-500 p-2 rounded-xl print:bg-black print:text-text-main">
                                    <Shield size={28} className="text-obsidian-950 print:text-text-main" />
                                </div>
                                <h1 className="text-3xl font-display font-black text-text-main tracking-widest uppercase print:text-black">{storeSettings.storeName || 'PREMIUM OIL'}</h1>
                            </div>
                            <div className="text-sm font-medium text-text-main space-y-1 print:text-black">
                                {storeSettings.address && <p style={{ whiteSpace: 'pre-line' }}>{storeSettings.address}</p>}
                                {storeSettings.gstNumber && <p>GSTIN: {storeSettings.gstNumber}</p>}
                                {storeSettings.phone && <p>Contact: {storeSettings.phone}</p>}
                            </div>
                        </div>

                        <div className="text-right md:text-right w-full md:w-auto">
                            <h2 className="text-5xl font-display font-black text-text-main/10 mb-2 tracking-tighter uppercase print:text-black/20">Tax Invoice</h2>
                            <div className="space-y-2 mt-6">
                                <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold-500 print:text-black">Invoice No</p>
                                <p className="text-xl font-mono font-bold text-text-main print:text-black">#{order.id.slice(0, 12).toUpperCase()}</p>
                                <div className="pt-4">
                                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 print:text-black">Date</p>
                                    <p className="text-text-main font-medium print:text-black">
                                        {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 border-t border-glass-border pt-12 print:border-black/10">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gold-500 mb-4 print:text-black">Bill To</h3>
                            <div className="space-y-2">
                                <p className="text-xl font-bold text-text-main print:text-black">{order.customerName}</p>
                                <p className="text-text-main font-medium leading-relaxed max-w-xs print:text-black">{order.address}</p>
                                <p className="text-text-main font-medium print:text-black">{order.phone}</p>
                                <p className="text-text-main font-medium print:text-black">{order.email}</p>
                            </div>
                        </div>
                        <div className="md:text-right">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gold-500 mb-4 print:text-black">Payment Info</h3>
                            <div className="space-y-2">
                                <p className="text-text-main font-medium print:text-black">Method: <span className="text-text-main font-bold print:text-black">{order.paymentMethod}</span></p>
                                <p className="text-text-main font-medium print:text-black">Status: <span className={`font-bold print:text-black ${order.paymentStatus === 'Completed' ? 'text-green-400' : 'text-amber-400'}`}>{order.paymentStatus}</span></p>
                                {order.paymentDetails?.upiId && <p className="text-text-main font-medium print:text-black">UPI ID: {order.paymentDetails.upiId}</p>}
                                {order.paymentDetails?.cardLast4 && <p className="text-text-main font-medium print:text-black">Card ending in: {order.paymentDetails.cardLast4}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-16 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-glass-border print:border-black">
                                    <th className="py-4 text-xs font-black uppercase tracking-widest text-gray-500 print:text-black">Description</th>
                                    <th className="py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-center print:text-black">Price</th>
                                    <th className="py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-center print:text-black">Qty</th>
                                    <th className="py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right print:text-black">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 print:divide-black/10">
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-6">
                                            <p className="text-text-main font-bold text-lg print:text-black">{item.name}</p>
                                            <p className="text-gray-500 text-sm print:text-black">Premium Grade Quality</p>
                                        </td>
                                        <td className="py-6 text-center text-text-main font-medium print:text-black">₹{item.price.toFixed(2)}</td>
                                        <td className="py-6 text-center text-text-main font-medium print:text-black">{item.quantity}</td>
                                        <td className="py-6 text-right text-text-main font-bold print:text-black">₹{(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex flex-col items-end gap-3 border-t border-glass-border pt-12 print:border-black">
                        <div className="flex justify-between w-64 text-sm font-medium text-text-main print:text-black">
                            <span>Subtotal</span>
                            <span className="text-text-main print:text-black">₹{order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-64 text-sm font-medium text-text-main print:text-black">
                            <span>Delivery Fee</span>
                            <span className="text-green-400 font-bold uppercase tracking-wider print:text-black">Free</span>
                        </div>
                        <div className="flex justify-between w-64 text-sm font-medium text-text-main print:text-black">
                            <span>GST (0%)</span>
                            <span className="text-text-main print:text-black">₹0.00</span>
                        </div>
                        <div className="flex justify-between w-64 pt-6 mt-3 border-t border-glass-border print:border-black/10">
                            <span className="text-xl font-display font-black text-text-main uppercase tracking-widest print:text-black">Total</span>
                            <span className="text-3xl font-display font-black text-gold-500 print:text-black">₹{order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer Notes */}
                    <div className="mt-20 pt-12 border-t border-glass-border space-y-4 print:border-black/10">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 print:text-black">Terms & Conditions</h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium print:text-black">
                            1. Goods once sold will not be taken back. <br />
                            2. Subject to local jurisdiction. <br />
                            3. This is a computer-generated invoice and doesn't require a physical signature.
                        </p>
                        <div className="text-center pt-12">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-main/20 print:text-black/50">Thank you for your patronage</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Invoice;
