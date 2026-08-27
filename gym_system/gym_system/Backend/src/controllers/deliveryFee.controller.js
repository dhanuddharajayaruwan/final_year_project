import service from "../services/deliveryFee.service.js";

const handle = (res, err) => res.status(err.statusCode || 500).json({ 
  status: "error", 
  message: err.message, 
  ...(process.env.NODE_ENV === "development" && { stack: err.stack }) 
});

const create = async (req, res, next) => {
  try {
    const fee = await service.create(req.dto);
    res.status(201).json({ status: "success", data: fee });
  } catch (error) {
    handle(res, error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await service.getAll(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    handle(res, error);
  }
};

const getById = async (req, res, next) => {
  try {
    const fee = await service.getById(req.params.id);
    if (!fee) return res.status(404).json({ status: "fail", message: "Delivery fee not found" });
    res.status(200).json({ status: "success", data: fee });
  } catch (error) {
    handle(res, error);
  }
};

const update = async (req, res, next) => {
  try {
    const fee = await service.update(req.params.id, req.dto);
    if (!fee) return res.status(404).json({ status: "fail", message: "Delivery fee not found" });
    res.status(200).json({ status: "success", data: fee });
  } catch (error) {
    handle(res, error);
  }
};

const remove = async (req, res, next) => {
  try {
    const fee = await service.remove(req.params.id);
    if (!fee) return res.status(404).json({ status: "fail", message: "Delivery fee not found" });
    res.status(204).send();
  } catch (error) {
    handle(res, error);
  }
};

export default { create, getAll, getById, update, remove };
