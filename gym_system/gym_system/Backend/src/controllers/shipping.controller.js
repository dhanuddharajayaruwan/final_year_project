import * as service from "../services/shipping.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const getByOrderId = async (req, res) => {
  try {
    const result = await service.getShippingByOrderId(req.params.orderId, req.user._id, req.user.role);
    res.status(200).json({ status: "success", shipping: result.shipping });
  } catch (err) { handle(res, err); }
};

export const updateStatus = async (req, res) => {
  try {
    const shipping = await service.updateShippingStatus(req.params.id, req.dto);
    res.status(200).json({ status: "success", shipping });
  } catch (err) { handle(res, err); }
};



export const getAll = async (req, res) => {
  try {
    const result = await service.getAllShippings(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};
