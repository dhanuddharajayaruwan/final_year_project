import React, { useEffect, useState, useCallback } from 'react';
import productService, { BASE_URL } from '@/services/product.service';
import categoryService from '@/services/category.service';
import CategoryManagement from './CategoryManagement';
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/sweetAlerts';

const ShopManagement = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Product Creation State
  const [isAdding, setIsAdding] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    amount: '',
    quantity: '',
    category_id: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'products') {
        const [prodRes, catRes] = await Promise.all([
          productService.getAllProducts({
            search: searchTerm || undefined,
            page,
            limit: 10
          }),
          categoryService.getAllCategories()
        ]);
        if (prodRes.status === 'success') {
          setProducts(prodRes.products || []);
          setTotalPages(prodRes.pages || 1);
        }
        if (catRes.status === 'success') setCategories(catRes.categories || []);
      } else {
        const catRes = await categoryService.getAllCategories();
        if (catRes.status === 'success') setCategories(catRes.categories || []);
      }
    } catch (err) {
      console.error("Error fetching shop data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  // Reset page on search
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      showWarning("Limit Reached", "Maximum 5 images allowed per product.");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };



  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
       showWarning("Images Required", "Please upload at least one image for the product.");
       return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('amount', newProduct.amount);
      formData.append('quantity', newProduct.quantity);
      formData.append('category_id', newProduct.category_id);
      
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await productService.createProduct(formData);
      if (res.status === 'success') {
        showSuccess("Product Created", `${newProduct.name} has been added to inventory.`);
        setProducts([...products, res.product]);
        setIsAdding(false);
        setNewProduct({ name: '', description: '', amount: '', quantity: '', category_id: '' });
        setSelectedFiles([]);
        previews.forEach(p => URL.revokeObjectURL(p));
        setPreviews([]);
      }
    } catch (err) {
      console.error("Error adding product:", err);
      const msg = err.response?.data?.message || "Failed to add product.";
      showError("Creation Failed", msg);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('amount', newProduct.amount);
      formData.append('quantity', newProduct.quantity);
      formData.append('category_id', newProduct.category_id);
      
      // Send existing images we want to KEEP
      if (editingId) {
        existingImages.forEach(img => {
          formData.append('images', img);
        });
      }

      // Append new images
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      const res = await productService.updateProduct(editingId, formData);
      if (res.status === 'success') {
        showSuccess("Updated", `${newProduct.name} has been updated.`);
        setProducts(products.map(p => p._id === editingId ? res.product : p));
        setEditingId(null);
        setIsAdding(false);
        setNewProduct({ name: '', description: '', amount: '', quantity: '', category_id: '' });
        setSelectedFiles([]);
        previews.forEach(p => URL.revokeObjectURL(p));
        setPreviews([]);
      }
    } catch (err) {
      console.error("Error updating product:", err);
      showError("Update Failed", err.response?.data?.message || "Failed to update product.");
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setIsAdding(true);
    setExistingImages(product.images || []);
    setNewProduct({
      name: product.name,
      description: product.description || '',
      amount: product.amount || '',
      quantity: product.quantity || '',
      category_id: product.category_id?._id || product.category_id || ''
    });
    setPreviews([]);
    setSelectedFiles([]);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setExistingImages([]);
    setNewProduct({ name: '', description: '', amount: '', quantity: '', category_id: '' });
    setSelectedFiles([]);
    previews.forEach(p => URL.revokeObjectURL(p));
    setPreviews([]);
  };

  const removeExistingImage = (url) => {
    setExistingImages(existingImages.filter(img => img !== url));
  };

  const removeNewImage = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = await showConfirm("Delete Product?", "Are you sure you want to delete this product from inventory?");
    if (!confirmed) return;
    try {
      const res = await productService.deleteProduct(id);
      if (res.status === 'success') {
        showSuccess("Deleted", "Product removed successfully.");
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (err) {
      showError("Delete Failed", "Failed to remove product.");
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Internal Nav */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-900">Shop Manager</h3>
          <div className="flex space-x-4 mt-3">
            {['products', 'categories'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsAdding(false); }}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 pb-1 border-b-2 ${
                  activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-blue-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Product Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-100 px-4 py-2 rounded-2xl text-[10px] font-bold focus:outline-none shadow-sm placeholder:text-gray-300"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>

            <button 
              onClick={() => { if (isAdding) cancelForm(); else setIsAdding(true); }}
              className="bg-red-600 text-white px-8 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition w-full sm:w-auto flex items-center justify-center min-h-[40px]"
            >
              {isAdding ? 'CANCEL' : '+ ADD NEW PRODUCT'}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          {isAdding && (
            <form onSubmit={editingId ? handleUpdateProduct : handleAddProduct} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-fadeIn">
              <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-900">
                  {editingId ? `Editing Product: ${newProduct.name}` : 'Register New Inventory Item'}
                </h4>
                {editingId && (
                   <span className="text-[10px] font-black italic text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase">Edit Mode</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Category *</label>
                  <select 
                    required
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name *</label>
                  <input 
                    type="text" required value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                    placeholder="e.g. Whey Protein"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (LKR) *</label>
                  <input 
                    type="number" required value={newProduct.amount}
                    onChange={(e) => setNewProduct({...newProduct, amount: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                    placeholder="e.g. 15000"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Quantity *</label>
                  <input 
                    type="number" required value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <input 
                    type="text" value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500 transition"
                    placeholder="Short description..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Images {editingId ? '(Optional - Leaves current images if empty)' : '(Max 5) *'}</label>
                  <div className="flex space-x-2">
                    <input 
                      type="file" 
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-grow bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-[10px] font-bold focus:outline-none focus:border-blue-500 transition file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Existing Image Display (Edit Mode) */}
              {editingId && existingImages.length > 0 && (
                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 border-t border-gray-50 pt-6">
                  <p className="col-span-full text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Product Images:</p>
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm group">
                      <img 
                        src={url.startsWith('http') ? url : `${BASE_URL}${url}`} 
                        alt="Current" 
                        className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition duration-500" 
                      />
                      <button 
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black transition-all"
                      >
                        x
                      </button>
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center">
                        <span className="text-[8px] text-white font-black uppercase tracking-tighter">Existing</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Image Previews */}
              {previews.length > 0 && (
                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 border-t border-gray-50 pt-6">
                  <p className="col-span-full text-[9px] font-black text-green-500 uppercase tracking-widest mb-2">
                    {editingId ? 'New Images to Add:' : 'New Image Previews:'}
                  </p>
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                         type="button"
                         onClick={() => removeNewImage(idx)}
                         className="absolute top-1 right-1 bg-black text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                      >
                         x
                      </button>
                      <div className="absolute inset-x-0 bottom-0 bg-green-500/80 py-1 text-center">
                         <span className="text-[8px] text-white font-black uppercase tracking-tighter italic">New Upload</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end border-t border-gray-50 pt-6">
                <button type="submit" className="bg-green-500 text-white px-12 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition shadow-lg shadow-green-500/20">
                  {editingId ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}
                </button>
              </div>
            </form>
          )}

          <div className="p-4">
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-xs font-black uppercase tracking-widest bg-white rounded-3xl border border-gray-100 italic">Inventory Loading...</div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-blue-600 transition duration-500 flex flex-col">
                      <div className="w-full h-40 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center text-4xl group-hover:bg-blue-50 transition duration-500 overflow-hidden relative">
                        {product.images && product.images[0] ? (
                          <img 
                            src={product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL}${product.images[0]}`} 
                            alt={product.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          '📦'
                        )}
                        {product.images?.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[8px] px-2 py-1 rounded-lg font-black uppercase">
                            +{product.images.length - 1} More
                          </div>
                        )}
                      </div>
                      <h4 className="font-black text-blue-900 uppercase mb-1 truncate">{product.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 mb-4 tracking-widest uppercase mb-auto">Stock: <span className={product.quantity > 10 ? 'text-green-500 font-black' : 'text-red-500 font-black'}>{product.quantity || 0} Units</span></p>
                      <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-4">
                        <span className="text-sm font-black text-blue-900">Rs {product.amount?.toLocaleString()}</span>
                        <div className="flex items-center space-x-2">
                           <button 
                             onClick={() => handleEditClick(product)}
                             className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-900 transition underline underline-offset-4 decoration-2"
                           >
                             Edit
                           </button>
                           <button 
                             onClick={() => handleDeleteProduct(product._id)}
                             className="text-[9px] font-black text-red-600 uppercase tracking-widest hover:text-red-900 transition underline underline-offset-4 decoration-2"
                           >
                            Delete
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!loading && products.length > 0 && totalPages > 1 && (
                  <div className="flex justify-between items-center px-6 py-4 mt-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${
                          page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Prev
                      </button>
                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black transition-all ${
                              page === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${
                          page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest bg-white rounded-3xl border border-gray-100 italic">
                {searchTerm ? `No products match "${searchTerm}"` : 'No products found in inventory'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <CategoryManagement />
      )}
    </div>
  );
};

export default ShopManagement;
