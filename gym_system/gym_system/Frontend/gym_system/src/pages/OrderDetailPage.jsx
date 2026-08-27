import React, { useEffect, useState, useContext } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import orderService from '../services/order.service';
import paymentService from '../services/payment.service';
import reviewService from '../services/review.service';
import authService from '../services/auth.service';
import { AuthContext } from '../context/AuthContext';

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

const OrderDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const paymentResult = searchParams.get('payment'); // 'success' | 'cancel'

  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review state
  const [existingReview, setExistingReview] = useState(null);
  const [reviewForm, setReviewForm]   = useState({ rating: 5, title: '', comments: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // If user returned from PayHere with success, sync payment status first
        // This is a fallback for when the notify webhook (ngrok) doesn't fire
        if (paymentResult === 'success') {
          try {
            await paymentService.syncPaymentSuccess(id);
          } catch {
            // Silently fail — notify may have already fired
          }
        }

        const res = await orderService.getOrderById(id);
        setOrder(res.order || res.data);
      } catch {
        setError('Order not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, paymentResult]);

  // Check if review exists for this order
  useEffect(() => {
    if (!order || order.order_status !== 'delivered' || !user || user.role !== 'client') return;
    reviewService.getReviewByOrder(id)
      .then(res => setExistingReview(res.review || res.data || null))
      .catch(() => setExistingReview(null));
  }, [order, id, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.comments.trim()) {
      setReviewError('Please fill in the title and comments.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await reviewService.createReview({
        order_id: id,
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
      setReviewError('Please fill in the title and comments.');
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

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Loading Order...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#121212] min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-4 px-6">
          <div className="text-6xl">📦</div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight">{error || 'Order Not Found'}</h2>
          <Link to="/shop" className="mt-4 bg-red-600 text-white font-black text-xs tracking-widest py-3 px-8 rounded-xl uppercase hover:bg-white hover:text-red-600 transition-all">
            Back to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const orderStatus  = order.order_status   || 'pending';
  const paymentStatus = order.payment_status || 'pending';
  const statusStyle  = STATUS_COLORS[orderStatus]  || STATUS_COLORS.pending;
  const payStyle     = PAYMENT_COLORS[paymentStatus] || PAYMENT_COLORS.pending;
  const currentStep  = STEP_MAP[orderStatus] ?? 0;

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-16 container mx-auto flex-grow">

        {/* Payment Banner */}
        {paymentResult === 'success' && (
          <div className="mb-8 bg-green-600/10 border border-green-600/30 rounded-2xl p-6 flex items-center gap-4">
            <div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-green-400">Payment Successful!</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Your payment has been confirmed. A confirmation email has been sent to you.
              </p>
            </div>
          </div>
        )}
        {paymentResult === 'cancel' && (
          <div className="mb-8 bg-red-600/10 border border-red-600/30 rounded-2xl p-6 flex items-center gap-4">
            <div className="text-4xl">❌</div>
            <div>
              <h2 className="text-lg font-black uppercase italic tracking-tight text-red-400">Payment Cancelled</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                Your payment was cancelled. Your order is still saved — you can retry payment below.
              </p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-900 pb-4 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
              ORDER <span className="text-red-600">DETAILS</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
              ID: <span className="text-gray-300">{order._id}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/shop" className="border border-gray-700 text-gray-400 font-black text-[10px] tracking-widest py-3 px-6 rounded-xl uppercase hover:border-red-600 hover:text-red-600 transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Order Items + Tracking */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Tracking Steps */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic mb-6">Order Tracking</h3>
              <div className="flex items-center justify-between relative">
                {/* Connector line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-800 z-0" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-red-600 z-0 transition-all duration-700"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((step, i) => {
                  const done    = i <= currentStep;
                  const active  = i === currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-[#1a1a1a] border-gray-700 text-gray-600'
                      } ${active ? 'ring-2 ring-red-600/30 ring-offset-2 ring-offset-[#1a1a1a]' : ''}`}>
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

            {/* Items */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic mb-6">Items Ordered</h3>
              <div className="space-y-4">
                {(order.items || []).map((item, idx) => {
                  const product = item.product_id;
                  return (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-gray-900 last:border-b-0 last:pb-0 group/item">
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

            {/* ── Review Section ── */}
            {orderStatus === 'delivered' && user?.role === 'client' && (
              <div id="review-form-section" className="review-highlight bg-[#1a1a1a] border border-red-600/30 rounded-2xl p-8 scroll-mt-32">
                <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic mb-6">
                  {existingReview ? 'Your Purchase Feedback' : 'Rate Your Experience'}
                </h3>

                <div className="review-form-enter">
                  <form onSubmit={isEditingReview ? handleReviewUpdate : handleReviewSubmit} className="space-y-5">
                    {/* Review Display (Read-only mode if exists and not editing) */}
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
                            Edit Review
                          </button>
                        </div>
                        <p className="text-sm font-black italic text-white uppercase tracking-tight">{existingReview.title}</p>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{existingReview.comments}</p>
                        {reviewSuccess && (
                          <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">✓ Review Updated Successfully!</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Overall Rating</p>
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
                          {isEditingReview && (
                            <button 
                              type="button"
                              onClick={() => setIsEditingReview(false)}
                              className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Review Title</label>
                          <input
                            type="text"
                            value={reviewForm.title}
                            onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Exceptional gear and service!"
                            className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-600 transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 block">Your Thoughts</label>
                          <textarea
                            rows={3}
                            value={reviewForm.comments}
                            onChange={e => setReviewForm(f => ({ ...f, comments: e.target.value }))}
                            placeholder="How was the quality? Did it arrive on time?"
                            className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-red-600 transition-all resize-none"
                          />
                        </div>

                        {reviewError && (
                          <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{reviewError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="w-full bg-red-600 text-white font-black text-xs tracking-widest py-3 rounded-xl uppercase hover:bg-white hover:text-red-600 transition-all disabled:opacity-40"
                        >
                          {reviewSubmitting ? 'Syncing...' : (existingReview ? 'Update Review' : 'Submit Review')}
                        </button>
                      </>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right: Summary */}
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

            {/* Cost Summary */}
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

            {/* Date */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Order Date</p>
              <p className="text-sm font-bold text-white">
                {new Date(order.createdAt).toLocaleDateString('en-LK', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>

            <Link
              to="/shop"
              className="block w-full text-center bg-red-600 text-white font-black text-xs tracking-widest py-4 rounded-2xl uppercase hover:bg-white hover:text-red-600 transition-all shadow-xl shadow-red-600/20"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetailPage;
