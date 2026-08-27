import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

// Get or Create Cart for User
export const getMyCart = async (userId) => {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }
  
  const items = await CartItem.find({ cart_id: cart._id })
    .populate("product_id", "name amount images quantity");
    
  return { cart, items };
};

export const addItemToCart = async (userId, data) => {
  const { product_id, quantity } = data;

  const product = await Product.findById(product_id);
  if (!product) fail("Product not found.", 404);
  if (product.quantity < quantity) fail("Not enough stock available.", 400);

  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) cart = await Cart.create({ user_id: userId });

  let cartItem = await CartItem.findOne({ cart_id: cart._id, product_id });

  if (cartItem) {
    cartItem.quantity += quantity;
    if (product.quantity < cartItem.quantity) fail("Not enough stock available.", 400);
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({ cart_id: cart._id, product_id, quantity });
  }

  return getMyCart(userId);
};

export const updateCartItem = async (userId, cartItemId, quantity) => {
  const cartItem = await CartItem.findById(cartItemId).populate("product_id");
  if (!cartItem) fail("Cart item not found.", 404);

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart || !cartItem.cart_id.equals(cart._id)) fail("Item does not belong to your cart.", 403);

  if (cartItem.product_id.quantity < quantity) fail("Not enough stock available.", 400);

  cartItem.quantity = quantity;
  await cartItem.save();

  return getMyCart(userId);
};

export const removeCartItem = async (userId, cartItemId) => {
  const cartItem = await CartItem.findById(cartItemId);
  if (!cartItem) fail("Cart item not found.", 404);

  const cart = await Cart.findOne({ user_id: userId });
  if (!cart || !cartItem.cart_id.equals(cart._id)) fail("Item does not belong to your cart.", 403);

  await CartItem.findByIdAndDelete(cartItemId);
  
  return getMyCart(userId);
};

export const clearMyCart = async (userId) => {
  const cart = await Cart.findOne({ user_id: userId });
  if (cart) {
    await CartItem.deleteMany({ cart_id: cart._id });
  }
};
