import {
  isMongoId,
  isNumber,
  isIn,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";
import { PAYMENT_TYPE_ENUM, PAYMENT_STATUS_ENUM } from "../enums/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreatePaymentDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreatePaymentDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.order_id     = data.order_id;
    this.payment_type = data.payment_type;
    this.amount       = data.amount;
    this.status       = data.status ?? "pending";
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.order_id ?? "")),
      "order_id", "A valid order ID (MongoDB ObjectId) is required");

    this._check(e, !isIn(this.payment_type, PAYMENT_TYPE_ENUM),
      "payment_type", `Payment type must be one of: ${PAYMENT_TYPE_ENUM.join(", ")}`);

    this._check(
      e,
      !isNumber(this.amount) || this.amount < 0,
      "amount",
      "Amount must be a non-negative number"
    );

    if (isDefined(this.status))
      this._check(e, !isIn(this.status, PAYMENT_STATUS_ENUM),
        "status", `Status must be one of: ${PAYMENT_STATUS_ENUM.join(", ")}`);

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdatePaymentStatusDTO
// ─────────────────────────────────────────────────────────────────────────────
export class UpdatePaymentStatusDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.status = data.status;
  }

  validate() {
    const e = [];
    this._check(e, !isIn(this.status, PAYMENT_STATUS_ENUM),
      "status", `Status must be one of: ${PAYMENT_STATUS_ENUM.join(", ")}`);
    return this._result(e);
  }
}
