import React, { useCallback, useEffect, useState } from 'react';
import orderService from '@/services/order.service';
import { Link } from 'react-router-dom';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const STATUS_MAP = {
  pending:    { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  processing: { color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
  shipped:    { color: 'text-purple-500', bg: 'bg-purple-500/10' },
  delivered:  { color: 'text-green-500',  bg: 'bg-green-500/10'  },
  cancelled:  { color: 'text-red-500',    bg: 'bg-red-500/10'    },
};

 const MemberOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const matchOrder = useCallback((order, query) => {
    const id = order._id?.toLowerCase() || '';
    const status = order.order_status?.toLowerCase() || '';
    const products = (order.items || [])
      .map((item) => item.product_id?.name || '')
      .join(' ')
      .toLowerCase();
    const date = newDate(order.createdAt).toDateString().toLowerCase();
    const amount = String(order.total_amount || '');

    return (
      id.includes(query) ||
      status.includes(query) ||
      products.includes(query) ||
      date.includes(query) ||
      amount.includes(query)
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
  } = usePaginatedSearch(orders, matchOrder);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        setOrders(res.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="text-[10px] font-black tracking-widest text-gray-500 animate-pulse">
        FETCHING ORDERS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">
          My <span className="text-red-600">Shop History</span>
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search orders..."
          />
          <div className="bg-gray-900 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest text-gray-500 uppercase text-center sm:text-left">
            Total: {totalItems}
          </div>
        </div>
      </div>

      <div className="bg-gray-900/30 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-5 text-[10px] font-black tracking-widest text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-5 text-[10px] font-black tracking-widest text-gray-500 uppercase">Products</th>
                <th className="px-6 py-5 text-[10px] font-black tracking-widest text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-5 text-[10px] font-black tracking-widest text-gray-500 uppercase">Order Status</th>
                <th className="px-6 py-5 text-[10px] font-black tracking-widest text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((order) => {
                  const status = STATUS_MAP[order.order_status] || STATUS_MAP.pending;
                  return (
                    <tr key={order._id} className="hover:bg-red-600/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <span className="text-xs font-black italic text-gray-300">#{order._id.slice(-8).toUpperCase()}</span>
                        <div className="text-[9px] font-bold text-gray-600 tracking-widest mt-0.5">{new Date(order.createdAt).toDateString()}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          {order.items.slice(0, 2).map((item, i) => (
                            <span key={i} className="text-[10px] font-black tracking-widest text-gray-400 truncate max-w-[150px] uppercase">
                              {item.product_id?.name || 'Unknown Item'} <span className="text-gray-700">x{item.quantity}</span>
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[8px] font-black text-red-600 tracking-widest italic">+{order.items.length - 2} MORE ITEMS</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-black italic text-red-600">
                        Rs {order.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase ${status.bg} ${status.color}`}>
                          ● {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          to={`/orders/${order._id}`}
                          className="inline-flex items-center gap-2 bg-gray-800 text-white text-[9px] font-black tracking-widest py-2.5 px-5 rounded-lg border border-gray-700 hover:border-red-600 hover:bg-red-600 transition-all uppercase"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="text-4xl mb-4 opacity-20">🛒</div>
                    <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                      {searchQuery ? 'No orders match your search.' : "You haven't placed any orders yet."}
                    </p>
                    {!searchQuery && (
                      <Link to="/shop" className="mt-4 inline-block text-red-600 text-[10px] font-black tracking-widest hover:underline uppercase">
                        Go Shopping →
                      </Link>
                    )}
                  </td>
                </tr>
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
          />
        </div>
      </div>
    </div>
  );
};

export default MemberOrders;
