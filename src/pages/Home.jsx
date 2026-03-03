import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth } from '../firebase';
import { ShoppingCart, Search, Filter, Shield, Truck, Award, Phone, Mail, MapPin, Loader2, Menu, X, User, LogOut, LogIn, Sun, Moon, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const navigate = useNavigate();

  // Auth State
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Load cart from localStorage
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, 'products'));
    const productsList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProducts(productsList);
  };

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const categoriesList = snapshot.docs.map(doc => doc.data().name);
    setCategories(['All', ...categoriesList]);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const addToCart = async (product) => {
    setCartLoading(product.id);
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      setCartCount(cart.length);
      // Small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      alert(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setCartLoading(null);
    }
  };

  const handleBuyNow = (product) => {
    navigate('/checkout', {
      state: {
        product: {
          ...product,
          quantity: 1
        }
      }
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: loginName,
          email: loginEmail,
          role: 'customer',
          createdAt: serverTimestamp()
        });

        alert("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      }
      setShowLoginModal(false);
      setLoginName('');
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error("Auth error:", error);
      setLoginError(error.message.replace('Firebase: ', ''));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        role: 'customer',
        lastLogin: serverTimestamp()
      }, { merge: true });

      setShowLoginModal(false);
    } catch (error) {
      console.error("Google Auth error:", error);
      setLoginError(error.message.replace('Firebase: ', ''));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCartCount(0);
      navigate('/logged-out');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // const features = [
  // {
  //   icon: <Shield className="text-primary-600" size={32} />,
  //   title: 'Certified Quality',
  //   description: 'All products meet Tamil Nadu fire safety standards'
  // },
  // {
  //   icon: <Truck className="text-primary-600" size={32} />,
  //   title: 'Across Tamil Nadu',
  //   description: 'Delivery to all districts in Tamil Nadu'
  // },
  // {
  //   icon: <Award className="text-primary-600" size={32} />,
  //   title: 'Expert Support',
  //   description: '24/7 technical support from fire safety experts'
  // },
  // {
  //   icon: <Phone className="text-primary-600" size={32} />,
  //   title: 'Emergency Orders',
  //   description: 'Priority delivery for emergency requirements'
  // }
  // ];

  return (
    <div className="min-h-screen bg-primary font-sans text-text-main transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full glass z-50 shadow-2xl transition-all duration-300 m-0 p-0">
        <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <Shield size={24} className="text-obsidian-950" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-display font-bold text-text-main tracking-wide transition-colors">Sudha Oil Mill</h1>
              </div>
            </Link>

            {/* Desktop Navigation & Search */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
              <div className="relative w-full group focus-within:ring-1 focus-within:ring-gold-500/50 rounded-xl transition-all">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub group-focus-within:text-gold-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search premium oils & blends..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-primary/20 border border-glass-border focus:bg-secondary focus:border-gold-500/50 rounded-xl outline-none transition-all placeholder:text-text-sub text-sm text-text-main shadow-inner"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-text-sub hover:text-gold-400 hover:bg-white/5 transition-all group"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <Link to="/admin" className="text-sm font-semibold text-text-sub hover:text-gold-400 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all tracking-wide uppercase">
                Admin
              </Link>

              {user && (
                <Link to="/my-orders" className="text-sm font-semibold text-text-main hover:text-gold-400 px-4 py-2.5 rounded-xl hover:bg-gold-500/10 transition-all">
                  My Orders
                </Link>
              )}

              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-text-main hover:text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-500/10 transition-all flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm font-bold text-obsidian-950 bg-gold-500 hover:bg-gold-400 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transform hover:-translate-y-0.5"
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </button>
              )}
              <Link to="/cart" className="relative p-3 text-text-main hover:text-gold-400 hover:bg-gold-500/10 rounded-xl transition-all group ml-2 border border-transparent hover:border-glass-border">
                <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-gold-400 to-gold-600 text-obsidian-950 text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(212,175,55,0.6)] ring-2 ring-primary">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-text-main"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-glass-border bg-secondary/95 backdrop-blur-xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub group-focus-within:text-gold-400 transition-colors" />
              <input
                type="text"
                placeholder="Search premium oils..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-primary/20 border border-glass-border rounded-xl outline-none text-text-main placeholder:text-text-sub focus:border-gold-500/50 transition-all shadow-inner"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/cart" className="flex items-center gap-4 px-5 py-4 bg-primary/20 border border-glass-border rounded-2xl text-text-sub hover:text-text-main transition-all">
                <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400">
                  <ShoppingCart size={20} />
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">Cart ({cartCount})</span>
              </Link>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-4 px-5 py-4 bg-primary/20 border border-glass-border rounded-2xl text-text-sub hover:text-text-main transition-all"
              >
                <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              {user && (
                <Link to="/my-orders" className="flex items-center gap-4 px-5 py-4 bg-primary/20 border border-glass-border rounded-2xl text-text-sub hover:text-text-main transition-all">
                  <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400">
                    <ShoppingCart size={20} />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-xs">My Orders</span>
                </Link>
              )}
              <Link to="/admin" className="flex items-center gap-4 px-5 py-4 bg-primary/20 border border-glass-border rounded-2xl text-text-sub hover:text-text-main transition-all">
                <div className="p-2 bg-gold-500/10 rounded-lg text-gold-400">
                  <Shield size={20} />
                </div>
                <span className="font-bold uppercase tracking-widest text-xs">Admin Portal</span>
              </Link>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-5 py-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <LogOut size={20} />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-xs">Logout Session</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-4 px-5 py-4 bg-gold-500 text-obsidian-950 rounded-2xl font-black transition-all shadow-lg active:scale-95"
                >
                  <LogIn size={20} />
                  <span className="uppercase tracking-widest text-xs">Login / Join Now</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        {/* Modern high-fashion background */}
        <div className="absolute inset-0 bg-primary z-0" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.12),transparent_60%)] z-0" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold-400/5 rounded-full blur-[140px] z-0 animate-pulse-slow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="max-w-4xl space-y-10 animate-fade-in-up">

              <h1 className="text-6xl md:text-8xl font-display font-black text-text-main leading-[1.05] tracking-tight">
                Pure Essence, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 drop-shadow-sm">Golden Wellness</span>
              </h1>
              <p className="text-xl text-text-sub max-w-2xl mx-auto leading-relaxed font-medium">
                Experience the world's finest wood-pressed oils. Meticulously crafted for those who demand uncompromising purity and traditional excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                <button className="px-12 py-6 bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(212,175,55,0.3)] hover:shadow-[0_25px_50px_rgba(212,175,55,0.45)] transition-all transform hover:-translate-y-2 active:scale-95">
                  Explore Collection
                </button>
                <button className="px-12 py-6 bg-secondary/50 hover:bg-gold-500/5 border border-glass-border text-text-main rounded-2xl font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4 group">
                  <span>Our Process</span>
                  <ArrowRight size={20} className="text-gold-500 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid
      <section className="py-20 bg-primary border-y border-glass-border relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group flex flex-col items-center text-center gap-5 p-8 rounded-3xl glass-panel border border-glass-border hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-2">
                <div className="p-4 bg-gold-500/10 rounded-2xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                  {React.cloneElement(feature.icon, { className: 'text-gold-400', size: 32 })}
                </div>
                <div>
                  <h3 className="font-display font-bold text-text-main text-lg mb-2 tracking-wide uppercase">{feature.title}</h3>
                  <p className="text-sm font-medium text-text-main leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Products Section */}
      <section id="products" className="py-32 bg-primary relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 space-y-5">
            <h2 className="text-5xl md:text-6xl font-display font-black text-text-main tracking-tight">Curation of <span className="text-gold-500 italic">Excellence</span></h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded-full shadow-[0_5px_15px_rgba(212,175,55,0.4)]" />
            <p className="max-w-2xl mx-auto text-text-sub font-medium text-lg">Discover our artisanal range of oils, each drop processed at room temperature to preserve maximum nutrients and flavor.</p>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex flex-wrap justify-center pb-10 mb-12 gap-3">
            {categories.map((cat) => (
              <button
                key={typeof cat === 'string' ? cat : cat.id}
                onClick={() => setSelectedCategory(typeof cat === 'string' ? cat : cat.name)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border
                  ${selectedCategory === (typeof cat === 'string' ? cat : cat.name)
                    ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
                  }`}
              >
                {typeof cat === 'string' ? cat : cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 size={48} className="animate-spin text-gold-500" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32 glass-panel border border-glass-border">
              <div className="bg-white/5 p-5 rounded-full inline-block mb-4 border border-glass-border shadow-inner">
                <Search size={40} className="text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-text-main font-display mb-2">No products found</h3>
              <p className="text-text-main">Try exploring a different category or refining your search.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col items-center bg-white border border-glass-border rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(74,222,128,0.15)] hover:-translate-y-2 p-4"
                  >
                    {/* Product Image Wrapper */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-primary/30 mb-6">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Floating badge */}
                      {product.category && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md border border-glass-border text-green-700 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                          {product.category}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="w-full space-y-3 px-2 flex flex-col flex-1">
                      <div className="flex items-center justify-center gap-1 text-gold-500 mb-1">
                        {[1, 2, 3, 4, 5].map(star => <Award key={star} size={12} fill="currentColor" />)}
                      </div>

                      <h3 className="text-xl font-display font-black text-text-main group-hover:text-green-600 transition-colors uppercase tracking-tight leading-tight line-clamp-2">{product.name}</h3>

                      <div className="mt-auto pt-6 w-full flex flex-col gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-text-sub font-black uppercase tracking-[0.2em] opacity-60 mb-1">Price</span>
                          <span className="text-2xl font-display font-black text-green-600">₹{product.price}</span>
                        </div>

                        <button
                          onClick={() => addToCart(product)}
                          disabled={cartLoading === product.id}
                          className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] font-bold tracking-wide uppercase text-sm flex items-center justify-center gap-2"
                        >
                          {cartLoading === product.id ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <>
                              <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform duration-500" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      const showPage = pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                      if (!showPage) {
                        // Show ellipsis
                        if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                          return <span key={pageNumber} className="px-2 text-slate-400">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === pageNumber
                            ? 'bg-slate-900 text-text-main shadow-md'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-xl">
                <Shield size={22} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Sudha Oil Mill</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Elevating your lifestyle with the world's most exquisite oils. Certified purity, sustainably sourced, and delivered with excellence.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm mb-5 tracking-widest uppercase border-b border-gray-100 pb-3">
              Quick Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Collections
                </Link>
              </li>
              <li>
                <a href="#about" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Our Story
                </a>
              </li>
              <li>
                <Link to="/cart" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="text-gray-500 hover:text-green-600 transition-colors text-sm font-medium flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Pure Contact */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm mb-5 tracking-widest uppercase border-b border-gray-100 pb-3">
              Pure Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <div className="p-1.5 bg-green-50 rounded-lg mt-0.5">
                  <Phone size={14} className="text-green-600 shrink-0" />
                </div>
                <span>+91 0000000000</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <div className="p-1.5 bg-green-50 rounded-lg mt-0.5">
                  <Mail size={14} className="text-green-600 shrink-0" />
                </div>
                <span>xxx@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <div className="p-1.5 bg-green-50 rounded-lg mt-0.5">
                  <MapPin size={14} className="text-green-600 shrink-0" />
                </div>
                <span className="leading-relaxed">Your address here</span>
              </li>
            </ul>
          </div>

          {/* Priority Support */}
          <div>
            <h3 className="text-gray-900 font-bold text-sm mb-5 tracking-widest uppercase border-b border-gray-100 pb-3">
              Priority Support
            </h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Need immediate assistance with a bulk order or custom blend?
            </p>
            <a
              href="tel:+910000000000"
              className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm group"
            >
              <Phone size={16} className="group-hover:animate-pulse" />
              Call Direct Line
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p className="font-medium text-green-600">Pure Excellence · Certified Quality</p>
        </div>
      </footer>


      {/* Login Modal */}
      {/* Login Modal Overlay */}
      {
        showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary backdrop-blur-md transition-opacity">
            <div className="bg-primary glass border border-glass-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all relative">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-text-main p-1 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-br from-gold-400 to-gold-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20">
                    <User size={28} className="text-obsidian-950" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-text-main">{isSignUp ? 'Join the Club' : 'Welcome Back'}</h2>
                  <p className="text-text-main text-sm mt-2 font-medium">
                    {isSignUp ? 'Experience premium collections & rewards' : 'Access your premium account'}
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loginLoading}
                    className="w-full bg-white/5 border border-glass-border hover:bg-white/10 hover:border-glass-border text-text-main py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-3 backdrop-blur-sm shadow-inner"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-glass-border"></div>
                    </div>
                    <span className="relative bg-primary px-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Or use email</span>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-5">
                    {isSignUp && (
                      <div>
                        <label className="block text-xs font-bold text-text-main mb-1.5 uppercase tracking-wider ml-1">Full Name</label>
                        <input
                          type="text"
                          value={loginName}
                          onChange={(e) => setLoginName(e.target.value)}
                          className="w-full px-4 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium text-text-main placeholder:text-gray-600 shadow-inner"
                          placeholder="Elizabeth Windsor"
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-text-main mb-1.5 uppercase tracking-wider ml-1">Email Address</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium text-text-main placeholder:text-gray-600 shadow-inner"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-main mb-1.5 uppercase tracking-wider ml-1">Password</label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-all font-medium text-text-main placeholder:text-gray-600 shadow-inner"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>

                    {loginError && (
                      <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                        <div className="shrink-0 w-2 h-2 rounded-full bg-red-500"></div>
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 text-obsidian-950 py-3.5 rounded-xl font-bold text-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 active:scale-95 text-center"
                    >
                      {loginLoading ? (
                        <Loader2 size={20} className="animate-spin mx-auto" />
                      ) : (
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-text-main">
                      {isSignUp ? 'Already a member?' : "New to Sudha Oil Mill?"}{' '}
                      <button
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setLoginError('');
                        }}
                        className="text-gold-400 font-bold hover:text-gold-300 transition-colors uppercase text-xs tracking-wider ml-2"
                      >
                        {isSignUp ? 'Sign In' : 'Join Now'}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Home;