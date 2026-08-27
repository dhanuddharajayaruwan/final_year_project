import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import orderService from '../services/order.service';
import reviewService from '../services/review.service';
import authService from '../services/auth.service';

/* ─── Status helpers (mirrors OrderDetailPage) ─── */
const STATUS_COLORS = {
  pending:    { bg: 'bg-yellow-600/10', border: 'border-yellow-600/30', text: 'text-yellow-500', dot: 'bg-yellow-500' },
  processing: { bg: 'bg-blue-600/10',   border: 'border-blue-600/30',   text: 'text-blue-400',   dot: 'bg-blue-500'   },
  shipped:    { bg: 'bg-purple-600/10', border: 'border-purple-600/30', text: 'text-purple-400', dot: 'bg-purple-500' },
  delivered:  { bg: 'bg-green-600/10',  border: 'border-green-600/30',  text: 'text-green-400',  dot: 'bg-green-500'  },
  cancelled:  { bg: 'bg-red-600/10',    border: 'border-red-600/30',    text: 'text-red-400',    dot: 'bg-red-500'    },
};

const PAYMENT_COLORS = {
  pending: { text: 'text-yellow-500', label: 'PENDING' },
  success: { text: 'text-green-400',  label: 'PAID ✓'  },
  failed:  { text: 'text-red-500',    label: 'FAILED'  },
};

const STEPS = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
const STEP_MAP = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

