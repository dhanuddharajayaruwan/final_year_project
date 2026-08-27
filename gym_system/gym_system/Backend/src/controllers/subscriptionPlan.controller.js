import * as service from "../services/subscriptionPlan.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const create = async (req, res) => {
  try {
    const plan = await service.createSubscriptionPlan(req.dto);
    res.status(201).json({ status: "success", plan });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllSubscriptionPlans(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getById = async (req, res) => {
  try {
    const plan = await service.getSubscriptionPlanById(req.params.id);
    res.status(200).json({ status: "success", plan });
  } catch (err) { handle(res, err); }
};

export const update = async (req, res) => {
  try {
    const plan = await service.updateSubscriptionPlan(req.params.id, req.dto);
    res.status(200).json({ status: "success", plan });
  } catch (err) { handle(res, err); }
};

export const remove = async (req, res) => {
  try {
    await service.deleteSubscriptionPlan(req.params.id);
    res.status(200).json({ status: "success", message: "Deleted successfully" });
  } catch (err) { handle(res, err); }
};
