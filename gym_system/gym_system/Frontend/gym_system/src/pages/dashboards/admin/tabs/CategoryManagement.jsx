import React, { useEffect, useState, useCallback } from 'react';
import categoryService from '@/services/category.service';
import { showSuccess, showError, showConfirm } from '@/utils/sweetAlerts';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', type: 'other' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', type: 'other' });

  const matchCategory = useCallback((cat, query) => {
    const name = cat.name?.toLowerCase() || '';
    const type = cat.type?.toLowerCase() || '';
    const description = cat.description?.toLowerCase() || '';
    return name.includes(query) || type.includes(query) || description.includes(query);
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    totalItems,
    itemsPerPage,
  } = usePaginatedSearch(categories, matchCategory);

  const CATEGORY_TYPES = ["supplement", "equipment", "apparel", "accessory", "other"];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAllCategories();
      if (res.status === 'success') {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCat = async (e) => {
    e.preventDefault();
    try {
      const res = await categoryService.createCategory(newCat);
      if (res.status === 'success') {
        showSuccess("Category Added", `${newCat.name} has been created successfully.`);
        setCategories([...categories, res.category]);
        setIsAdding(false);
        setNewCat({ name: '', description: '', type: 'other' });
      }
    } catch (err) {
      console.error("Error creating category:", err);
      showError("Creation Failed", "Failed to create category.");
    }
  };

  const handleUpdateCat = async (e) => {
    e.preventDefault();
    try {
      const res = await categoryService.updateCategory(editingId, editForm);
      if (res.status === 'success') {
        showSuccess("Category Updated", "The category has been updated successfully.");
        setCategories(categories.map(c => c._id === editingId ? res.category : c));
        setEditingId(null);
      }
    } catch (err) {
      console.error("Error updating category:", err);
      showError("Update Failed", "Failed to update category.");
    }
  };

  const handleDeleteCat = async (id) => {
    const confirmed = await showConfirm("Delete Category?", "Are you sure? Products in this category may be affected.");
    if (!confirmed) return;
    try {
      const res = await categoryService.deleteCategory(id);
      if (res.status === 'success') {
        showSuccess("Deleted", "Category has been removed.");
        setCategories(categories.filter(c => c._id !== id));
      }
    } catch (err) {
      showError("Delete Failed", "Failed to delete category.");
      console.error("Error deleting category:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Product Categories</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search categories..."
            variant="admin"
            className="md:w-64"
          />
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            {isAdding ? 'CANCEL' : '+ ADD CATEGORY'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddCat} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-fadeIn">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
            <input 
              type="text" required value={newCat.name}
              onChange={(e) => setNewCat({...newCat, name: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
              placeholder="e.g. Supplements"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
            <select 
              value={newCat.type}
              onChange={(e) => setNewCat({...newCat, type: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition capitalize"
            >
              {CATEGORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-[1.5] space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
            <input 
              type="text" required value={newCat.description}
              onChange={(e) => setNewCat({...newCat, description: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
              placeholder="e.g. Protein powders and vitamins"
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition">SAVE</button>
        </form>
      )}

      {editingId && (
        <form onSubmit={handleUpdateCat} className="bg-blue-900 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 items-end animate-fadeIn text-white">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">Edit Name</label>
            <input 
              type="text" required value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full bg-blue-800/50 border border-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">Edit Type</label>
            <select 
              value={editForm.type}
              onChange={(e) => setEditForm({...editForm, type: e.target.value})}
              className="w-full bg-blue-800/50 border border-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400 capitalize"
            >
              {CATEGORY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-[1.5] space-y-1">
            <label className="text-[9px] font-black text-blue-300 uppercase tracking-widest ml-1">Edit Description</label>
            <input 
              type="text" required value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              className="w-full bg-blue-800/50 border border-blue-700 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition">UPDATE</button>
            <button onClick={() => setEditingId(null)} type="button" className="bg-white/10 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition">CANCEL</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs font-black uppercase tracking-widest italic">Loading Categories...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedItems.length > 0 ? paginatedItems.map((cat) => (
                <tr key={cat._id} className="hover:bg-gray-50/30 transition group">
                  <td className="px-6 py-4">
                    <div className="text-xs font-black text-blue-900 uppercase tracking-tight">{cat.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded">
                      {cat.type || 'other'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium">{cat.description}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => {
                        setEditingId(cat._id);
                        setEditForm({ name: cat.name, description: cat.description, type: cat.type || 'other' });
                      }}
                      className="text-[10px] font-black text-blue-600 uppercase hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCat(cat._id)}
                      className="text-[10px] font-black text-red-500 uppercase hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    {searchQuery ? 'No categories match your search.' : 'No categories found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-6 pb-5">
          <DashboardPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            className="[&_p]:text-gray-400 [&_button]:border-gray-200 [&_button]:text-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