/* ─── Main Component ─── */
const GuestOrderTrackPage = () => {
  const [searchParams] = useSearchParams();

  const [orderId, setOrderId]   = useState('');
  const [order,   setOrder]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);
  const [searched, setSearched] = useState(false);

  // Review state
  const [existingReview, setExistingReview] = useState(null);
  const [reviewForm, setReviewForm]   = useState({ rating: 5, title: '', comments: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  // Auto-search if ?id= param is present (e.g. from Navbar quick search)
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setOrderId(idParam);
      doSearch(idParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // MongoDB ObjectId must be exactly 24 hexadecimal characters
  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

  const doSearch = async (id) => {
    const trimmed = (id || orderId).trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    // Validate format before hitting the API
    if (!isValidObjectId(trimmed)) {
      setError('Order not found. Please check the ID and try again.');
      setLoading(false);
      return;
    }

    try {
      const res = await orderService.getOrderById(trimmed);
      const found = res.order || res.data;

      if (found.user_id) {
        setError('This order belongs to a registered account. Please log in to view it.');
        setLoading(false);
        return;
      }

      setOrder(found);
    } catch {
      setError('Order not found. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if review exists for this guest order
  useEffect(() => {
    if (!order || order.order_status !== 'delivered' || order.user_id) return;
    reviewService.getReviewByOrder(order._id)
      .then(res => setExistingReview(res.review || res.data || null))
      .catch(() => setExistingReview(null));
  }, [order]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.comments.trim()) {
      setReviewError('Please fill in both title and comments.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await reviewService.createReview({
        order_id: order._id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comments: reviewForm.comments.trim(),
      });
      setExistingReview(res.review || res.data);
      setReviewSuccess(true);
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReviewUpdate = async (e) => {
    e.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.comments.trim()) {
      setReviewError('Please fill in both title and comments.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await reviewService.updateReview(existingReview._id || existingReview.id, {
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comments: reviewForm.comments.trim(),
      });
      setExistingReview({ ...existingReview, ...reviewForm });
      setIsEditingReview(false);
      setReviewSuccess(true);
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Failed to update review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const startEdit = () => {
    setReviewForm({
      rating: existingReview.rating,
      title: existingReview.title,
      comments: existingReview.comments
    });
    setIsEditingReview(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    doSearch();
  };

  /* Derived display values */
  const orderStatus   = order?.order_status   || 'pending';
  const paymentStatus = order?.payment_status || 'pending';
  const statusStyle   = STATUS_COLORS[orderStatus]   || STATUS_COLORS.pending;
  const payStyle      = PAYMENT_COLORS[paymentStatus] || PAYMENT_COLORS.pending;
  const currentStep   = STEP_MAP[orderStatus] ?? 0;

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-16 container mx-auto flex-grow">

        {/* ── Page Header ── */}
        <div className="mb-10 border-b border-gray-900 pb-6">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            TRACK YOUR <span className="text-red-600">ORDER</span>
          </h1>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-2">
            Enter your Order ID from your confirmation email to view order details.
          </p>
        </div>

        {/* ── Search Bar ── */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl">
          <div className="relative flex-1">
            {/* Search Icon */}
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              id="order-id-input"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID  e.g. 67c3f8a1b2e4d00012345abc"
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl pl-11 pr-4 py-4
                         text-sm font-bold text-white placeholder-gray-600 outline-none
                         focus:border-red-600 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !orderId.trim()}
            className="bg-red-600 text-white font-black text-xs tracking-widest px-8 py-4 rounded-xl
                       uppercase hover:bg-white hover:text-red-600 transition-all disabled:opacity-40
                       disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Searching...
              </span>
            ) : 'Track Order'}
          </button>
        </form>

        {/* ── Error State ── */}
        {error && !loading && (
          <div className="max-w-2xl bg-red-600/10 border border-red-600/30 rounded-2xl p-6 flex items-start gap-4 mb-8">
            <span className="text-3xl">📦</span>
            <div>
              <h3 className="text-sm font-black uppercase italic text-red-400 tracking-tight">{error}</h3>
              {error.includes('registered account') && (
                <Link
                  to="/login"
                  className="inline-block mt-3 text-[10px] font-black uppercase tracking-widest
                             bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-white hover:text-red-600 transition-all"
                >
                  Log In →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Empty Search Hint ── */}
        {!searched && !order && (
          <div className="max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { icon: '📧', title: 'Check Your Email', desc: 'Your Order ID was sent to your email when you placed the order.' },
              { icon: '🔢', title: 'Paste the ID', desc: 'Copy the long Order ID from the confirmation email and paste it above.' },
              { icon: '📦', title: 'See Live Status', desc: 'View items, shipping address, payment status and tracking progress.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-5">
                <div className="text-3xl mb-3">{icon}</div>
                <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">{title}</h4>
                <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Order Result ── */}
        {order && !loading && (
          <div className="mt-4 space-y-6 animate-[fadeIn_.35s_ease]">

            {/* Header strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-900 pb-4 gap-3">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight">
                  Order <span className="text-red-600">Found</span>
                </h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">
                  ID: <span className="text-gray-300">{order._id}</span>
                </p>
              </div>
              <button
                onClick={() => { setOrder(null); setOrderId(''); setSearched(false); }}
                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-all"
              >
                ← Search Again
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left col */}
              <div className="lg:col-span-2 space-y-6">

                {/* Tracking Steps */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic mb-6">Order Tracking</h3>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-800 z-0" />
                    <div
                      className="absolute top-4 left-0 h-0.5 bg-red-600 z-0 transition-all duration-700"
                      style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />
                    {STEPS.map((step, i) => {
                      const done   = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                            ${done ? 'bg-red-600 border-red-600 text-white' : 'bg-[#1a1a1a] border-gray-700 text-gray-600'}
                            ${active ? 'ring-2 ring-red-600/30 ring-offset-2 ring-offset-[#1a1a1a]' : ''}`}>
                            {done ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span className="text-[10px] font-black">{i + 1}</span>
                            )}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest text-center ${done ? 'text-white' : 'text-gray-600'}`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guest Info */}
                {order.guest_info && (
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic mb-4">Customer Info</h3>
                    <div className="space-y-1.5">
                      {order.guest_info.name && (
                        <p className="text-sm font-bold text-gray-300">👤 {order.guest_info.name}</p>
                      )}
                      {order.guest_info.email && (
                        <p className="text-sm font-bold text-gray-300">✉️ {order.guest_info.email}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic mb-6">Items Ordered</h3>
                  <div className="space-y-4">
                    {(order.items || []).map((item, idx) => {
                      const product = item.product_id;
                      return (
                        <div key={idx} className="flex gap-4 pb-4 border-b border-gray-900 last:border-b-0 last:pb-0">
                          <div className="w-16 h-16 bg-black rounded-lg overflow-hidden border border-gray-800 shrink-0">
                            {product?.images?.[0] && (
                              <img src={authService.getImageUrl(product.images[0])} alt={product?.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="text-sm font-black uppercase italic tracking-tight">{product?.name || 'Product'}</h4>
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Qty: {item.quantity}</span>
                            </div>
                            <span className="text-sm font-black italic text-white flex-shrink-0 ml-2">
                              Rs {Number(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic mb-4">Shipping Address</h3>
                    <p className="text-sm font-bold text-gray-300 leading-relaxed">
                      {order.shipping_address.street},<br />
                      {order.shipping_address.city}, {order.shipping_address.district}<br />
                      {order.shipping_address.postal_code}, {order.shipping_address.country}
                    </p>
                    {order.contact_number && (
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-3">
                        📞 {order.contact_number}
                      </p>
                    )}
                  </div>
                )}

                {/* ── Guest Review Section ── */}
                {orderStatus === 'delivered' && !order.user_id && (
                  <div id="review-form-section" className="review-highlight bg-[#1a1a1a] border border-red-600/30 rounded-2xl p-8 scroll-mt-32">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic mb-6">
                      {existingReview ? 'Update Your Status' : 'Guest Feedback'}
                    </h3>

                    <div className="review-form-enter">
                      <form onSubmit={isEditingReview ? handleReviewUpdate : handleReviewSubmit} className="space-y-5">
                        {/* Display existing review */}
                        {existingReview && !isEditingReview ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} className={`text-xl ${s <= existingReview.rating ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                                ))}
                              </div>
                              <button 
                                type="button" 
                                onClick={startEdit} 
                                className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-white"
                              >
                                Edit Feedback
                              </button>
                            </div>
                            <h4 className="text-sm font-black italic text-white uppercase tracking-tight">{existingReview.title}</h4>
                            <p className="text-xs text-gray-400 font-medium leading-relaxed">{existingReview.comments}</p>
                            {reviewSuccess && <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">✓ Guest feedback synchronized!</p>}
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Rating</p>
                                <div className="flex gap-1">
                                  {[1,2,3,4,5].map(s => (
                                    <button
                                      key={s}
                                      type="button"
                                      onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                                      className={`text-2xl transition-transform hover:scale-110 ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`}
                                    >★</button>
                                  ))}
                                </div>
                              </div>
                              {existingReview && isEditingReview && (
                                <button 
                                  type="button" 
                                  onClick={() => setIsEditingReview(false)} 
                                  className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white"
                                >
                                  Back to View
                                </button>
                              )}
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Feedback Title</label>
                              <input
                                type="text"
                                value={reviewForm.title}
                                onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Exceptional quality!"
                                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-600 transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Your Thoughts</label>
                              <textarea
                                rows={3}
                                value={reviewForm.comments}
                                onChange={e => setReviewForm(f => ({ ...f, comments: e.target.value }))}
                                placeholder="Share your detailed experience..."
                                className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-600 transition-all resize-none"
                              />
                            </div>
                            {reviewError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{reviewError}</p>}
                            <button
                              type="submit"
                              disabled={reviewSubmitting}
                              className="w-full bg-red-600 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase hover:bg-white hover:text-red-600 transition-all disabled:opacity-40"
                            >
                              {reviewSubmitting ? 'Processing...' : (existingReview ? 'Sync Changes' : 'Transmit Feedback')}
                            </button>
                          </>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Right col */}
              <div className="space-y-6">

                {/* Status Card */}
                <div className={`${statusStyle.bg} border ${statusStyle.border} rounded-2xl p-6`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Order Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot} animate-pulse`} />
                    <span className={`text-xl font-black italic uppercase tracking-tight ${statusStyle.text}`}>
                      {orderStatus}
                    </span>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic">Payment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-white">Rs {Number(order.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>Shipping</span>
                      <span className="text-white">Rs {Number(order.shipping_charge || 0).toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-900 flex justify-between items-baseline">
                      <span className="text-sm font-black uppercase">Total</span>
                      <span className="text-2xl font-black italic text-red-600">
                        Rs {Number(order.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-900 flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Payment</span>
                      <span className={`text-xs font-black uppercase tracking-widest ${payStyle.text}`}>
                        {payStyle.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Date */}
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Order Date</p>
                  <p className="text-sm font-bold text-white">
                    {new Date(order.createdAt).toLocaleDateString('en-LK', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>

                <Link
                  to="/shop"
                  className="block w-full text-center bg-red-600 text-white font-black text-xs tracking-widest
                             py-4 rounded-2xl uppercase hover:bg-white hover:text-red-600 transition-all
                             shadow-xl shadow-red-600/20"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GuestOrderTrackPage;
