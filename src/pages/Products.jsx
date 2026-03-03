import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Package,
  Search,
  Filter,
  ChevronDown,
  Eye,
  AlertCircle,
  Link
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageInputType, setImageInputType] = useState('upload'); // 'upload' or 'url'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null,
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return '';
    setUploading(true);

    const uploadPromise = new Promise((resolve, reject) => {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at', downloadURL);
            resolve(downloadURL);
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });

    try {
      const url = await uploadPromise;
      setUploading(false);
      return url;
    } catch (error) {
      console.error("Image upload error:", error);
      alert(`Image upload error: ${error.message}`);
      setUploading(false);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.imageUrl;

      // Only upload if in 'upload' mode and a file is selected
      if (imageInputType === 'upload' && formData.image) {
        imageUrl = await handleImageUpload(formData.image);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl,
        createdAt: editingProduct ? editingProduct.createdAt : new Date(),
        updatedAt: new Date()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      image: null,
      imageUrl: ''
    });
    setEditingProduct(null);
    setImageInputType('upload');
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: null
    });
    // If product has an image URL, we can default to 'url' mode or 'upload'.
    // 'upload' allows replacing it. 'url' allows editing the URL.
    // Let's default to 'url' if there's a URL, so they can see it?
    // Actually, usually users want to see the image. 
    // Let's default to 'upload' which shows the preview of the existing URL anyway.
    setImageInputType('upload');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name);
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'stock': return a.stock - b.stock;
      case 'newest': return new Date(b.createdAt?.seconds * 1000 || 0) - new Date(a.createdAt?.seconds * 1000 || 0);
      default: return 0;
    }
  });

  return (
    <div className="space-y-6 font-sans text-text-main">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-main tracking-wide">Products</h1>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="group flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-obsidian-950 px-4 py-2.5 rounded-xl hover:from-green-400 hover:to-green-500 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] font-bold uppercase tracking-wider text-sm"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-main" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-gray-900 text-sm shadow-inner placeholder-gray-400 transition-all"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 md:w-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 cursor-pointer"
          >
            <option value="all" className="bg-primary">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name} className="bg-primary">{cat.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 md:w-40 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 cursor-pointer"
          >
            <option value="newest" className="bg-primary">Newest First</option>
            <option value="name" className="bg-primary">Name A-Z</option>
            <option value="price-low" className="bg-primary">Price: Low to High</option>
            <option value="price-high" className="bg-primary">Price: High to Low</option>
            <option value="stock" className="bg-primary">Stock Level</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center bg-primary">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-text-main">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="bg-primary w-20 h-20 rounded-full flex items-center justify-center mb-2 border border-glass-border shadow-inner">
                        <Package size={36} className="text-gray-500" />
                      </div>
                      <p className="font-display font-bold text-xl text-text-main">No products found</p>
                      <p className="text-sm font-medium">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center group-hover:border-green-200 transition-colors">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package size={24} className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-text-main tracking-wide line-clamp-1">{product.name}</p>
                          <p className="text-xs font-medium text-text-main line-clamp-1 max-w-[200px] mt-1 pr-4">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-base font-bold text-green-600">₹{product.price}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 w-28">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{product.stock} units</span>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${product.stock > 20 ? 'bg-gradient-to-r from-olive-500 to-olive-400' :
                              product.stock > 10 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                              }`}
                            style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {product.stock === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                          <AlertCircle size={12} /> Out of Stock
                        </span>
                      ) : product.stock < 10 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2.5 text-text-main hover:text-green-400 hover:bg-green-500/10 rounded-xl transition-all border border-transparent hover:border-green-500/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2.5 text-text-main hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && products.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Showing <span className="text-gray-900">{sortedProducts.length}</span> of <span className="text-gray-900">{products.length}</span> results
            </p>
          </div>
        )}
      </div>

      {/* Modal gap for add product pop up */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary backdrop-blur-md transition-opacity pt-20">
          <div className="glass-panel rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-glass-border w-full max-w-2xl overflow-hidden transform transition-all flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-glass-border flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-2xl font-display font-bold text-text-main tracking-wide">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-main hover:text-text-main hover:bg-white/10 p-2.5 rounded-xl transition-all border border-transparent hover:border-glass-border"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-text-main uppercase tracking-widest mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner placeholder-gray-500 transition-all"
                      required

                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-main uppercase tracking-widest mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner cursor-pointer transition-all appearance-none"
                      required
                    >
                      <option value="" className="bg-primary">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name} className="bg-primary">{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-main uppercase tracking-widest mb-2">Price (₹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner placeholder-gray-500 transition-all"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-text-main uppercase tracking-widest mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner placeholder-gray-500 transition-all"
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-main uppercase tracking-widest mb-3">Product Image</label>

                    {/* Input Type Toggle */}
                    <div className="flex bg-primary p-1 rounded-xl mb-4 border border-glass-border shadow-inner">
                      <button
                        type="button"
                        onClick={() => {
                          setImageInputType('upload');
                          setFormData({ ...formData, imageUrl: editingProduct ? editingProduct.imageUrl : '' });
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${imageInputType === 'upload'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-sm'
                          : 'text-gray-500 hover:text-text-main'
                          }`}
                      >
                        <Upload size={16} />
                        <span>Upload</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputType('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${imageInputType === 'url'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-sm'
                          : 'text-gray-500 hover:text-text-main'
                          }`}
                      >
                        <Link size={16} />
                        <span>URL</span>
                      </button>
                    </div>

                    {imageInputType === 'url' ? (
                      <div className="space-y-4">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner placeholder-gray-500 transition-all text-sm"
                          placeholder="https://example.com/image.jpg"
                        />
                        {formData.imageUrl && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-glass-border bg-primary shadow-inner flex items-center justify-center">
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="max-h-full max-w-full object-contain p-2"
                              onError={(e) => (e.target.style.display = 'none')}
                              onLoad={(e) => (e.target.style.display = 'block')}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-glass-border rounded-xl p-6 text-center hover:border-green-500/50 transition-colors bg-primary group cursor-pointer relative">
                        {formData.imageUrl && !formData.image ? (
                          <div className="relative inline-block">
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="h-32 w-32 object-contain rounded-lg mx-auto bg-primary p-2 border border-glass-border"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, imageUrl: '' })}
                              className="absolute -top-3 -right-3 bg-primary text-red-400 rounded-full shadow-lg p-1.5 hover:bg-red-500/20 border border-glass-border transition-all z-10"
                            >
                              <X size={16} />
                            </button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        ) : formData.image ? (
                          <div className="flex items-center justify-between gap-3 text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20 relative z-10">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <Package size={20} className="flex-shrink-0" />
                              <span className="text-sm font-bold truncate">{formData.image.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image: null }); }}
                              className="text-text-main hover:text-red-400 flex-shrink-0"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <label className="cursor-pointer block absolute inset-0 z-0">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                className="hidden"
                              />
                            </label>
                            <div className="flex flex-col items-center gap-3 text-gray-500 pointer-events-none relative z-10">
                              <div className="p-3 bg-primary rounded-full border border-glass-border group-hover:bg-green-500/10 group-hover:text-green-400 group-hover:border-green-500/20 transition-all shadow-inner">
                                <Upload size={28} />
                              </div>
                              <span className="text-sm font-bold uppercase tracking-wider group-hover:text-green-400 transition-colors">Click to upload image</span>
                            </div>
                          </>
                        )}

                        {uploading && (
                          <div className="mt-4 text-xs text-green-400 font-bold uppercase tracking-widest animate-pulse">Uploading...</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-text-main uppercase tracking-widest mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-primary border border-glass-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-text-main font-medium shadow-inner placeholder-gray-500 transition-all min-h-[120px] custom-scrollbar"
                  placeholder="Enter product description..."
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-glass-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-text-main bg-primary border border-glass-border rounded-xl hover:bg-white/5 hover:text-text-main font-bold uppercase tracking-wider text-sm transition-all shadow-inner"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-obsidian-950 rounded-xl hover:from-green-400 hover:to-green-500 font-bold uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-obsidian-950/20 border-t-obsidian-950 rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;