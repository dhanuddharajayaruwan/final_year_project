import {
  isMongoId,
  isNumber,
  isInt,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateCartItemDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateCartItemDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.cart_id    = data.cart_id;
    this.product_id = data.product_id;
    this.quantity   = data.quantity ?? 1;
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.product_id ?? "")),
      "product_id", "A valid product ID (MongoDB ObjectId) is required");

    this._check(
      e,
      !isNumber(this.quantity) || !isInt(this.quantity) || this.quantity < 1,
      "quantity",
      "Quantity must be a positive integer (minimum 1)"
    );

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateCartItemDTO  (only quantity can be updated)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateCartItemDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.quantity = data.quantity;
  }

  validate() {
    const e = [];
    this._check(
      e,
      !isDefined(this.quantity) || !isNumber(this.quantity) || !isInt(this.quantity) || this.quantity < 1,
      "quantity",
      "Quantity must be a positive integer (minimum 1)"
    );
    return this._result(e);
  }
}
