import DeliveryFee from "../models/DeliveryFee.js";

const create = async (data) => {
  return await DeliveryFee.create(data);
};

const getAll = async ({ page = 1, limit = 10, search } = {}) => {
  const filter = {};
  if (search) filter.district = new RegExp(search, "i");

  const skip = (Number(page) - 1) * Number(limit);
  const total = await DeliveryFee.countDocuments(filter);
  const data = await DeliveryFee.find(filter)
    .sort({ district: 1 })
    .skip(skip)
    .limit(Number(limit));

  return { 
    total, 
    page: Number(page), 
    pages: Math.ceil(total / Number(limit)) || 1, 
    data 
  };
};

const getById = async (id) => {
  return await DeliveryFee.findById(id);
};

const update = async (id, data) => {
  return await DeliveryFee.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const remove = async (id) => {
  return await DeliveryFee.findByIdAndDelete(id);
};

export default { create, getAll, getById, update, remove };
