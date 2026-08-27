import React, { useEffect, useState, useCallback } from 'react';
import orderService from '@/services/order.service';
import { showSuccess, showError } from '@/utils/sweetAlerts';
import ShippingSubTab from './ShippingSubTab';
import ShippingCostSubTab from './ShippingCostSubTab';

const OrderManagement = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // Search, Filter and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders({ 
        order_status: filterStatus || undefined,
        search: searchTerm || undefined,
        page,
        limit: 10
      });
      if (res.status === 'success') {
        setOrders(res.orders || []);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm, page]);

  useEffect(() => {
    if (activeTab === 'orders') {
      const timeoutId = setTimeout(() => {
        fetchOrders();
      }, 500); // 500ms debounce
      return () => clearTimeout(timeoutId);
    }
  }, [fetchOrders, activeTab, filterStatus, searchTerm, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchTerm]);

  const handleUpdateStatus = async (id) => {
    try {
      const res = await orderService.updateOrderStatus(id, newStatus);
      if (res.status === 'success') {
        showSuccess("Status Updated", `Order #${id.slice(-6)} is now ${newStatus}.`);
        setOrders(orders.map(o => o._id === id ? { ...o, order_status: newStatus } : o));
        setEditingId(null);
      }
    } catch {
      showError("Update Failed", "Failed to update order status.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="w-full md:w-auto">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-900">Order & Logistics</h3>
          <div className="flex space-x-6 mt-3">
            {['orders', 'shipping', 'costs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 pb-1 border-b-2 ${
                  activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-blue-400'
                }`}
              >
                {tab === 'costs' ? 'SHIPPING COSTS' : tab === 'shipping' ? 'SHIPPING TRACK' : 'ALL ORDERS'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search ID, Name or Contact..."
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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-100 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none shadow-sm text-blue-900 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'orders' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Order ID</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Customer</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Contact</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Address</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Product</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Qty</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Amount</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="9" className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Loading orders...</td></tr>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/30 transition group">
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">#{order._id.slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="text-[11px] font-black text-blue-900 uppercase">{order.user_id?.name || order.guest_info?.name || 'Unknown'}</div>
                          {!order.user_id && (
                            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">Guest</span>
                          )}
                        </div>
                        <div className="text-[9px] text-gray-400 font-bold">{order.user_id?.email || order.guest_info?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black text-blue-900">{order.contact_number || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="text-[9px] font-bold text-gray-500 uppercase leading-relaxed">
                          {order.shipping_address ? (
                            <>
                              <div>{order.shipping_address.street}</div>
                              <div>{order.shipping_address.city}, {order.shipping_address.district}</div>
                              <div>{order.shipping_address.postal_code}</div>
                              <div className="text-[8px] text-gray-400">{order.shipping_address.country}</div>
                            </>
                          ) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-black text-blue-900 uppercase">
                          {order.items?.[0]?.product_id?.name || 'Product'}
                        </div>
                        {order.items?.length > 1 && (
                          <div className="text-[8px] font-bold text-gray-400 uppercase italic">
                            + {order.items.length - 1} more
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black text-blue-900">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-black text-blue-900">
                        Rs {Number(order.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === order._id ? (
                          <select 
                            value={newStatus} 
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="bg-gray-50 border border-gray-100 px-2 py-1 rounded text-[10px] font-bold focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                            order.order_status === 'delivered' ? 'text-green-500 bg-green-50' : 
                            order.order_status === 'cancelled' ? 'text-red-500 bg-red-50' : 
                            'text-yellow-500 bg-yellow-50'
                          }`}>
                            {order.order_status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingId === order._id ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleUpdateStatus(order._id)} className="bg-blue-600 text-white px-3 py-1 rounded text-[9px] font-black uppercase">Save</button>
                            <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-500 px-3 py-1 rounded text-[9px] font-black uppercase">X</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setEditingId(order._id); setNewStatus(order.order_status); }}
                            className="text-[10px] font-black text-blue-600 uppercase hover:text-blue-900 transition-colors"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">No orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && orders.length > 0 && totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-50 bg-gray-50/20">
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
      ) : activeTab === 'shipping' ? (
        <ShippingSubTab />
      ) : (
        <ShippingCostSubTab />
      )}
    </div>
  );
};

export default OrderManagement;
