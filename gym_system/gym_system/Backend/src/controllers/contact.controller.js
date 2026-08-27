import * as service from "../services/contact.service.js";

const handle = (res, err) =>
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });

export const create = async (req, res) => {
  try {
    const contact = await service.createContact(req.dto);
    res
      .status(201)
      .json({
        status: "success",
        message: "Message sent successfully!",
        contact,
      });
  } catch (err) {
    handle(res, err);
  }
};

export const getAll = async (req, res) => {
  try {
    const result = await service.getAllContacts(req.query);
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    handle(res, err);
  }
};

export const markRead = async (req, res) => {
  try {
    const contact = await service.markRead(req.params.id);
    if (!contact)
      return res.status(404).json({ status: "fail", message: "Not found" });
    res.status(200).json({ status: "success", contact });
  } catch (err) {
    handle(res, err);
  }
};

export const remove = async (req, res) => {
  try {
    const contact = await service.deleteContact(req.params.id);
    if (!contact)
      return res.status(404).json({ status: "fail", message: "Not found" });
    res.status(200).json({ status: "success", message: "Deleted" });
  } catch (err) {
    handle(res, err);
  }
};
