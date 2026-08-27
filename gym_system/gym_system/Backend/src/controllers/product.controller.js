import * as service from "../services/product.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const create = async (req, res) => {
  try {
    // If multer middleware was used, map webPaths into DTO
    let data = req.dto;
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => f.webPath);
    }
    const product = await service.createProduct(data);
    res.status(201).json({ status: "success", product });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllProducts(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getById = async (req, res) => {
  try {
    const product = await service.getProductById(req.params.id);
    res.status(200).json({ status: "success", product });
  } catch (err) { handle(res, err); }
};

export const update = async (req, res) => {
  try {
    let data = req.dto;
    // req.dto.images now contains the URLs we want to KEEP (sent via FormData as strings)
    // If new files were uploaded, append them to the existing ones
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => f.webPath);
      data.images = [...(data.images || []), ...newImages];
    }
    const product = await service.updateProduct(req.params.id, data);
    res.status(200).json({ status: "success", product });
  } catch (err) { handle(res, err); }
};

export const remove = async (req, res) => {
  try {
    await service.deleteProduct(req.params.id);
    res.status(200).json({ status: "success", message: "Deleted successfully" });
  } catch (err) { handle(res, err); }
};
