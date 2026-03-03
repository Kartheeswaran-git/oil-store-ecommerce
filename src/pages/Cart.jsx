import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, Shield } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState(() => {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  });

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const cart = [...cartItems];
    const itemIndex = cart.findIndex(item => item.id === id);

    if (itemIndex > -1) {
      cart[itemIndex].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      setCartItems(cart);
    }
  };

  const removeItem = (id) => {
    const cart = cartItems.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartItems(cart);
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      localStorage.removeItem('cart');
      setCartItems([]);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-primary font-sans text-text-main">
        <header className="glass border-b-0 border-glass-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 lg:py-5">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  <Shield size={24} className="text-obsidian-950" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-text-main tracking-wide">Premium Oil Store</h1>
                </div>
              </Link>
              <Link to="/" className="text-text-main hover:text-gold-400 transition-colors flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                <ArrowLeft size={18} />
                Continue Shopping
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto text-center glass-panel p-12 border border-glass-border shadow-2xl">
            <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-glass-border">
              <ShoppingCart size={40} className="text-gold-500/50" />
            </div>
            <h2 className="text-3xl font-display font-bold text-text-main mb-4">Your Cart is Empty</h2>
            <p className="text-text-main mb-8 max-w-sm mx-auto leading-relaxed">Discover our collection of premium, cold-pressed oils. Add items to your cart to begin.</p>
            <Link
              to="/"
              className="inline-flex bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1"
            >
              Explore Collection
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary font-sans text-text-main">
      <header className="glass border-b-0 border-glass-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Shield size={24} className="text-obsidian-950" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-text-main tracking-wide">Premium Oil Store</h1>
              </div>
            </Link>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-text-main hover:text-gold-400 transition-colors flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Continue Shopping</span>
              </Link>
              <button
                onClick={clearCart}
                className="text-gray-500 hover:text-red-400 font-semibold text-sm transition-colors uppercase tracking-wider bg-white/5 hover:bg-red-500/10 px-4 py-2 rounded-lg"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-[1200px]">
        <h1 className="text-4xl font-display font-bold text-text-main mb-8 tracking-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="glass-panel border-glass-border overflow-hidden shadow-2xl">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 border-b border-glass-border last:border-b-0 group transition-colors hover:bg-white/[0.02]">
                  <div className="flex items-start space-x-6">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary rounded-xl flex items-center justify-center overflow-hidden border border-glass-border shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Shield size={32} className="text-gray-600" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between h-24 sm:h-32 py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-display font-bold text-text-main text-lg sm:text-xl line-clamp-1">{item.name}</h3>
                          <p className="text-gold-400 font-bold text-lg mt-1 tracking-wide">₹{item.price}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-4">
                        <div className="flex items-center space-x-1 bg-primary rounded-xl border border-glass-border p-1 w-fit">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-text-main hover:text-gold-400 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-bold w-10 text-center text-text-main font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-text-main hover:text-gold-400 transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right hidden sm:block">
                          <p className="text-xl font-display font-bold text-text-main bg-white/5 px-4 py-1.5 rounded-lg border border-glass-border">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass flex flex-col rounded-2xl border border-glass-border p-8 sticky top-32 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>

              <h2 className="text-2xl font-display font-bold text-text-main mb-8 tracking-wide">Order Summary</h2>

              <div className="space-y-5 mb-8 text-sm sm:text-base">
                <div className="flex justify-between items-center text-text-main">
                  <span>Subtotal</span>
                  <span className="font-bold text-text-main">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-text-main">
                  <span>Standard Shipping</span>
                  <span className="font-bold text-olive-400 bg-olive-900/30 px-2 py-0.5 rounded text-xs tracking-wider uppercase">Free</span>
                </div>
                <div className="flex justify-between items-center text-text-main">
                  <span>Taxes</span>
                  <span className="font-bold text-text-main">Included</span>
                </div>
                <div className="flex justify-between border-t border-glass-border pt-5 mt-2">
                  <span className="text-lg font-bold text-text-main uppercase tracking-wider">Total</span>
                  <span className="text-3xl font-display font-bold text-gradient">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mb-8 bg-primary p-4 rounded-xl border border-glass-border flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-gold-400/20 to-gold-600/20 rounded-lg shrink-0 text-gold-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-text-main text-sm mb-1">Guaranteed Authenticity</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    100% pure, unrefined, and cold-pressed oils. Verified and certified for quality.
                  </p>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 text-center py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1 active:scale-95 uppercase tracking-wide"
              >
                Proceed to Checkout
              </Link>

              <p className="text-xs text-gray-500 text-center mt-6 tracking-wide">
                By purchasing, you agree to our <span className="text-gold-400/70 hover:text-gold-400 cursor-pointer transition-colors">Terms of Service</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;