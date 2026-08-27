import * as service from "../services/trainingSubscription.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const create = async (req, res) => {
  try {
    const data = req.user.role === "admin" ? req.dto : { ...req.dto, user_id: req.user._id };
    const sub = await service.createSubscription(data);
    res.status(201).json({ status: "success", subscription: sub });
  } catch (err) { handle(res, err); }
};

export const initiatePayHere = async (req, res) => {
  try {
    const result = await service.initiatePayHereSubscription(req.user._id, req.params.planId);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const initiateBank = async (req, res) => {
  try {
    const sub = await service.initiateBankSubscription(req.user._id, req.params.planId, req.body.slipId);
    res.status(201).json({ status: "success", subscription: sub });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllSubscriptions(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getMy = async (req, res) => {
  try {
    const result = await service.getMySubscriptions(req.user._id, req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getById = async (req, res) => {
  try {
    const sub = await service.getSubscriptionById(req.params.id);
    res.status(200).json({ status: "success", subscription: sub });
  } catch (err) { handle(res, err); }
};

export const update = async (req, res) => {
  try {
    const sub = await service.updateSubscription(req.params.id, req.dto);
    res.status(200).json({ status: "success", subscription: sub });
  } catch (err) { handle(res, err); }
};

export const remove = async (req, res) => {
  try {
    await service.deleteSubscription(req.params.id);
    res.status(200).json({ status: "success", message: "Deleted successfully" });
  } catch (err) { handle(res, err); }
};
