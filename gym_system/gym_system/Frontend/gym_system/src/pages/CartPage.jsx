import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CartContext } from '../context/CartContext';
import authService from '../services/auth.service';
import { showConfirm, showSuccess } from '../utils/sweetAlerts';

const CartPage = () => {
  const { cartItems, updateQuantity, removeCartItem, clearCart, getCartTotal, loading } = useContext(CartContext);
  const navigate = useNavigate();

  const handleUpdate = (itemId, currentQuantity, change) => {
    updateQuantity(itemId, currentQuantity + change);
  };

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <section className="pt-32 pb-16 px-6 md:px-16 container mx-auto flex-grow">
        <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-8 border-b border-gray-900 pb-4">
          YOUR <span className="text-red-600">CART</span>
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-24 bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-6">Your cart is empty.</h3>
            <Link to="/shop" className="bg-red-600 text-white font-black text-[10px] tracking-widest px-8 py-3 rounded uppercase hover:bg-white hover:text-red-600 transition">
              RETURN TO SHOP
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items List */}
            <div className="w-full lg:w-2/3 space-y-4">
              {cartItems.map((item) => {
                const product = item.product_id;
                if (!product) return null; // Defensive check
                
                const image = product.images && product.images.length > 0 ? product.images[0] : null;

                return (
                  <div key={item._id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-6 relative shadow-lg">
                    
                    {/* Item Image */}
                    <div className="w-full sm:w-24 h-24 flex-shrink-0 bg-black rounded overflow-hidden flex items-center justify-center">
                      {image ? (
                        <img 
                          src={authService.getImageUrl(image)} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                         <span className="text-gray-700 text-[8px] font-black tracking-widest uppercase">No Img</span>
                      )}
                    </div>
                    
                    {/* Item Info */}
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className="text-sm font-black text-white italic tracking-tight uppercase line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-xs font-bold text-red-600 mb-2">Rs {Number(product.amount).toLocaleString()}</p>
                      
                      {/* Controls */}
                      <div className="flex items-center justify-center sm:justify-start gap-4">
                        <div className="flex items-center bg-black border border-gray-700 rounded overflow-hidden">
                          <button 
                            onClick={() => handleUpdate(item._id, item.quantity, -1)}
                            className="px-3 py-1 text-gray-400 hover:text-white hover:bg-red-600 transition font-black"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-xs font-bold w-10 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdate(item._id, item.quantity, 1)}
                            className="px-3 py-1 text-gray-400 hover:text-white hover:bg-red-600 transition font-black"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Total Price & Delete */}
                    <div className="flex flex-col items-center sm:items-end w-full sm:w-auto mt-4 sm:mt-0 gap-2">
                       <span className="text-lg font-black italic">
                         Rs {Number(product.amount * item.quantity).toLocaleString()}
                       </span>
                       <button 
                        onClick={async () => {
                           const confirmed = await showConfirm("Remove Item?", "Are you sure you want to remove this item from your cart?");
                           if (confirmed) {
                             await removeCartItem(item._id);
                             showSuccess("Item Removed", "The product was removed from your cart.");
                           }
                         }}
                        className="text-[10px] font-bold tracking-widest text-gray-500 hover:text-red-500 uppercase flex items-center gap-1 transition-colors"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                         Remove
                       </button>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex justify-between items-center mt-6">
                <Link to="/shop" className="text-[11px] text-gray-400 hover:text-white font-bold uppercase tracking-widest transition flex items-center gap-2">
                  ← Continue Shopping
                </Link>
                <button 
                   onClick={async () => {
                     const confirmed = await showConfirm("Clear Cart?", "Are you sure you want to remove all items from your cart?");
                     if (confirmed) {
                       await clearCart();
                       showSuccess("Cart Cleared", "All items have been removed.");
                     }
                   }}
                  className="text-[11px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest transition border border-red-500/30 px-4 py-2 rounded"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl p-6 sticky top-24">
                <h2 className="text-xl font-black italic uppercase tracking-tighter mb-4 border-b border-gray-800 pb-2">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-400 font-bold">
                    <span>Subtotal</span>
                    <span className="text-white">Rs {Number(getCartTotal()).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 font-bold">
                    <span>Shipping</span>
                    <span className="text-gray-500 italic">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-800 pt-3 mt-3 flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest">Total</span>
                    <span className="text-2xl font-black italic text-red-500">
                      Rs {Number(getCartTotal()).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-red-600 hover:bg-white hover:text-red-600 text-white font-black text-[12px] tracking-widest py-4 rounded uppercase transition-colors shadow-lg shadow-red-600/20"
                >
                  Proceed to Checkout
                </button>
                
                <p className="text-[9px] text-gray-500 text-center mt-4 uppercase tracking-widest font-black">Secure Checkout Processing</p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default CartPage;
