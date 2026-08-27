import { axiosPrivate, axiosInstance } from '../utils/axios';

const paymentService = {
  getPayHereParams: async (orderId) => {
    const token = localStorage.getItem('token');
    const instance = token ? axiosPrivate : axiosInstance;
    const response = await instance.get(`payments/payhere-params/${orderId}`);
    return response.data;
  },

  getPaymentByOrderId: async (orderId) => {
    const response = await axiosPrivate.get(`payments/order/${orderId}`);
    return response.data;
  },

  // Called when user returns from PayHere with ?payment=success
  // Ensures both Order and Payment collections are updated
  // (a fallback for when the notify webhook didn't fire e.g. ngrok expired)
  // Uses axiosInstance (public) since the webhook endpoint has no auth middleware
  syncPaymentSuccess: async (orderId) => {
    const response = await axiosInstance.post(`payments/webhook/success/${orderId}`);
    return response.data;
  },
};

export default paymentService;
