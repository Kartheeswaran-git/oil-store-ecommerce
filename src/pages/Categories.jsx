import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, FolderTree, Search } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const categoriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategory.trim(),
        createdAt: new Date()
      });
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category", error);
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans text-text-main">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-text-main tracking-wide">Categories</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Add Category Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <Plus size={18} />
              </div>
              Add New Category
            </h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-text-main mb-2 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all placeholder-gray-400 text-gray-900"
                  // placeholder="Enter Category Name"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-obsidian-950/20 border-t-obsidian-950 rounded-full animate-spin"></span>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Add Category</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Category List */}
        <div className="lg:col-span-2 space-y-6">

          {/* Search & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-gray-900 text-sm placeholder-gray-400 transition-all"
              />
            </div>
            <div className="text-sm text-green-700 font-semibold px-4 py-2 bg-green-50 rounded-lg border border-green-100">
              {filteredCategories.length} Categories
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[60vh]">
              {filteredCategories.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="bg-primary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-glass-border shadow-inner">
                    <FolderTree size={36} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-text-main mb-2">No categories found</h3>
                  <p className="text-text-main font-medium max-w-sm mx-auto">
                    {searchTerm ? "Try adjusting your search terms" : "Get started by adding a category"}
                  </p>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                        <FolderTree size={22} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{category.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
                          Created: {category.createdAt?.seconds ? new Date(category.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-transparent hover:border-red-100"
                      title="Delete Category"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Categories;
