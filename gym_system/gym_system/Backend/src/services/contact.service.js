import Contact from "../models/Contact.js";

export const createContact = async (data) => {
  return await Contact.create(data);
};

export const getAllContacts = async ({
  page = 1,
  limit = 20,
  is_read,
} = {}) => {
  const filter = {};
  if (is_read !== undefined) filter.is_read = is_read === "true";

  const skip = (page - 1) * limit;
  const total = await Contact.countDocuments(filter);
  const contacts = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / limit) || 1,
    contacts,
  };
};

export const markRead = async (id) => {
  return await Contact.findByIdAndUpdate(id, { is_read: true }, { new: true });
};

export const deleteContact = async (id) => {
  return await Contact.findByIdAndDelete(id);
};
