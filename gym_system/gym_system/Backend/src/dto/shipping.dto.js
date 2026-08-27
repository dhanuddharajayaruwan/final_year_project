import {
  isMongoId,
  isString,
  isNotEmpty,
  isIn,
  isDateString,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";
import { SHIPPING_STATUS_ENUM } from "../enums/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateShippingDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateShippingDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.order_id         = data.order_id;
    this.tracking_number  = data.tracking_number  ?? null;
    this.courier_name     = data.courier_name     ?? null;
    this.shipping_status  = data.shipping_status  ?? "pending";
    this.shipped_date     = data.shipped_date     ?? null;
    this.estimated_delivery = data.estimated_delivery ?? null;
    this.delivery_fee_id  = data.delivery_fee_id  ?? null;
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.order_id ?? "")),
      "order_id", "A valid order ID (MongoDB ObjectId) is required");

    if (isDefined(this.tracking_number) && this.tracking_number !== null)
      this._check(e, !isString(this.tracking_number) || !isNotEmpty(this.tracking_number),
        "tracking_number", "Tracking number must be a non-empty string");

    if (isDefined(this.courier_name) && this.courier_name !== null)
      this._check(e, !isString(this.courier_name) || !isNotEmpty(this.courier_name),
        "courier_name", "Courier name must be a non-empty string");

    if (isDefined(this.shipping_status))
      this._check(e, !isIn(this.shipping_status, SHIPPING_STATUS_ENUM),
        "shipping_status", `Shipping status must be one of: ${SHIPPING_STATUS_ENUM.join(", ")}`);

    if (isDefined(this.shipped_date) && this.shipped_date !== null)
      this._check(e, !isDateString(String(this.shipped_date)),
        "shipped_date", "shipped_date must be a valid ISO date string");

    if (isDefined(this.estimated_delivery) && this.estimated_delivery !== null)
      this._check(e, !isDateString(String(this.estimated_delivery)),
        "estimated_delivery", "estimated_delivery must be a valid ISO date string");

    if (isDefined(this.delivery_fee_id) && this.delivery_fee_id !== null)
      this._check(e, !isMongoId(String(this.delivery_fee_id)),
        "delivery_fee_id", "delivery_fee_id must be a valid MongoDB ObjectId");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateShippingDTO  (all optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateShippingDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.tracking_number    = data.tracking_number;
    this.courier_name       = data.courier_name;
    this.shipping_status    = data.shipping_status;
    this.shipped_date       = data.shipped_date;
    this.estimated_delivery = data.estimated_delivery;
    this.delivery_fee_id    = data.delivery_fee_id;
  }

  validate() {
    const e = [];

    if (isDefined(this.tracking_number))
      this._check(e, !isString(this.tracking_number) || !isNotEmpty(this.tracking_number),
        "tracking_number", "Tracking number must be a non-empty string");

    if (isDefined(this.courier_name))
      this._check(e, !isString(this.courier_name) || !isNotEmpty(this.courier_name),
        "courier_name", "Courier name must be a non-empty string");

    if (isDefined(this.shipping_status))
      this._check(e, !isIn(this.shipping_status, SHIPPING_STATUS_ENUM),
        "shipping_status", `Shipping status must be one of: ${SHIPPING_STATUS_ENUM.join(", ")}`);

    if (isDefined(this.shipped_date))
      this._check(e, !isDateString(String(this.shipped_date)),
        "shipped_date", "shipped_date must be a valid ISO date string");

    if (isDefined(this.estimated_delivery))
      this._check(e, !isDateString(String(this.estimated_delivery)),
        "estimated_delivery", "estimated_delivery must be a valid ISO date string");

    if (isDefined(this.delivery_fee_id))
      this._check(e, !isMongoId(String(this.delivery_fee_id)),
        "delivery_fee_id", "delivery_fee_id must be a valid MongoDB ObjectId");

    return this._result(e);
  }
}
