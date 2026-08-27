import * as service from "../services/cart.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const getMyCart = async (req, res) => {
  try {
    const result = await service.getMyCart(req.user._id);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const addItem = async (req, res) => {
  try {
    const result = await service.addItemToCart(req.user._id, req.dto);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const updateItem = async (req, res) => {
  try {
    const result = await service.updateCartItem(req.user._id, req.params.itemId, req.dto.quantity);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const removeItem = async (req, res) => {
  try {
    const result = await service.removeCartItem(req.user._id, req.params.itemId);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const clearCart = async (req, res) => {
  try {
    await service.clearMyCart(req.user._id);
    res.status(200).json({ status: "success", message: "Cart cleared successfully" });
  } catch (err) { handle(res, err); }
};
