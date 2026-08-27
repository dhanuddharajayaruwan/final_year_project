import React, { useEffect, useState, useCallback } from 'react';
import deliveryFeeService from '@/services/deliveryFee.service';
import { showSuccess, showError, showConfirm } from '@/utils/sweetAlerts';

const ShippingCostSubTab = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newFee, setNewFee] = useState({ district: '', price: '', minimum_days: '', maximum_days: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await deliveryFeeService.getAllFees({
        search: searchTerm || undefined,
        page,
        limit: 10
      });
      if (res.status === 'success') {
        setFees(res.data || []);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching delivery fees:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchFees();
    }, 500); // 500ms debounce for search
    return () => clearTimeout(timeoutId);
  }, [fetchFees]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newFee,
        price: Number(newFee.price),
        minimum_days: Number(newFee.minimum_days),
        maximum_days: Number(newFee.maximum_days),
      };
      const res = await deliveryFeeService.createFee(payload);
      if (res.status === 'success') {
        showSuccess("Fee Added", `Delivery fee for ${newFee.district} created.`);
        setFees([...fees, res.data]);
        setIsAdding(false);
        setNewFee({ district: '', price: '', minimum_days: '', maximum_days: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || "District already exists or data invalid.";
      showError("Add Failed", msg);
    }
  };

  const handleEditClick = (fee) => {
    setEditingId(fee._id);
    setIsAdding(true);
    setNewFee({
      district: fee.district,
      price: fee.price,
      minimum_days: fee.minimum_days,
      maximum_days: fee.maximum_days
    });
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewFee({ district: '', price: '', minimum_days: '', maximum_days: '' });
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newFee,
        price: Number(newFee.price),
        minimum_days: Number(newFee.minimum_days),
        maximum_days: Number(newFee.maximum_days),
      };
      const res = await deliveryFeeService.updateFee(editingId, payload);
      if (res.status === 'success') {
        showSuccess("Updated", "Delivery fee updated successfully.");
        setFees(fees.map(f => f._id === editingId ? res.data : f));
        cancelEdit();
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || "Update failed.";
      showError("Update Failed", msg);
    }
  };

  const handleDeleteFee = async (id, district) => {
    const confirmed = await showConfirm(`Delete Fee?`, `Remove delivery fee for ${district}?`);
    if (!confirmed) return;
    try {
      await deliveryFeeService.deleteFee(id);
      showSuccess("Deleted", "Fee removed.");
      setFees(fees.filter(f => f._id !== id));
    } catch {
      showError("Delete Failed", "Failed to remove fee.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest whitespace-nowrap">Regional Delivery Rates</h4>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search District..."
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
            onClick={() => isAdding ? cancelEdit() : setIsAdding(true)}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all w-full sm:w-auto ${
              isAdding ? "bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/10"
            }`}
          >
            {isAdding ? "CANCEL" : "+ ADD NEW RATE"}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={editingId ? handleUpdateFee : handleAddFee} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-lg shadow-blue-600/5 flex flex-col md:flex-row gap-4 items-end animate-fadeIn relative overflow-hidden">
          {editingId && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>}
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
            <input 
              type="text" required value={newFee.district}
              onChange={(e) => setNewFee({...newFee, district: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
              placeholder="e.g. Colombo"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (LKR)</label>
            <input 
              type="number" required value={newFee.price}
              onChange={(e) => setNewFee({...newFee, price: e.target.value})}
              className="w-full bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
              placeholder="e.g. 500"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Days (Min-Max)</label>
            <div className="flex gap-2">
              <input 
                type="number" required value={newFee.minimum_days}
                onChange={(e) => setNewFee({...newFee, minimum_days: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                placeholder="2"
              />
              <input 
                type="number" required value={newFee.maximum_days}
                onChange={(e) => setNewFee({...newFee, maximum_days: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                placeholder="5"
              />
            </div>
          </div>
          <button type="submit" className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${
            editingId ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/10" : "bg-green-500 text-white hover:bg-green-600 shadow-green-500/10"
          }`}>
            {editingId ? "UPDATE" : "SAVE"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">District</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Delivery Price</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">ETD (Days)</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Loading rates...</td></tr>
            ) : fees.length > 0 ? fees.map((f) => (
              <tr key={f._id} className="hover:bg-gray-50/30 transition">
                <td className="px-6 py-4 text-xs font-black text-blue-900 uppercase">{f.district}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-500">Rs {f.price?.toLocaleString()}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-500">{f.minimum_days}-{f.maximum_days} Days</td>
                <td className="px-6 py-4 text-right space-x-4">
                   <button onClick={() => handleEditClick(f)} className="text-[10px] font-black text-blue-600 uppercase hover:text-blue-900 transition-colors">Edit</button>
                   <button onClick={() => handleDeleteFee(f._id, f.district)} className="text-[10px] font-black text-red-500 uppercase hover:text-red-700 transition-colors">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">{searchTerm ? `No matches for "${searchTerm}"` : 'No regional rates defined.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && fees.length > 0 && totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
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
    </div>
  );
};

export default ShippingCostSubTab;
