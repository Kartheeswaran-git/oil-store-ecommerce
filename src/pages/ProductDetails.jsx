import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingCart, Truck, Shield, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  }, [id]);

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.length);

    alert(`${quantity} ${product.name}(s) added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center font-sans text-text-main">
        <div className="text-center glass-panel p-12 max-w-md mx-auto relative overflow-hidden border border-glass-border shadow-2xl">
          <div className="absolute top-0 w-full left-0 h-1 bg-gradient-to-r from-red-500 to-rose-600"></div>
          <h1 className="text-3xl font-display font-bold text-text-main mb-4 tracking-wide">Product Not Found</h1>
          <p className="text-text-main mb-8 leading-relaxed">We couldn't find the product you're looking for.</p>
          <Link to="/" className="inline-flex bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] w-full transform hover:-translate-y-1 uppercase tracking-wider justify-center">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary font-sans text-text-main pb-20">
      {/* Header */}
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
                <span className="hidden sm:inline">Back to Shop</span>
              </Link>
              <Link to="/cart" className="relative text-text-main hover:text-gold-400 transition-colors p-2 hover:bg-white/5 rounded-xl">
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-text-main text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-obsidian-950">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-[1200px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Product Image Gallery Style */}
          <div className="glass-panel rounded-2xl p-8 border border-glass-border shadow-2xl relative group overflow-hidden sticky top-32">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="flex items-center justify-center h-[400px] sm:h-[500px] bg-primary rounded-xl border border-glass-border overflow-hidden relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain mix-blend-screen hover:scale-110 transition-transform duration-700 ease-out"
                />
              ) : (
                <Shield size={128} className="text-gray-600 opacity-50" />
              )}
            </div>
            {/* Image thumbnails placeholder if you want to expand later */}
            <div className="mt-6 flex space-x-4 overflow-x-auto pb-2 scrollbar-none">
              <div className="w-20 h-20 bg-primary border-2 border-gold-500/50 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.2)] shrink-0 cursor-pointer p-1">
                {product.imageUrl && <img src={product.imageUrl} alt="Thumbnail 1" className="w-full h-full object-contain mix-blend-screen" />}
              </div>
              {/* Add more thumbnails here dynamically if available */}
              <div className="w-20 h-20 bg-primary border border-glass-border rounded-xl overflow-hidden shrink-0 cursor-pointer hover:border-glass-border transition-colors p-1 flex items-center justify-center">
                <span className="text-xs text-gray-500">More</span>
              </div>
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="space-y-8 flex flex-col justify-center min-h-[500px]">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <span className="px-3 py-1 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                  {product.category}
                </span>
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">
                    Only {product.stock} left
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-text-main leading-tight tracking-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline space-x-4 mb-6">
                <p className="text-4xl sm:text-5xl font-display font-bold text-gradient">₹{product.price}</p>
                <span className={`text-sm font-semibold uppercase tracking-wider ${product.stock > 10 ? 'text-olive-400' : 'text-text-main'}`}>
                  {product.stock > 10 ? 'In Stock & Ready to Ship' : `${product.stock} Available`}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent w-full my-6"></div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-4 h-px bg-gold-500/50"></span>
                Product Description
              </h2>
              <p className="text-text-main leading-relaxed text-lg font-light max-w-2xl">
                {product.description || 'Experience the purity and richness of our premium, cold-pressed oils. Carefully extracted to retain maximum nutritional value and authentic flavor.'}
              </p>
            </div>

            <div className="glass bg-primary rounded-xl p-6 border border-glass-border shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main text-sm uppercase tracking-wider">Premium Shipping</h3>
                    <p className="text-xs text-olive-400 font-semibold tracking-wide">Free across Tamil Nadu | COD Available</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-2.5 text-sm text-text-main">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Expedited 2-3 day delivery</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> Secure, temperature-controlled packaging</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span> 100% Quality Assurance Certificate included</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-glass-border">
              <div className="mb-6">
                <label className="block text-sm font-bold text-text-main uppercase tracking-wider mb-3">
                  Select Quantity
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center bg-primary rounded-xl border border-glass-border p-1 w-fit shadow-inner">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white/5 text-text-main hover:text-gold-400 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold w-12 text-center text-text-main font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-white/5 text-text-main hover:text-gold-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    Maximum allowed: {product.stock}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 h-[60px]">
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-white/5 border border-glass-border hover:bg-white/10 hover:border-gold-500/30 text-text-main rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group h-full shadow-lg"
                >
                  <ShoppingCart size={20} className="text-text-main group-hover:text-gold-400 transition-colors" />
                  <span className="uppercase tracking-wide">Add to Cart</span>
                </button>
                <Link
                  to="/checkout"
                  state={{ product: { ...product, quantity } }}
                  className={`flex-1 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 rounded-xl font-bold text-lg flex items-center justify-center text-center transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1 uppercase tracking-wide h-full ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  Buy Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Promise / Features Grid */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-gold-400 uppercase tracking-widest mb-2">The Premium Difference</h2>
            <h3 className="text-3xl font-display font-bold text-text-main">Uncompromising Quality standard</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 rounded-2xl border border-glass-border hover:border-gold-500/20 transition-all text-center group shadow-xl">
              <div className="mx-auto w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.15)] border border-gold-500/20">
                <Shield size={28} className="text-gold-400" />
              </div>
              <h4 className="font-bold text-text-main text-lg mb-3 tracking-wide">100% Certified Pure</h4>
              <p className="text-text-main text-sm leading-relaxed">Sourced from the finest seeds, cold-pressed to perfection, and rigorously tested for purity.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-glass-border hover:border-gold-500/20 transition-all text-center group shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mx-auto w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.15)] border border-gold-500/20 relative z-10">
                <Shield size={28} className="text-gold-400" />
              </div>
              <h4 className="font-bold text-text-main text-lg mb-3 tracking-wide relative z-10">Artisanal Extraction</h4>
              <p className="text-text-main text-sm leading-relaxed relative z-10">Traditional cold-pressing methods ensure all natural nutrients and antioxidants are preserved.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-glass-border hover:border-gold-500/20 transition-all text-center group shadow-xl">
              <div className="mx-auto w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.15)] border border-gold-500/20">
                <Shield size={28} className="text-gold-400" />
              </div>
              <h4 className="font-bold text-text-main text-lg mb-3 tracking-wide">Satisfaction Guaranteed</h4>
              <p className="text-text-main text-sm leading-relaxed">Experience the authentic taste and health benefits, backed by our quality promise.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;