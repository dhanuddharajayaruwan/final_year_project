import { isString, isNotEmpty, isDefined } from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateDeliveryFeeDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateDeliveryFeeDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.district = data.district;
    this.price = data.price;
    this.minimum_days = data.minimum_days;
    this.maximum_days = data.maximum_days;
  }

  validate() {
    const e = [];

    this._check(e, !isString(this.district) || !isNotEmpty(this.district),
      "district", "District is required and must be a non-empty string");

    this._check(e, !isDefined(this.price) || typeof this.price !== 'number',
      "price", "Price is required and must be a number");

    this._check(e, !isDefined(this.minimum_days) || typeof this.minimum_days !== 'number',
      "minimum_days", "Minimum days is required and must be a number");

    this._check(e, !isDefined(this.maximum_days) || typeof this.maximum_days !== 'number',
      "maximum_days", "Maximum days is required and must be a number");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateDeliveryFeeDTO  (all optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateDeliveryFeeDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.district = data.district;
    this.price = data.price;
    this.minimum_days = data.minimum_days;
    this.maximum_days = data.maximum_days;
  }

  validate() {
    const e = [];

    if (isDefined(this.district)) {
      this._check(e, !isString(this.district) || !isNotEmpty(this.district),
        "district", "District must be a non-empty string");
    }

    if (isDefined(this.price)) {
      this._check(e, typeof this.price !== 'number',
        "price", "Price must be a number");
    }

    if (isDefined(this.minimum_days)) {
      this._check(e, typeof this.minimum_days !== 'number',
        "minimum_days", "Minimum days must be a number");
    }

    if (isDefined(this.maximum_days)) {
      this._check(e, typeof this.maximum_days !== 'number',
        "maximum_days", "Maximum days must be a number");
    }

    return this._result(e);
  }
}
