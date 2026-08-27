import {
  isMongoId,
  isString,
  isNotEmpty,
  isNumber,
  isInt,
  isArray,
  min,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateProductDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateProductDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.category_id = data.category_id;
    this.name        = data.name;
    this.description = data.description ?? null;
    this.quantity    = data.quantity !== undefined ? Number(data.quantity) : 0;
    this.amount      = data.amount   !== undefined ? Number(data.amount)   : undefined;
    this.images      = data.images ?? [];
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.category_id ?? "")),
      "category_id", "A valid category ID (MongoDB ObjectId) is required");

    this._check(e, !isString(this.name) || !isNotEmpty(this.name),
      "name", "Product name is required");

    if (isDefined(this.description) && this.description !== null)
      this._check(e, !isString(this.description),
        "description", "Description must be a string");

    this._check(
      e,
      isNaN(this.quantity) || !isInt(this.quantity) || this.quantity < 0,
      "quantity",
      "Quantity must be a non-negative integer"
    );

    this._check(
      e,
      isNaN(this.amount) || this.amount < 0,
      "amount",
      "Amount (price) must be a non-negative number"
    );

    if (isDefined(this.images)) {
      this._check(e, !isArray(this.images),
        "images", "Images must be an array of strings");
      if (isArray(this.images)) {
        const hasInvalid = this.images.some((img) => !isString(img) || !isNotEmpty(img));
        this._check(e, hasInvalid, "images", "Each image must be a non-empty string (URL or path)");
      }
    }

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateProductDTO  (all optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateProductDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.category_id = data.category_id;
    this.name        = data.name;
    this.description = data.description;
    this.quantity    = data.quantity !== undefined ? Number(data.quantity) : undefined;
    this.amount      = data.amount   !== undefined ? Number(data.amount)   : undefined;
    this.images      = data.images;
    if (this.images && !Array.isArray(this.images)) {
      this.images = [this.images];
    }
    this.isAvailable = data.isAvailable;
    // Map string "true"/"false" from FormData to boolean
    if (typeof data.isAvailable === 'string') {
      this.isAvailable = data.isAvailable === 'true';
    }
  }

  validate() {
    const e = [];

    if (isDefined(this.category_id))
      this._check(e, !isMongoId(String(this.category_id)),
        "category_id", "A valid category ID (MongoDB ObjectId) is required");

    if (isDefined(this.name))
      this._check(e, !isString(this.name) || !isNotEmpty(this.name),
        "name", "Product name must be a non-empty string");

    if (isDefined(this.description))
      this._check(e, !isString(this.description),
        "description", "Description must be a string");

    if (isDefined(this.quantity))
      this._check(e, isNaN(this.quantity) || !isInt(this.quantity) || this.quantity < 0,
        "quantity", "Quantity must be a non-negative integer");

    if (isDefined(this.amount))
      this._check(e, isNaN(this.amount) || this.amount < 0,
        "amount", "Amount must be a non-negative number");

    if (isDefined(this.images)) {
      this._check(e, !isArray(this.images), "images", "Images must be an array");
      if (isArray(this.images)) {
        const hasInvalid = this.images.some((img) => !isString(img) || !isNotEmpty(img));
        this._check(e, hasInvalid, "images", "Each image must be a non-empty string");
      }
    }

    if (isDefined(this.isAvailable))
      this._check(e, typeof this.isAvailable !== "boolean",
        "isAvailable", "isAvailable must be a boolean");

    return this._result(e);
  }
}
