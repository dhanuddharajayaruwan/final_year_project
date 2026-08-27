import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { deleteFile } from "../utils/upload.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

const addStatsToProduct = async (product) => {
  // Find all orders containing this product
  const orders = await Order.find({ "items.product_id": product._id }).select("_id");
  const orderIds = orders.map(o => o._id);

  const stats = await Review.aggregate([
    { $match: { order_id: { $in: orderIds } } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  const pObj = product.toObject();
  pObj.avgRating = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : 0;
  pObj.numReviews = stats.length > 0 ? stats[0].count : 0;
  return pObj;
};

export const createProduct = async (data) => {
  const category = await Category.findById(data.category_id);
  if (!category) fail("Category not found.", 404);
  return await Product.create(data);
};

export const getAllProducts = async ({ page = 1, limit = 12, category_id, search, minPrice, maxPrice } = {}) => {
  const filter = {};
  if (category_id && category_id !== "All") filter.category_id = category_id;
  if (search) filter.name = { $regex: search, $options: "i" };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.amount = {};
    if (minPrice !== undefined) filter.amount.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.amount.$lte = Number(maxPrice);
  }

  const skip  = (page - 1) * limit;
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("category_id", "name type")
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  
  // Attach review stats
  const productWithStats = await Promise.all(products.map(p => addStatsToProduct(p)));

  return { total, page: Number(page), pages: Math.ceil(total / limit), products: productWithStats };
};

export const getProductById = async (id) => {
  const product = await Product.findById(id).populate("category_id", "name type");
  if (!product) fail("Product not found.", 404);
  return await addStatsToProduct(product);
};

export const updateProduct = async (id, updates) => {
  const product = await Product.findById(id);
  if (!product) fail("Product not found.", 404);

  if (updates.category_id) {
    const category = await Category.findById(updates.category_id);
    if (!category) fail("Category not found.", 404);
  }

  // If new images are provided, delete ones that are replaced/removed
  if (updates.images && Array.isArray(updates.images)) {
    const oldImages = product.images || [];
    const imagesToDelete = oldImages.filter(img => !updates.images.includes(img));
    await Promise.all(imagesToDelete.map(img => deleteFile(img)));
  }
  
  const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    .populate("category_id", "name type");
    
  return updatedProduct;
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) fail("Product not found.", 404);

  // Delete images from disk
  if (product.images && product.images.length > 0) {
    await Promise.all(product.images.map(img => deleteFile(img)));
  }

  await Product.findByIdAndDelete(id);
};
