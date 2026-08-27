import {
  isMongoId,
  isNumber,
  isIn,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";
import { ORDER_STATUS_ENUM, ORDER_PAYMENT_STATUS_ENUM } from "../enums/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateOrderDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateOrderDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.items            = data.items;
    this.shipping_address = data.shipping_address;
    this.contact_number   = data.contact_number;
    this.guest_info       = data.guest_info;
    this.shipping_charge  = data.shipping_charge;
    this.total_amount     = data.total_amount;
    this.delivery_fee_id  = data.delivery_fee_id ?? null;
  }

  validate() {
    const e = [];
    
    if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
      this._check(e, true, "items", "At least one product item is required");
    }

    if (!this.shipping_address || !this.shipping_address.street) {
      this._check(e, true, "shipping_address", "Shipping address with street is required");
    }

    if (!this.contact_number) {
       this._check(e, true, "contact_number", "Contact number is required for delivery");
    }

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateOrderStatusDTO
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateOrderStatusDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.order_status   = data.order_status;
    this.payment_status = data.payment_status;
  }

  validate() {
    const e = [];

    if (isDefined(this.order_status))
      this._check(e, !isIn(this.order_status, ORDER_STATUS_ENUM),
        "order_status", `Order status must be one of: ${ORDER_STATUS_ENUM.join(", ")}`);

    if (isDefined(this.payment_status))
      this._check(e, !isIn(this.payment_status, ORDER_PAYMENT_STATUS_ENUM),
        "payment_status", `Payment status must be one of: ${ORDER_PAYMENT_STATUS_ENUM.join(", ")}`);

    return this._result(e);
  }
}
