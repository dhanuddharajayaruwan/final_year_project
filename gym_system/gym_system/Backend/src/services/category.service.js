import Category from "../models/Category.js";

const fail = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; throw e; };

export const createCategory = async (data) => {
  const existing = await Category.findOne({ name: data.name.trim(), type: data.type });
  if (existing) fail("A category with this name and type already exists.", 409);
  return await Category.create(data);
};

export const getAllCategories = async ({ page = 1, limit = 20, type, search } = {}) => {
  const filter = {};
  if (type) filter.type = type;
  if (search) filter.name = { $regex: search, $options: "i" };
  const skip  = (page - 1) * limit;
  const total = await Category.countDocuments(filter);
  const categories = await Category.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit));
  return { total, page: Number(page), pages: Math.ceil(total / limit), categories };
};

export const getCategoryById = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) fail("Category not found.", 404);
  return cat;
};

export const updateCategory = async (id, updates) => {
  const cat = await Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!cat) fail("Category not found.", 404);
  return cat;
};

export const deleteCategory = async (id) => {
  const cat = await Category.findByIdAndDelete(id);
  if (!cat) fail("Category not found.", 404);
};
