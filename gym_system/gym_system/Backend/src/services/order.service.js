import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Shipping from "../models/Shipping.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";
import { clearMyCart } from "./cart.service.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

export const createOrder = async (userId, data, fromCart = false) => {
  const { items, shipping_address, contact_number, shipping_charge, total_amount, guest_info, delivery_fee_id } = data;

  if (!items || items.length === 0) fail("Your order has no items.", 400);

  // Validate Products and Stock
  const processedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product_id);
    if (!product) fail(`Product with ID ${item.product_id} not found.`, 404);
    if (product.quantity < item.quantity) fail(`Product ${product.name} is out of stock or insufficient quantity.`, 400);

    // Decrement stock
    product.quantity -= item.quantity;
    await product.save();

    processedItems.push({
      product_id: product._id,
      quantity: item.quantity,
      price: product.amount
    });
    subtotal += (product.amount * item.quantity);
  }

  // Create Order
  const order = await Order.create({
    user_id: userId || null,
    items: processedItems,
    shipping_address,
    contact_number,
    guest_info: guest_info || null,
    subtotal,
    shipping_charge,
    total_amount, // or calculate: subtotal + shipping_charge
    order_status: "pending",
    payment_status: "pending",
  });

  // Create initial Payment record
  await Payment.create({
    order_id: order._id,
    payment_type: "card", // default
    amount: total_amount,
    payment_status: "pending",
  });

  // Create initial Shipping record
  await Shipping.create({
    order_id: order._id,
    delivery_fee_id: delivery_fee_id,
    shipping_status: "pending",
  });

  if (fromCart && userId) await clearMyCart(userId);

  // Email Notification
  const emailTo = guest_info?.email || (await User.findById(userId))?.email;
  const nameTo = guest_info?.name || (await User.findById(userId))?.name;

  if (emailTo) {
    sendOrderConfirmationEmail({
      to: emailTo,
      name: nameTo,
      orderId: order._id,
      productName: processedItems.length === 1 ? (await Product.findById(processedItems[0].product_id)).name : `${processedItems.length} items`,
      amount: total_amount,
      orderDate: order.createdAt.toLocaleDateString(),
    }).catch(e => console.warn("Order email failed:", e.message));
  }

  return order;
};

export const getMyOrders = async (userId, { page = 1, limit = 10 } = {}) => {
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments({ user_id: userId });
  const orders = await Order.find({ user_id: userId })
    .populate("items.product_id", "name images amount")
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  
  return { total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1, orders };
};

export const getAllOrders = async ({ page = 1, limit = 10, order_status, payment_status, search } = {}) => {
  const filter = {};
  if (order_status) filter.order_status = order_status;
  if (payment_status) filter.payment_status = payment_status;

  if (search) {
    const searchRegex = new RegExp(search, "i");
    filter.$or = [
      { "guest_info.name": searchRegex },
      { "guest_info.email": searchRegex },
      { contact_number: searchRegex }
    ];
    
    // If it looks like a MongoDB ObjectId, search by _id
    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      filter.$or.push({ _id: search });
    }
  }

  const skip  = (page - 1) * limit;
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("user_id", "name email")
    .populate("items.product_id", "name")
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  
  // Note: Searching for registered user names via populate is limited in standard find().
  // For a complete search including registered users, we'd use an aggregation pipeline.
  // We'll keep this simple for now or filter results if search is active.

  return { total, page: Number(page), pages: Math.ceil(total / limit), orders };
};

export const getOrderById = async (id, userId, role) => {
  const order = await Order.findById(id)
    .populate("user_id", "name email address")
    .populate("items.product_id", "name description amount images");

  if (!order) fail("Order not found.", 404);

  // Allow anyone to view guest orders (no user_id on the order)
  if (order.user_id) {
    // This is a user-owned order
    if (role === "admin") {
      // Admin can see all
    } else if (!userId) {
      // Guest trying to view a user's order — block
      fail("Please log in to view this order.", 401);
    } else if (!order.user_id._id.equals(userId)) {
      // Logged-in user trying to view someone else's order
      fail("Access denied to view this order.", 403);
    }
  }

  return order;
};

// Admin only
export const updateOrderStatus = async (id, status) => {
  const order = await Order.findByIdAndUpdate(id, { order_status: status }, { new: true })
    .populate("user_id", "name email")
    .populate("items.product_id", "name");

  if (!order) fail("Order not found.", 404);

  // Sync with Shipping collection
  if (status === "shipped" || status === "delivered") {
    const shippingUpdate = { shipping_status: status };
    if (status === "shipped") {
      shippingUpdate.shipped_date = new Date();
    }
    await Shipping.findOneAndUpdate({ order_id: id }, shippingUpdate);
  }

  return order;
};
