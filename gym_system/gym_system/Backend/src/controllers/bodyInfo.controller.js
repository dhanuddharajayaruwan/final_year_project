import * as service from "../services/bodyInfo.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ status: "error", message: err.message, ...(process.env.NODE_ENV === "development" && { stack: err.stack }) });

export const create = async (req, res) => {
  try {
    const data = req.user.role === "admin" ? req.dto : { ...req.dto, user_id: req.user._id };
    const result = await service.createBodyInfo(data);
    res.status(201).json({ status: "success", info: result });
  } catch (err) { handle(res, err); }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllBodyInfo(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) { handle(res, err); }
};

export const getMe = async (req, res) => {
  try {
    const info = await service.getMyBodyInfo(req.user._id);
    res.status(200).json({ status: "success", info: info || null });
  } catch (err) { handle(res, err); }
};

export const getById = async (req, res) => {
  try {
    const info = await service.getBodyInfoById(req.params.id);
    res.status(200).json({ status: "success", info });
  } catch (err) { handle(res, err); }
};

export const updateMe = async (req, res) => {
  try {
    const info = await service.updateMyBodyInfo(req.user._id, req.dto);
    res.status(200).json({ status: "success", info });
  } catch (err) { handle(res, err); }
};

export const updateById = async (req, res) => {
  try {
    const info = await service.updateBodyInfoById(req.params.id, req.dto);
    res.status(200).json({ status: "success", info });
  } catch (err) { handle(res, err); }
};

export const remove = async (req, res) => {
  try {
    await service.deleteBodyInfo(req.params.id);
    res.status(200).json({ status: "success", message: "Deleted successfully" });
  } catch (err) { handle(res, err); }
};
