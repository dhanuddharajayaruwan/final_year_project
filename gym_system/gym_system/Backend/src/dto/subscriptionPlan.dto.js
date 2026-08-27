import { isString, isNotEmpty, min, isDefined, isIn } from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateSubscriptionPlanDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateSubscriptionPlanDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.type = data.type;
    this.duration = data.duration;
  }

  validate() {
    const e = [];

    this._check(e, !isString(this.name) || !isNotEmpty(this.name), "name", "Name is required and must be a non-empty string");
    this._check(e, !isString(this.description) || !isNotEmpty(this.description), "description", "Description is required and must be a non-empty string");
    this._check(e, typeof this.price !== "number" || isNaN(this.price), "price", "Price must be a number");
    this._check(e, typeof this.price === "number" && !min(this.price, 0), "price", "Price must be at least 0");
    this._check(e, !isIn(this.type, ["online", "blended"]), "type", "Type must be either 'online' or 'blended'");
    this._check(e, typeof this.duration !== "number" || isNaN(this.duration) || !min(this.duration, 1), "duration", "Duration must be a number (minimum 1 day)");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateSubscriptionPlanDTO (all optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateSubscriptionPlanDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.type = data.type;
    this.duration = data.duration;
  }

  validate() {
    const e = [];

    if (isDefined(this.name)) {
      this._check(e, !isString(this.name) || !isNotEmpty(this.name), "name", "Name must be a non-empty string");
    }

    if (isDefined(this.description)) {
      this._check(e, !isString(this.description) || !isNotEmpty(this.description), "description", "Description must be a non-empty string");
    }

    if (isDefined(this.price)) {
      this._check(e, typeof this.price !== "number" || isNaN(this.price), "price", "Price must be a number");
      this._check(e, typeof this.price === "number" && !min(this.price, 0), "price", "Price must be at least 0");
    }

    if (isDefined(this.type)) {
      this._check(e, !isIn(this.type, ["online", "blended"]), "type", "Type must be either 'online' or 'blended'");
    }

    if (isDefined(this.duration)) {
      this._check(e, typeof this.duration !== "number" || isNaN(this.duration) || !min(this.duration, 1), "duration", "Duration must be a number (minimum 1 day)");
    }

    return this._result(e);
  }
}
