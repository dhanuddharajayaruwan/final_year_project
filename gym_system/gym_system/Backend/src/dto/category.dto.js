import {
  isString,
  isNotEmpty,
  isIn,
  isDefined,
  maxLength,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

const CATEGORY_TYPES = ["supplement", "equipment", "apparel", "accessory", "other"];

// ─────────────────────────────────────────────────────────────────────────────
// CreateCategoryDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateCategoryDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name        = data.name;
    this.description = data.description ?? null;
    this.type        = data.type ?? "other";
  }

  validate() {
    const e = [];

    this._check(e, !isString(this.name) || !isNotEmpty(this.name),
      "name", "Category name is required and must be a non-empty string");

    this._check(e, isString(this.name) && !maxLength(this.name, 100),
      "name", "Category name must not exceed 100 characters");

    if (isDefined(this.description) && this.description !== null)
      this._check(e, !isString(this.description),
        "description", "Description must be a string");

    if (isDefined(this.type))
      this._check(e, !isIn(this.type, CATEGORY_TYPES),
        "type", `Type must be one of: ${CATEGORY_TYPES.join(", ")}`);

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateCategoryDTO  (all optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateCategoryDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name        = data.name;
    this.description = data.description;
    this.type        = data.type;
  }

  validate() {
    const e = [];

    if (isDefined(this.name)) {
      this._check(e, !isString(this.name) || !isNotEmpty(this.name),
        "name", "Category name must be a non-empty string");
      this._check(e, isString(this.name) && !maxLength(this.name, 100),
        "name", "Category name must not exceed 100 characters");
    }

    if (isDefined(this.description))
      this._check(e, !isString(this.description),
        "description", "Description must be a string");

    if (isDefined(this.type))
      this._check(e, !isIn(this.type, CATEGORY_TYPES),
        "type", `Type must be one of: ${CATEGORY_TYPES.join(", ")}`);

    return this._result(e);
  }
}
