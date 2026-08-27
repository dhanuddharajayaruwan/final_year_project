import React, { useEffect, useState, useCallback } from 'react';
import shippingService from '@/services/shipping.service';
import { showSuccess, showError } from '@/utils/sweetAlerts';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const ShippingSubTab = () => {
  const [shippings, setShippings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ tracking_number: '', courier_name: '', shipped_date: null });

  const matchShipping = useCallback((shipping, query) => {
    const orderId = shipping.order_id?._id?.toString().toLowerCase() || '';
    const customer = shipping.order_id?.user_id?.name?.toLowerCase() || '';
    const email = shipping.order_id?.user_id?.email?.toLowerCase() || '';
    const tracking = shipping.tracking_number?.toLowerCase() || '';
    const courier = shipping.courier_name?.toLowerCase() || '';
    const status = shipping.shipping_status?.toLowerCase() || '';

    return (
      orderId.includes(query) ||
      customer.includes(query) ||
      email.includes(query) ||
      tracking.includes(query) ||
      courier.includes(query) ||
      status.includes(query)
    );
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
  } = usePaginatedSearch(shippings, matchShipping);

  const fetchShippings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await shippingService.getAllShippings({
        shipping_status: filterStatus || undefined,
        limit: 500,
      });
      if (res.status === 'success') {
        setShippings(res.shippings || []);
      }
    } catch (err) {
      console.error("Error fetching shippings:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchShippings();
  }, [fetchShippings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, setCurrentPage]);

  const handleUpdate = async (id) => {
    try {
      const res = await shippingService.updateShipping(id, editForm);
      if (res.status === 'success') {
        showSuccess("Updated", "Shipping information updated.");
        setShippings(shippings.map(s => s._id === id ? res.shipping : s));
        setEditingId(null);
      }
    } catch {
      showError("Update Failed", "Failed to update shipping.");
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <DashboardSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search shipping..."
          variant="admin"
          className="md:w-72"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-gray-100 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none shadow-sm text-blue-900 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto text-left">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Order & Customer</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Tracking Info</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
              <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Loading shipping records...</td></tr>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((shipping) => (
                <tr key={shipping._id} className="hover:bg-gray-50/30 transition group">
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-black text-blue-900 uppercase">Order #{shipping.order_id?._id?.slice(-6)}</div>
                    <div className="text-[9px] font-bold text-gray-400 mt-0.5">{shipping.order_id?.user_id?.name}</div>
                    <div className="text-[8px] text-gray-300 font-bold">{shipping.order_id?.user_id?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === shipping._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Tracking Number"
                          value={editForm.tracking_number}
                          onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-[10px] font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Courier Name"
                          value={editForm.courier_name}
                          onChange={(e) => setEditForm({ ...editForm, courier_name: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-[10px] font-bold"
                        />
                        <input
                          type="date"
                          value={editForm.shipped_date ? new Date(editForm.shipped_date).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditForm({ ...editForm, shipped_date: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg text-[10px] font-bold"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="text-[10px] font-black text-blue-900 uppercase">{shipping.tracking_number || 'Not Assigned'}</div>
                        <div className="text-[9px] font-bold text-gray-400">{shipping.courier_name || 'No Courier'}</div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      shipping.shipping_status === 'delivered' ? 'bg-green-50 text-green-600' :
                      shipping.shipping_status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                      shipping.shipping_status === 'cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      {shipping.shipping_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === shipping._id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdate(shipping._id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Save</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-[9px] font-black uppercase">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(shipping._id);
                          setEditForm({
                            tracking_number: shipping.tracking_number || '',
                            courier_name: shipping.courier_name || '',
                            shipped_date: shipping.shipped_date || null,
                          });
                        }}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">{searchQuery ? 'No shipping records match your search.' : 'No shipping records found.'}</td></tr>
            )}
          </tbody>
        </table>
        </div>
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

export default ShippingSubTab;
