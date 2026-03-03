import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, serverTimestamp, getDocs, query, where, getDoc, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Shield, CheckCircle, ArrowLeft, CreditCard, Smartphone, Landmark, Banknote, QrCode, CreditCard as CardIcon } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Generate a unique tracking ID  e.g. TRK-20260228-A3F9
  const generateTrackingId = () => {
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TRK-${datePart}-${randPart}`;
  };

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    bankName: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch saved user details
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData(prev => ({
              ...prev,
              customerName: userData.name || currentUser.displayName || '',
              email: userData.email || currentUser.email || '',
              phone: userData.phone || '',
              address: userData.address || '',
              city: userData.city || '',
              pincode: userData.pincode || ''
            }));
          } else {
            // Fallback if doc doesn't exist yet
            setFormData(prev => ({
              ...prev,
              customerName: currentUser.displayName || '',
              email: currentUser.email || ''
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    instructions: ''
  });

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Load cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);

    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);

    // If direct buy from product page
    if (location.state?.product) {
      setCartItems([location.state.product]);
      setTotalAmount(location.state.product.price * location.state.product.quantity);
    }
  }, [location]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentDetailsChange = (e) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Basic validation
    if (!formData.customerName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      alert('Please fill in all shipping details');
      return;
    }

    setLoading(true);

    try {
      // Save/Update User Profile with latest address
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          name: formData.customerName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // Generate tracking ID
      const newTrackingId = generateTrackingId();

      // Create order object
      const orderData = {
        userId: user ? user.uid : null,
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        instructions: formData.instructions,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        total: totalAmount,
        status: 'Pending',
        trackingId: newTrackingId,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add payment-specific details (obfuscated for cards)
      if (paymentMethod === 'Card') {
        orderData.paymentDetails = {
          cardLast4: paymentDetails.cardNumber.slice(-4),
        };
      } else if (paymentMethod === 'UPI') {
        orderData.paymentDetails = {
          upiId: paymentDetails.upiId
        };
      } else if (paymentMethod === 'Net Banking') {
        orderData.paymentDetails = {
          bank: paymentDetails.bankName
        };
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);
      setTrackingId(newTrackingId);

      // Clear cart
      localStorage.removeItem('cart');

      // Show success
      setOrderPlaced(true);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !location.state?.product) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center font-sans text-text-main">
        <div className="text-center glass-panel p-12 max-w-md mx-auto relative overflow-hidden border border-glass-border shadow-2xl">
          <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>
          <h1 className="text-3xl font-display font-bold text-text-main mb-4 tracking-wide">Your cart is empty</h1>
          <p className="text-text-main mb-8 leading-relaxed">Add items to your cart before proceeding to checkout.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] w-full transform hover:-translate-y-1 uppercase tracking-wider"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-primary font-sans text-text-main">
        <header className="glass border-b-0 border-glass-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 lg:py-5">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform group-hover:scale-105">
                <Shield size={24} className="text-obsidian-950" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-text-main tracking-wide">Sudha Oil Mill</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="glass-panel text-center relative overflow-hidden p-8 border border-glass-border shadow-2xl">
              <div className="absolute top-0 w-full left-0 h-2 bg-gradient-to-r from-green-500 to-emerald-400"></div>

              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/10 rounded-full mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle size={48} className="text-green-400" />
              </div>

              <h1 className="text-4xl font-display font-bold text-text-main mb-4">Order Confirmed!</h1>
              <p className="text-text-main mb-8 max-w-md mx-auto text-lg leading-relaxed">
                Thank you for choosing Sudha Oil Mill. Your order is being securely processed.
              </p>

              <div className="bg-primary border border-glass-border rounded-2xl p-6 mb-8 text-left shadow-inner">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Order ID</p>
                    <p className="text-lg font-bold text-gold-400 font-mono tracking-wider">{orderId.slice(0, 10)}...</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Payment Method</p>
                    <p className="text-lg font-bold text-text-main">{paymentMethod}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-glass-border">
                  <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Tracking ID</p>
                  <p className="text-xl font-black text-gold-400 font-mono tracking-widest">{trackingId}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-glass-border">
                  <p className="text-sm text-text-main flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
                    We will send delivery updates to <span className="text-text-main font-medium">{formData.phone}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto">
                <button
                  onClick={() => navigate(`/tracking/${orderId}`)}
                  className="w-full bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 px-6 py-4 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1 uppercase tracking-wider"
                >
                  Track Order
                </button>
                <button
                  onClick={() => navigate(`/invoice/${orderId}`)}
                  className="w-full bg-white/5 border border-glass-border hover:bg-white/10 text-text-main px-6 py-4 rounded-xl font-bold text-sm transition-all uppercase tracking-wider"
                >
                  View Invoice
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="sm:col-span-2 w-full bg-transparent border border-glass-border hover:border-glass-border text-gray-500 hover:text-text-main px-8 py-3 rounded-xl font-bold text-xs transition-all uppercase tracking-widest"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const PaymentOption = ({ id, label, icon: Icon, description }) => (
    <div
      className={`p-5 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === id
        ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_15px_rgba(212,175,55,0.15)] relative overflow-hidden'
        : 'border-glass-border hover:border-glass-border bg-primary hover:bg-primary'
        }`}
      onClick={() => setPaymentMethod(id)}
    >
      {paymentMethod === id && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gold-500/20 to-transparent blur-xl"></div>
      )}
      <div className="flex items-center space-x-4 relative z-10">
        <div className={`p-3 rounded-xl transition-colors ${paymentMethod === id ? 'bg-gold-500 text-obsidian-950 shadow-lg' : 'bg-white/5 text-text-main border border-glass-border'}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className={`font-bold transition-colors ${paymentMethod === id ? 'text-gold-400' : 'text-text-main'}`}>{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary font-sans text-text-main pb-20">
      <header className="glass border-b-0 border-glass-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform group-hover:scale-105">
                <Shield size={24} className="text-obsidian-950" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-text-main tracking-wide">Sudha Oil Mill</h1>
              </div>
            </div>
            <button
              onClick={() => navigate('/cart')}
              className="text-text-main hover:text-gold-400 transition-colors flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Cart</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-[1200px]">
        <h1 className="text-4xl font-display font-bold text-text-main mb-8 tracking-tight">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information Form */}
            <div className="glass-panel rounded-2xl border border-glass-border p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>
              <h2 className="text-xl font-display font-bold text-text-main mb-8 flex items-center">
                <span className="w-8 h-8 bg-gold-500/10 text-gold-400 rounded-full flex items-center justify-center mr-3 text-sm border border-gold-500/20 shadow-[0_0_10px_rgba(212,175,55,0.2)]">1</span>
                Shipping Information
              </h2>

              <div className="space-y-6 form-dark">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-text-main transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-text-main transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-text-main transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-text-main transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-text-main transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">Complete Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 text-text-main transition-all outline-none resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Selection */}
            <div className="glass-panel rounded-2xl border border-glass-border p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>
              <h2 className="text-xl font-display font-bold text-text-main mb-8 flex items-center">
                <span className="w-8 h-8 bg-gold-500/10 text-gold-400 rounded-full flex items-center justify-center mr-3 text-sm border border-gold-500/20 shadow-[0_0_10px_rgba(212,175,55,0.2)]">2</span>
                Payment Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <PaymentOption
                  id="UPI"
                  label="UPI / QR Code"
                  icon={Smartphone}
                  description="Google Pay, PhonePe, Paytm"
                />
                <PaymentOption
                  id="Card"
                  label="Debit / Credit Card"
                  icon={CardIcon}
                  description="Visa, Mastercard, RuPay"
                />
                <PaymentOption
                  id="Net Banking"
                  label="Net Banking"
                  icon={Landmark}
                  description="All major Indian banks"
                />
                <PaymentOption
                  id="Cash on Delivery"
                  label="Cash on Delivery"
                  icon={Banknote}
                  description="Pay when you receive"
                />
              </div>

              {/* Payment Method Details */}
              <div className="bg-primary border border-glass-border rounded-xl p-6 relative overflow-hidden mt-6">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-500/5 blur-3xl rounded-full"></div>

                {paymentMethod === 'UPI' && (
                  <div className="space-y-6 text-center relative z-10">
                    <div className="mx-auto w-48 h-48 bg-white p-4 rounded-2xl border-4 border-gold-500/20 shadow-[0_0_20px_rgba(212,175,55,0.1)] flex items-center justify-center">
                      <div className="text-obsidian-950 flex flex-col items-center">
                        <QrCode size={120} />
                        <span className="text-[10px] font-bold mt-2 uppercase tracking-wider">SCAN TO PAY</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-2 text-left uppercase tracking-wider">Or Enter UPI ID</label>
                      <input
                        type="text"
                        name="upiId"
                        placeholder="username@bank"
                        value={paymentDetails.upiId}
                        onChange={handlePaymentDetailsChange}
                        className="w-full px-4 py-3 bg-primary border border-glass-border text-text-main rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all placeholder-gray-600"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="space-y-5 relative z-10 form-dark">
                    <div>
                      <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={paymentDetails.cardNumber}
                          onChange={handlePaymentDetailsChange}
                          className="w-full px-4 py-3 bg-primary border border-glass-border text-text-main rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all placeholder-gray-600"
                        />
                        <CardIcon className="absolute right-4 top-3.5 text-gray-500" size={20} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={paymentDetails.expiryDate}
                          onChange={handlePaymentDetailsChange}
                          className="w-full px-4 py-3 bg-primary border border-glass-border text-text-main rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all placeholder-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">CVV</label>
                        <input
                          type="password"
                          name="cvv"
                          placeholder="***"
                          maxLength="3"
                          value={paymentDetails.cvv}
                          onChange={handlePaymentDetailsChange}
                          className="w-full px-4 py-3 bg-primary border border-glass-border text-text-main rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none transition-all placeholder-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Net Banking' && (
                  <div className="space-y-4 relative z-10">
                    <label className="block text-sm font-semibold text-text-main mb-2 uppercase tracking-wider">Select Your Bank</label>
                    <div className="relative">
                      <select
                        name="bankName"
                        value={paymentDetails.bankName}
                        onChange={handlePaymentDetailsChange}
                        className="w-full px-4 py-3 bg-primary border border-glass-border text-text-main rounded-xl focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 outline-none appearance-none transition-all"
                      >
                        <option value="" className="bg-primary">Choose a bank...</option>
                        <option value="SBI" className="bg-primary">State Bank of India</option>
                        <option value="HDFC" className="bg-primary">HDFC Bank</option>
                        <option value="ICICI" className="bg-primary">ICICI Bank</option>
                        <option value="Axis" className="bg-primary">Axis Bank</option>
                        <option value="Kotak" className="bg-primary">Kotak Mahindra Bank</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-main">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Cash on Delivery' && (
                  <div className="flex items-start space-x-4 relative z-10 bg-gold-500/5 border border-gold-500/10 p-5 rounded-xl">
                    <div className="p-3 bg-gold-500 text-obsidian-950 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                      <Banknote size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gold-400">No Advance Payment Needed</p>
                      <p className="text-sm text-text-main mt-1 leading-relaxed">Pay <span className="font-bold text-text-main">₹{totalAmount.toFixed(2)}</span> with cash or UPI to the delivery executive when your order arrives.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white/5 rounded-2xl border border-glass-border p-8 mt-8">
              <h2 className="text-xl font-display font-bold text-text-main mb-6 tracking-wide">Order Items</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-primary border border-glass-border rounded-xl hover:border-glass-border transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center border border-glass-border overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Shield size={24} className="text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-text-main text-sm sm:text-base line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: <span className="text-text-main">{item.quantity}</span></p>
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap pl-4">
                      <p className="font-bold text-gold-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="glass flex flex-col rounded-2xl border border-glass-border p-8 sticky top-32 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>
              <h2 className="text-2xl font-display font-bold text-text-main mb-8 tracking-wide">Final Summary</h2>

              <div className="space-y-5 mb-8 text-sm sm:text-base">
                <div className="flex justify-between items-center text-text-main">
                  <span>Subtotal</span>
                  <span className="font-bold text-text-main">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-text-main">
                  <span>Shipping</span>
                  <span className="font-bold text-olive-400 bg-olive-900/30 px-2 py-0.5 rounded text-xs tracking-wider uppercase">Free</span>
                </div>
                {paymentMethod === 'Cash on Delivery' && (
                  <div className="flex justify-between items-center text-text-main">
                    <span>COD Fee</span>
                    <span className="font-bold text-text-main">₹0.00</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-glass-border pt-5 mt-2">
                  <span className="text-lg font-bold text-text-main uppercase tracking-wider">Payable Total</span>
                  <span className="text-3xl font-display font-bold text-gradient">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 py-4.5 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none uppercase tracking-wide flex items-center justify-center min-h-[56px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : `Pay ₹${totalAmount.toFixed(2)}`}
              </button>

              <div className="mt-8 flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2 text-xs text-text-main">
                  <Shield size={14} className="text-gold-400/70" />
                  <span>Secure 256-bit SSL encrypted checkout</span>
                </div>
                <div className="flex space-x-4 text-gray-600">
                  <CreditCard size={20} className="hover:text-gold-400 transition-colors" />
                  <Landmark size={20} className="hover:text-gold-400 transition-colors" />
                  <Smartphone size={20} className="hover:text-gold-400 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;