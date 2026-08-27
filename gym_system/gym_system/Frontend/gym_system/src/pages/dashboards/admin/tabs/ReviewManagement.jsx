import React, { useCallback, useEffect, useState } from 'react';
import reviewService from '@/services/review.service';
import { showSuccess, showError, showConfirm } from '@/utils/sweetAlerts';
import DashboardSearchBar from '@/components/dashboard/DashboardSearchBar';
import DashboardPagination from '@/components/dashboard/DashboardPagination';
import { usePaginatedSearch } from '@/hooks/usePaginatedSearch';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const matchReview = useCallback((review, query) => {
    const user = review.user_id?.name?.toLowerCase() || '';
    const email = review.user_id?.email?.toLowerCase() || '';
    const title = review.title?.toLowerCase() || '';
    const comments = review.comments?.toLowerCase() || '';
    const type = review.type?.toLowerCase() || '';
    const orderId = (review.order_id?._id || review.order_id || '').toString().toLowerCase();
    const rating = String(review.rating || '');

    return (
      user.includes(query) ||
      email.includes(query) ||
      title.includes(query) ||
      comments.includes(query) ||
      type.includes(query) ||
      orderId.includes(query) ||
      rating.includes(query)
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
  } = usePaginatedSearch(reviews, matchReview);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reviewService.getAllReviews({ limit: 500 });
      if (res.status === 'success') {
        const list = Array.isArray(res.reviews) ? res.reviews : (res.data || []);
        setReviews(list);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("Delete Review?", "Are you sure you want to remove this user review?");
    if (!confirmed) return;
    try {
      const res = await reviewService.deleteReview(id);
      if (res.status === 'success') {
        showSuccess("Deleted", "The review has been removed.");
        setReviews(reviews.filter(r => r._id !== id));
      }
    } catch {
      showError("Delete Failed", "Failed to remove the review.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-blue-900">Review Management</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Monitor user feedback and ratings</p>
        </div>
        <DashboardSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search reviews..."
          variant="admin"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto text-left">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Rating</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">User</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Order ID</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Comment</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Loading reviews...</td></tr>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50/30 transition group">
                    <td className="px-6 py-4">
                      <div className="text-yellow-500 text-xs font-black">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                      <div className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">{review.rating}/5 Score</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] font-black text-blue-900 uppercase">{review.user_id?.name || 'Unknown User'}</div>
                      <div className="text-[9px] text-gray-400 font-bold">{review.user_id?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-bold text-gray-400 uppercase">#{review.order_id?._id?.slice(-6) || review.order_id?.slice(-6)}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                       <div className="text-[10px] font-black text-blue-900 uppercase mb-0.5">{review.title || 'No Title'}</div>
                       <div className="text-[9px] font-bold text-gray-400 leading-tight italic truncate">"{review.comments || 'No comment provided'}"</div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">{new Date(review.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDelete(review._id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
                      >
                       Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="px-6 py-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">{searchQuery ? 'No reviews match your search.' : 'No reviews found.'}</td></tr>
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

export default ReviewManagement;
