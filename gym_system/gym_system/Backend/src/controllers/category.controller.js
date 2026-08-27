import * as service from "../services/category.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const create = async (req, res) => {
  try {
    const category = await service.createCategory(req.dto);
    res.status(201).json({ status: "success", category });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllCategories(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getById = async (req, res) => {
  try {
    const category = await service.getCategoryById(req.params.id);
    res.status(200).json({ status: "success", category });
  } catch (err) { handle(res, err); }
};

export const update = async (req, res) => {
  try {
    const category = await service.updateCategory(req.params.id, req.dto);
    res.status(200).json({ status: "success", category });
  } catch (err) { handle(res, err); }
};

export const remove = async (req, res) => {
  try {
    await service.deleteCategory(req.params.id);
    res.status(200).json({ status: "success", message: "Deleted successfully" });
  } catch (err) { handle(res, err); }
};
