import React, { useCallback, useEffect, useState } from "react";
import reviewService from "../../../../services/review.service";
import DashboardSearchBar from "@/components/dashboard/DashboardSearchBar";
import DashboardPagination from "@/components/dashboard/DashboardPagination";
import { usePaginatedSearch } from "@/hooks/usePaginatedSearch";

const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`text-sm ${
          i < rating ? "text-yellow-500" : "text-gray-700"
        }`}
      >
        ★
      </span>
    ))}
  </div>
);

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={`text-xl transition-colors ${
          s <= value ? "text-yellow-500" : "text-gray-700 hover:text-yellow-400"
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

const typeBadgeColor = {
  product: "text-blue-400 bg-blue-900/30",
  trainer: "text-green-400 bg-green-900/30",
  gym: "text-red-400 bg-red-900/30",
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const getLabel = useCallback((rev) => {
    if (rev.type === "gym") return "Cylon Force Gym";
    if (rev.type === "trainer") return "Trainer Review";
    const items = rev.order_id?.items;
    if (items?.length) {
      return items.map((i) => i.product_id?.name || "Product").join(", ");
    }
    return "Product Review";
  }, []);

  const matchReview = useCallback((rev, query) => {
    const label = getLabel(rev).toLowerCase();
    const title = rev.title?.toLowerCase() || "";
    const comments = rev.comments?.toLowerCase() || "";
    const type = rev.type?.toLowerCase() || "";
    const rating = String(rev.rating || "");
    const date = new Date(rev.createdAt).toLocaleDateString().toLowerCase();

    return (
      label.includes(query) ||
      title.includes(query) ||
      comments.includes(query) ||
      type.includes(query) ||
      rating.includes(query) ||
      date.includes(query)
    );
  }, [getLabel]);

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

  // Edit modal state
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    title: "",
    comments: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getMyReviews({ page: 1, limit: 500 });
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openEdit = (rev) => {
    setEditingReview(rev);
    setEditForm({
      rating: rev.rating,
      title: rev.title || "",
      comments: rev.comments || "",
    });
    setEditError("");
  };

  const closeEdit = () => {
    setEditingReview(null);
    setEditError("");
  };

  const handleSave = async () => {
    if (!editForm.rating) {
      setEditError("Please select a rating.");
      return;
    }
    setSaving(true);
    setEditError("");
    try {
      await reviewService.updateReview(editingReview._id, {
        rating: editForm.rating,
        title: editForm.title,
        comments: editForm.comments,
      });
      closeEdit();
      fetchReviews();
    } catch (err) {
      setEditError(err?.response?.data?.message || "Failed to update review.");
    } finally {
      setSaving(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black italic uppercase tracking-tighter">
        My <span className="text-red-600">Ratings & Feedback</span>
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center">
          <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">
            Total Reviews
          </div>
          <div className="text-2xl font-black text-white italic">
            {loading ? "—" : String(reviews.length).padStart(2, "0")}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center">
          <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-2">
            Avg. Rating
          </div>
          <div className="text-2xl font-black text-yellow-500 italic">
            {loading ? "—" : avgRating} <span className="text-xs">/ 5</span>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
          <h3 className="text-xs font-black tracking-widest text-red-600 uppercase italic">
            Past Reviews
          </h3>
          <DashboardSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search reviews..."
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600 text-xs font-black tracking-widest uppercase">
            Loading...
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-xs font-black tracking-widest uppercase italic">
            {searchQuery ? "No reviews match your search." : "No reviews yet. Rate a product or the gym!"}
          </div>
        ) : (
          paginatedItems.map((rev) => (
            <div
              key={rev._id}
              className="bg-gray-900/30 border border-gray-800 p-6 rounded-3xl"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span
                    className={`text-[8px] font-black tracking-widest px-2 py-1 rounded uppercase mb-1 inline-block ${
                      typeBadgeColor[rev.type] || typeBadgeColor.product
                    }`}
                  >
                    {rev.type || "product"}
                  </span>
                  <h4 className="text-sm font-black italic uppercase text-white mt-1">
                    {getLabel(rev)}
                  </h4>
                  {rev.title && (
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                      {rev.title}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Stars rating={rev.rating} />
                  <button
                    onClick={() => openEdit(rev)}
                    className="text-[9px] font-black tracking-widest uppercase px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:border-red-600 hover:text-red-500 transition-all"
                  >
                    Edit
                  </button>
                </div>
              </div>
              {rev.comments && (
                <p className="text-xs font-bold text-gray-400 italic mb-3">
                  "{rev.comments}"
                </p>
              )}
              <div className="text-[9px] font-black text-gray-600 tracking-widest uppercase">
                {formatDate(rev.createdAt)}
              </div>
            </div>
          ))
        )}

        <DashboardPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black italic uppercase tracking-widest text-white">
                Edit <span className="text-red-600">Review</span>
              </h3>
              <button
                onClick={closeEdit}
                className="text-gray-500 hover:text-white transition text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-[9px] font-black tracking-widest text-gray-500 uppercase mb-1">
              Item
            </div>
            <p className="text-xs font-black italic text-white uppercase mb-5">
              {getLabel(editingReview)}
            </p>

            <div className="mb-5">
              <div className="text-[9px] font-black tracking-widest text-gray-500 uppercase mb-2">
                Rating
              </div>
              <StarPicker
                value={editForm.rating}
                onChange={(v) => setEditForm((f) => ({ ...f, rating: v }))}
              />
            </div>

            <div className="mb-4">
              <div className="text-[9px] font-black tracking-widest text-gray-500 uppercase mb-2">
                Title
              </div>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Short title..."
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition"
              />
            </div>

            <div className="mb-6">
              <div className="text-[9px] font-black tracking-widest text-gray-500 uppercase mb-2">
                Comment
              </div>
              <textarea
                rows={4}
                value={editForm.comments}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, comments: e.target.value }))
                }
                placeholder="Share your experience..."
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition resize-none"
              />
            </div>

            {editError && (
              <p className="text-[10px] font-black text-red-500 tracking-widest uppercase mb-4">
                {editError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeEdit}
                className="flex-1 border border-gray-700 text-gray-400 text-[10px] font-black tracking-widest py-3 rounded-xl uppercase hover:border-gray-500 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-red-600 text-white text-[10px] font-black tracking-widest py-3 rounded-xl uppercase hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
