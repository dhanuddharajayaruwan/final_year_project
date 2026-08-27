import * as service from "../services/order.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const create = async (req, res) => {
  try {
    const { fromCart } = req.query;
    const userId = req.user ? req.user._id : null;
    const order = await service.createOrder(userId, req.dto, fromCart === "true");
    res.status(201).json({ status: "success", order });
  } catch (err) { handle(res, err); }
};

export const getMy = async (req, res) => {
  try {
    const result = await service.getMyOrders(req.user._id, req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllOrders(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getById = async (req, res) => {
  try {
    const userId = req.user?._id ?? null;
    const role   = req.user?.role   ?? null;
    const order = await service.getOrderById(req.params.id, userId, role);
    res.status(200).json({ status: "success", order });
  } catch (err) { handle(res, err); }
};

export const updateStatus = async (req, res) => {
  try {
    const order = await service.updateOrderStatus(req.params.id, req.dto.order_status);
    res.status(200).json({ status: "success", order });
  } catch (err) { handle(res, err); }
};
