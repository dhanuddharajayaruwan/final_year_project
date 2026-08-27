import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import authService from '../services/auth.service';
import deliveryFeeService from '../services/deliveryFee.service';
import orderService from '../services/order.service';
import paymentService from '../services/payment.service';
import { showError, showSuccess, showConfirm } from '../utils/sweetAlerts';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);

  // checkoutData can have { product: {...}, quantity: 1 } if coming from ProductDetails
  const checkoutData = location.state || null;
  const isDirectPurchase = !!checkoutData?.product;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contact: user?.contact || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    district: user?.address?.district || '',
    postal_code: user?.address?.postal_code || '',
  });

  const [districts, setDistricts] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await deliveryFeeService.getAllFees();
        const list = data.fees || data.data || data || [];
        setDistricts(list);

        // Find initial shipping fee if user has a district
        if (formData.district) {
          const fee = list.find(f => f.district.toLowerCase() === formData.district.toLowerCase());
          if (fee) setSelectedFee(fee);
        }
      } catch {
        showError("Error", "Failed to load delivery information.");
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, [formData.district]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'district') {
      const fee = districts.find(f => f.district === value);
      setSelectedFee(fee || null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneRegex = /^(?:\+94|0)[1-9][0-9]{8}$/;
    if (!formData.contact.trim()) {
      newErrors.contact = "Phone number is required";
    } else if (!phoneRegex.test(formData.contact.replace(/\s/g, ''))) {
      newErrors.contact = "Please enter a valid Sri Lankan phone number";
    }

    if (!formData.street.trim()) newErrors.street = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.district) newErrors.district = "Please select a district";
    
    const postalRegex = /^[0-9]{5}$/;
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = "Postal code is required";
    } else if (!postalRegex.test(formData.postal_code)) {
      newErrors.postal_code = "Please enter a valid 5-digit postal code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSubtotal = () => {
    if (isDirectPurchase) {
      return checkoutData.product.amount * checkoutData.quantity;
    }
    return getCartTotal();
  };

  const subtotal = calculateSubtotal();
  const shippingCharge = selectedFee ? selectedFee.price : 0;
  const total = subtotal + shippingCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showError("Validation Error", "Please fix the errors in the form.");
      return;
    }

    if (!selectedFee) {
      showError("Shipping Info", "Please select a district to calculate shipping.");
      return;
    }

    const items = isDirectPurchase 
      ? [{ product_id: checkoutData.product._id || checkoutData.product.id, quantity: checkoutData.quantity, price: checkoutData.product.amount }]
      : cartItems.map(item => ({
          product_id: item.product_id._id || item.product_id.id,
          quantity: item.quantity,
          price: item.product_id.amount
        }));

    const orderPayload = {
      items,
      shipping_address: {
        street: formData.street,
        city: formData.city,
        district: formData.district,
        postal_code: formData.postal_code,
        country: "Sri Lanka"
      },
      contact_number: formData.contact,
      shipping_charge: shippingCharge,
      total_amount: total,
      delivery_fee_id: selectedFee?._id ?? null,
      guest_info: !user ? { name: formData.name, email: formData.email } : undefined,
    };

    const confirmed = await showConfirm("Confirm Order", `Total amount will be Rs ${total.toLocaleString()}. Proceed to payment?`);
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const res = await orderService.createOrder(orderPayload);
      
      if (res.status === 'success') {
        const orderId = res.order?._id || res.data?._id;
        
        // Get PayHere Params
        const payhereRes = await paymentService.getPayHereParams(orderId);
        
        if (payhereRes.status === 'success') {
          showSuccess("Order Placed", "Redirecting to PayHere gateway...");
          if (!isDirectPurchase) clearCart();
          
          // Redirect to PayHere
          payWithPayHere(payhereRes.data);
        } else {
           showSuccess("Order Placed", "Order was placed but payment initialization failed. Redirecting to order details...");
           navigate(`/orders/${orderId}`);
        }
      }
    } catch (err) {
      showError("Order Failed", err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const payWithPayHere = (params) => {
    // Determine Sandbox or Local
    const isSandbox = true; // Hardcoded for safety during development
    const url = isSandbox ? "https://sandbox.payhere.lk/pay/checkout" : "https://www.payhere.lk/pay/checkout";

    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', url);

    Object.keys(params).forEach(key => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', key);
      input.setAttribute('value', params[key]);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen text-white flex flex-col items-center justify-center">
        <Navbar />
        <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-[10px] uppercase tracking-widest font-black">Securing Session...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans flex flex-col">
      <Navbar />

      <main className="pt-32 pb-24 px-6 md:px-16 container mx-auto flex-grow">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Shipping Details */}
          <div className="w-full lg:w-2/3">
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-8 border-b border-gray-900 pb-4">
              SHIPPING <span className="text-red-600">DETAILS</span>
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-xl">
                <div className="md:col-span-2 mb-2">
                   <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic">Contact Information</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ENTER YOUR NAME"
                    className={`bg-black border ${errors.name ? 'border-red-600' : 'border-gray-800'} rounded-lg px-4 py-3 text-sm focus:border-red-600 outline-none transition-colors uppercase font-bold`}
                  />
                  {errors.name && <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{errors.name}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    disabled={user}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ENTER YOUR EMAIL"
                    className={`bg-black border ${errors.email ? 'border-red-600' : 'border-gray-800'} rounded-lg px-4 py-3 text-sm focus:border-red-600 outline-none transition-colors font-bold disabled:opacity-50`}
                  />
                  {errors.email && <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{errors.email}</span>}
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Phone Number</label>
                  <input 
                    type="text" 
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="ENTER YOUR PHONE NUMBER"
                    className={`bg-black border ${errors.contact ? 'border-red-600' : 'border-gray-800'} rounded-lg px-4 py-3 text-sm focus:border-red-600 outline-none transition-colors uppercase font-bold`}
                  />
                  {errors.contact && <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{errors.contact}</span>}
                </div>
              </div>

              {/* Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-xl">
                <div className="md:col-span-2 mb-2">
                   <h3 className="text-xs font-black uppercase tracking-widest text-red-600 italic">Shipping Address</h3>
                   <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Please ensure your address is accurate for express delivery.</p>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Street Address</label>
                  <input 
                    type="text" 
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="STREET NO, ROAD NAME"
                    className={`bg-black border ${errors.street ? 'border-red-600' : 'border-gray-800'} rounded-lg px-4 py-3 text-sm focus:border-red-600 outline-none transition-colors uppercase font-bold`}
                  />
                  {errors.street && <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{errors.street}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="CITY"
                    className={`bg-black border ${errors.city ? 'border-red-600' : 'border-gray-800'} rounded-lg px-4 py-3 text-sm focus:border-red-600 outline-none transition-colors uppercase font-bold`}
                  />
                  {errors.city && <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{errors.city}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">District</label>
                  <select 
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`bg-black border ${errors.district ? 'border-red-600' : 'border-gray-800'} rounded-lg px-4 py-3 text-sm focus:border-red-600 outline-none transition-colors uppercase font-bold appearance-none cursor-pointer`}
                  >
                    <option value="">SELECT DISTRICT</option>
                    {districts.map(d => (
                      <option key={d._id} value={d.district}>{d.district}</option>
                    ))}
                  </select>
                  {errors.district && <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{errors.district}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Postal Code</label>
                  <input 
                    type="text" 
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="POSTAL CODE"
                    className={`bg-black border ${errors.postal_code ? 'border-red-600' : 'border-gray-800'} rounded-lg px-4 py-3 text-sm focus:border-red-600 outline-none transition-colors uppercase font-bold`}
                  />
                  {errors.postal_code && <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">{errors.postal_code}</span>}
                </div>
              </div>

              <div className="hidden lg:block">
                 <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 text-white font-black text-xs tracking-widest py-5 rounded-2xl uppercase hover:bg-white hover:text-red-600 transition-all shadow-2xl shadow-red-600/20 disabled:opacity-50"
                >
                  {submitting ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-1/3">
             <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 sticky top-32 shadow-2xl">
                <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 border-b border-gray-900 pb-2">Order <span className="text-red-600">Summary</span></h2>
                
                {/* Items Preview */}
                <div className="space-y-4 mb-8 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {isDirectPurchase ? (
                    <div className="flex gap-4 group">
                      <div className="w-16 h-16 bg-black rounded shrink-0 overflow-hidden border border-gray-800">
                        <img 
                          src={authService.getImageUrl(checkoutData.product.images?.[0])} 
                          alt={checkoutData.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <h4 className="text-[10px] font-black uppercase italic tracking-tight line-clamp-1">{checkoutData.product.name}</h4>
                        <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Qty: {checkoutData.quantity}</span>
                        <span className="text-xs font-black italic">Rs {Number(checkoutData.product.amount * checkoutData.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    cartItems.map(item => (
                      <div key={item._id} className="flex gap-4 group">
                        <div className="w-16 h-16 bg-black rounded shrink-0 overflow-hidden border border-gray-800">
                           <img 
                            src={authService.getImageUrl(item.product_id.images?.[0])} 
                            alt={item.product_id.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-between">
                          <h4 className="text-[10px] font-black uppercase italic tracking-tight line-clamp-1">{item.product_id.name}</h4>
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Qty: {item.quantity}</span>
                          <span className="text-xs font-black italic">Rs {Number(item.product_id.amount * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Costs */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-white">Rs {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                       Shipping 
                       {selectedFee && <span className="text-[10px] bg-red-600/10 text-red-600 px-2 py-0.5 rounded border border-red-600/20">{selectedFee.district}</span>}
                    </span>
                    <span className={selectedFee ? "text-white" : "text-gray-600 italic"}>
                      {selectedFee ? `Rs ${selectedFee.price.toLocaleString()}` : "Select District"}
                    </span>
                  </div>
                  
                  {selectedFee && (
                    <div className="flex items-start gap-2 bg-blue-600/5 border border-blue-600/10 p-3 rounded-lg mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest leading-relaxed">
                        Estimated Delivery for {selectedFee.district}: {selectedFee.minimum_days}-{selectedFee.maximum_days} working days.
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-900 flex justify-between items-baseline">
                    <span className="text-sm font-black uppercase tracking-widest">Total</span>
                    <div className="text-right">
                       <div className="text-3xl font-black italic text-red-600 leading-none">Rs {total.toLocaleString()}</div>
                       <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase tracking-widest">Local Taxes Included</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 lg:hidden">
                   <button 
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-red-600 text-white font-black text-xs tracking-widest py-5 rounded-2xl uppercase hover:bg-white hover:text-red-600 transition-all shadow-2xl shadow-red-600/20 disabled:opacity-50"
                  >
                    {submitting ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-widest text-gray-600">Secure Payment</span>
                   </div>
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-[7px] font-black uppercase tracking-widest text-gray-600">Tracked Order</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
