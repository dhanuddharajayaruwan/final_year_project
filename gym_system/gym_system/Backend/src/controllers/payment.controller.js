import * as service from "../services/payment.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const getByOrderId = async (req, res) => {
  try {
    const payment = await service.getPaymentByOrderId(req.params.orderId, req.user._id, req.user.role);
    res.status(200).json({ status: "success", payment });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllPayments(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const updateStatus = async (req, res) => {
  try {
    const payment = await service.updatePaymentStatus(req.params.id, req.dto.payment_status);
    res.status(200).json({ status: "success", payment });
  } catch (err) { handle(res, err); }
};

// Simulated Webhook Endpoint
export const simulateSuccess = async (req, res) => {
  try {
    const payment = await service.markPaymentSuccessful(req.params.orderId);
    res.status(200).json({ status: "success", message: "Payment successful (Simulated)", payment });
  } catch (err) { handle(res, err); }
};

export const getPayHereParams = async (req, res) => {
  try {
    const data = await service.generatePayHereDetails(req.params.orderId);
    res.status(200).json({ status: "success", data });
  } catch (err) { handle(res, err); }
};

export const notifyPayHere = async (req, res) => {
  try {
    await service.handlePayHereNotify(req.body);
    res.status(200).send("OK");
  } catch (err) { res.status(500).send("Error"); }
};
