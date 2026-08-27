import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import productService from '../services/product.service';
import reviewService from '../services/review.service';
import authService from '../services/auth.service';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { showSuccess, showError } from '../utils/sweetAlerts';

const RelatedProducts = ({ currentProductId, categoryId }) => {
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggested = async () => {
      if (!categoryId) return;
      try {
        setLoading(true);
        const data = await productService.getAllProducts({ category_id: categoryId, limit: 10 });
        let list = data.products || data.data || data || [];
        // Filter out current product and take top 4
        list = list.filter(p => (p._id || p.id) !== currentProductId).slice(0, 4);
        setSuggested(list);
      } catch {
        // Silently fail suggestions
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, [currentProductId, categoryId]);

  if (loading || suggested.length === 0) return null;

  return (
    <div className="mt-24 border-t border-gray-900 pt-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            YOU MIGHT <span className="text-red-600">ALSO LIKE</span>
          </h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-2">Selected gear based on your current view</p>
        </div>
        <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-white transition-colors border-b border-red-600/30 pb-1">View Entire Store</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {suggested.map((item) => (
          <div 
            key={item._id || item.id}
            onClick={() => {
              navigate(`/product/${item._id || item.id}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-red-600/50 transition-all duration-500 hover:-translate-y-2 shadow-xl"
          >
            <div className="aspect-[4/3] bg-black overflow-hidden relative">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={authService.getImageUrl(item.images[0])} 
                  alt={item.name} 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-700 font-bold uppercase tracking-widest">No Image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-5">
              <h3 className="text-xs font-black text-white uppercase italic tracking-tight line-clamp-1 group-hover:text-red-500 transition-colors">{item.name}</h3>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-black text-white italic">
                  <span className="text-[9px] font-bold text-gray-500 mr-1 not-italic">Rs</span>
                  {Number(item.amount).toLocaleString()}
                </span>
                <span className="text-[8px] font-black text-red-600 uppercase tracking-widest border border-red-600/20 px-2 py-0.5 rounded">View</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        if (data && data.product) {
          setProduct(data.product);
        } else if (data && data.data) {
          setProduct(data.data);
        } else {
          setProduct(data);
        }
      } catch {
        showError("Error", "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product._id || product.id, quantity);
      showSuccess("Added to Cart", `${product.name} has been added to your cart.`);
    } catch {
      showError("Oops", "Something went wrong.");
    } finally {
      setIsAdding(false);
    }
  };

  const handlePayNow = () => {
    navigate('/checkout', { 
      state: { 
        product: product, 
        quantity: quantity 
      } 
    });
  };

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen text-white flex flex-col items-center justify-center">
        <Navbar />
        <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-[10px] uppercase tracking-widest font-black">Loading Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-[#121212] min-h-screen text-white flex flex-col items-center justify-center">
        <Navbar />
        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Product Not Found</h2>
        <Link to="/shop" className="mt-6 text-red-600 font-bold uppercase tracking-widest text-[10px] border border-red-600 px-6 py-2 hover:bg-red-600 hover:text-white transition">Back to Store</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];

  return (
    <div className="font-sans text-gray-200 bg-[#121212] min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-32 pb-24 px-6 md:px-16 container mx-auto flex-grow">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <Link to="/" className="hover:text-red-500 transition">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-red-500 transition">Shop</Link>
          <span>/</span>
          <span className="text-red-600 italic">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: Product Images */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative aspect-square bg-black rounded-xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center group">
              {images.length > 0 ? (
                <img 
                  src={authService.getImageUrl(images[currentImageIndex])} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="text-gray-600 text-xs uppercase font-black tracking-widest">No Image Available</div>
              )}
              
              {/* Image Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 bg-black flex items-center justify-center ${i === currentImageIndex ? 'border-red-600 shadow-lg shadow-red-600/20' : 'border-gray-800 opacity-50 hover:opacity-100 hover:border-gray-600'}`}
                  >
                    <img src={authService.getImageUrl(img)} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-2">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] italic border-b-2 border-red-600/30 pb-1">
                {product.category_id?.name || 'PREMIUM SERIES'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-2xl font-black text-white italic">
                <span className="text-[15px] font-bold text-gray-500 mr-1 not-italic">Rs</span>
                {Number(product.amount).toLocaleString()}
              </div>
              <div className="h-4 w-px bg-gray-800"></div>
              <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded ${
                product.isAvailable && product.quantity > 0
                  ? 'bg-green-600/10 text-green-500 border border-green-600/20'
                  : 'bg-red-600/10 text-red-500 border border-red-600/20'
              }`}>
                {product.isAvailable && product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </div>
              {product.isAvailable && product.quantity > 0 && (
                <span className={`text-[12px] font-bold uppercase tracking-widest ${product.quantity === 1 ? 'text-red-500' : 'text-gray-500'}`}>Only {product.quantity} left!</span>
              )}
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-8 shadow-xl">
              <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Description</h3>
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                {product.description || 'Elevate your fitness journey with our premium gym product. Crafted from high-quality materials and engineered for maximum durability, this piece of equipment/supplement is designed to help you reach your peak performance goals with ease and efficiency. Cylon Force endorsed quality you can trust.'}
              </p>
            </div>

            {/* Action Area */}
            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-gray-500 italic">Quantity</label>
                  <div className="flex items-center bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden h-12">
                    <button 
                      onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                      disabled = {product.isAvailable && product.quantity > 0 ? false : true}
                      className="px-4 hover:bg-red-600 hover:text-white transition-colors h-full text-lg font-bold"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      disabled = {product.isAvailable && product.quantity > 0 ? false : true}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 bg-transparent text-center font-bold text-sm focus:outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(q => q < (product.quantity || 99) ? q + 1 : q)}
                      disabled = {product.isAvailable && product.quantity > 0 ? false : true}
                      className="px-4 hover:bg-red-600 hover:text-white transition-colors h-full text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col gap-2">
                   <label className="text-[12px] font-black uppercase tracking-widest text-gray-500 italic">Subtotal</label>
                   <div className="h-12 flex items-center border-b-2 border-gray-800 text-xl font-black italic">
                     <span className="text-[15px] text-gray-500 mr-2 not-italic">Rs</span>
                     {Number(product.amount * quantity).toLocaleString()}
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={!user || !product.isAvailable || product.quantity <= 0 || isAdding}
                  className="flex items-center justify-center gap-2 bg-[#1a1a1a] border border-gray-800 hover:border-white text-white font-black text-xs tracking-widest py-4 rounded-xl uppercase transition-all hover:bg-gray-800 disabled:opacity-50"
                  title={!user ? "Please login to add to cart" : ""}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
                
                <button 
                  onClick={handlePayNow}
                  disabled={!product.isAvailable || product.quantity <= 0}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-white hover:text-red-600 text-white font-black text-xs tracking-widest py-4 rounded-xl uppercase transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pay Now
                </button>
              </div>
            </div>
            
            {/* Features Info */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-gray-900 pt-8">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-red-600 hover:bg-red-600/10 transition-colors cursor-help group/feat relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {/* Suggest Tip on Hover */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-red-600 text-white text-[9px] font-black tracking-widest p-2 rounded opacity-0 group-hover/feat:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 uppercase italic">
                    100% Authentic Cylon Force Gear
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-red-600 hover:bg-red-600/10 transition-colors cursor-help group/feat relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-red-600 text-white text-[9px] font-black tracking-widest p-2 rounded opacity-0 group-hover/feat:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 uppercase italic">
                    Island-wide Express Delivery
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-red-600 hover:bg-red-600/10 transition-colors cursor-help group/feat relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-red-600 text-white text-[9px] font-black tracking-widest p-2 rounded opacity-0 group-hover/feat:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 uppercase italic">
                    PayHere Secure Encryption
                  </div>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Secure Pay</span>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts currentProductId={product._id || product.id} categoryId={product.category_id?._id} />

        {/* ── Reviews Section ── */}
        <section id="reviews" className="mt-24 border-t border-gray-900 pt-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                CUSTOMER <span className="text-red-600">REVIEWS</span>
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex text-yellow-500 text-lg">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={s <= Math.round(product.avgRating || 0) ? 'block' : 'opacity-20'}>★</span>
                  ))}
                </div>
                <span className="text-sm font-black text-white italic">{product.avgRating || '0.0'} OUT OF 5.0</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">({product.numReviews || 0} Verified Reviews)</span>
              </div>
            </div>
          </div>

          <ProductReviews productId={product._id || product.id} />
        </section>
      </section>

      <Footer />
    </div>
  );
};

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await reviewService.getProductReviews(productId, { page, limit: 5 });
        setReviews(res.reviews || []);
        setTotalPages(res.pages || 1);
      } catch (err) {
        console.error("Failed to fetch product reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId, page]);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">No reviews yet for this product.</h3>
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2 italic">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {reviews.map((rev) => (
          <div key={rev._id} className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 md:p-8 hover:border-gray-700 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-1 text-yellow-500 text-sm">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={s <= rev.rating ? 'block' : 'opacity-20'}>★</span>
                ))}
              </div>
              <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
                {new Date(rev.createdAt).toLocaleDateString()}
              </span>
            </div>
            {rev.title && (
              <h4 className="text-sm font-black text-white italic uppercase tracking-tight mb-2">"{rev.title}"</h4>
            )}
            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6 italic">
              {rev.comments || "No comments provided."}
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-900">
              <div className="w-8 h-8 bg-red-600/10 rounded-full flex items-center justify-center text-red-600 text-[10px] font-black uppercase">
                {(rev.user_id?.name || rev.guest_name || "G")[0]}
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{rev.user_id?.name || rev.guest_name || "Guest Customer"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Verified Purchase</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-12">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
          >
            ← Previous
          </button>
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-[9px] font-black uppercase transition-all ${page === i + 1 ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-500 hover:bg-gray-800'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
