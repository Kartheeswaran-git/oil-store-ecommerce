import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Truck, CheckCircle, Package, AlertCircle } from 'lucide-react';

const AdminTracking = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;

        setLoading(true);
        setError('');
        setOrderData(null);

        try {
            const q = query(collection(db, 'orders'), where('trackingNumber', '==', trackingNumber.trim()));
            const trackingSnapshot = await getDocs(q);

            if (!trackingSnapshot.empty) {
                setOrderData({ id: trackingSnapshot.docs[0].id, ...trackingSnapshot.docs[0].data() });
            } else {
                const idQuery = query(collection(db, 'orders'));
                const allOrders = await getDocs(idQuery);
                const matchedById = allOrders.docs.find(doc => doc.id === trackingNumber.trim());

                if (matchedById) {
                    setOrderData({ id: matchedById.id, ...matchedById.data() });
                } else {
                    setError('No order found with this tracking number or order ID.');
                }
            }
        } catch (err) {
            console.error('Error fetching tracking info:', err);
            setError('An error occurred while searching for the order.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return <CheckCircle className="text-green-500" size={32} />;
            case 'shipped': return <Truck className="text-blue-500" size={32} />;
            case 'packed': return <Package className="text-yellow-500" size={32} />;
            default: return <Package className="text-gray-400" size={32} />;
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-900 tracking-wide">Order Tracking</h1>
                <p className="text-gray-500 mt-2">Track customer shipments by Order ID or Tracking Number.</p>
            </div>

            {/* Search Input */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Enter Order ID or Tracking Number..."
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 text-gray-900 shadow-inner transition-all text-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !trackingNumber.trim()}
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md"
                    >
                        {loading ? 'Searching...' : 'Track'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}
            </div>

            {/* Results */}
            {orderData && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 animate-fade-in">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Order Details</p>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">#{orderData.id}</h2>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                            {getStatusIcon(orderData.status)}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-0.5">Current Status</p>
                                <p className="text-lg font-bold text-gray-900 capitalize">{orderData.status || 'Processing'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-gray-50 border border-gray-100">
                            <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-green-600" /> Delivery Information
                            </h3>
                            <p className="font-semibold text-gray-900 text-lg mb-1">{orderData.customerName}</p>
                            <p className="text-gray-600 mb-1">{orderData.email}</p>
                            <p className="text-gray-600 mb-4">{orderData.phone}</p>
                            <p className="text-gray-600 mt-4 leading-relaxed whitespace-pre-wrap pt-4 border-t border-gray-200">
                                <span className="font-semibold text-gray-900 block mb-1">Address:</span>
                                {orderData.address}
                            </p>
                        </div>

                        <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                    <Package size={18} className="text-green-600" /> Package Details
                                </h3>
                                {orderData.trackingNumber && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                                        <p className="font-mono text-lg font-bold text-gray-900">{orderData.trackingNumber}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Items</p>
                                    <p className="font-bold text-gray-900">{(orderData.items || orderData.cartItems || []).length} items</p>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-200">
                                <button
                                    onClick={() => navigate('/admin/orders')}
                                    className="w-full py-3 bg-white hover:bg-green-50 text-gray-900 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-xl font-bold transition-all shadow-sm"
                                >
                                    Manage Order
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AdminTracking;
