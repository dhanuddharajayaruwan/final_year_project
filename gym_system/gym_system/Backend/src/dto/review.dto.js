import {
  isMongoId,
  isNumber,
  isInt,
  isString,
  isDefined,
  maxLength,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateReviewDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateReviewDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.order_id = data.order_id ?? null;
    this.rating = data.rating;
    this.title = data.title ?? null;
    this.comments = data.comments ?? null;
    this.type = data.type ?? "product";
  }

  validate() {
    const e = [];

    // order_id is required only for product reviews, not for gym reviews
    if (this.type !== "gym") {
      this._check(
        e,
        !isMongoId(String(this.order_id ?? "")),
        "order_id",
        "A valid order ID (MongoDB ObjectId) is required"
      );
    }

    const ratingNum = Number(this.rating);
    this._check(
      e,
      !isNumber(ratingNum) || ratingNum < 1 || ratingNum > 5,
      "rating",
      "Rating must be a number between 1 and 5"
    );

    if (isDefined(this.title) && this.title !== null) {
      this._check(e, !isString(this.title), "title", "Title must be a string");
      this._check(
        e,
        isString(this.title) && !maxLength(this.title, 100),
        "title",
        "Title must not exceed 100 characters"
      );
    }

    if (isDefined(this.comments) && this.comments !== null)
      this._check(
        e,
        !isString(this.comments),
        "comments",
        "Comments must be a string"
      );

    if (isDefined(this.type))
      this._check(
        e,
        !["product", "trainer", "gym"].includes(this.type),
        "type",
        "Type must be one of: product, trainer, gym"
      );

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateReviewDTO  (all optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateReviewDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.rating = data.rating;
    this.title = data.title;
    this.comments = data.comments;
  }

  validate() {
    const e = [];

    if (isDefined(this.rating))
      this._check(
        e,
        !isNumber(this.rating) ||
          !isInt(this.rating) ||
          this.rating < 1 ||
          this.rating > 5,
        "rating",
        "Rating must be an integer between 1 and 5"
      );

    if (isDefined(this.title)) {
      this._check(e, !isString(this.title), "title", "Title must be a string");
      this._check(
        e,
        isString(this.title) && !maxLength(this.title, 100),
        "title",
        "Title must not exceed 100 characters"
      );
    }

    if (isDefined(this.comments))
      this._check(
        e,
        !isString(this.comments),
        "comments",
        "Comments must be a string"
      );

    return this._result(e);
  }
}
