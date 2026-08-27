import {
  isMongoId,
  isNumber,
  isInt,
  isIn,
  isDateString,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

const STATUSES = ["active", "expired", "cancelled", "pending"];

// ─────────────────────────────────────────────────────────────────────────────
// CreateTrainingSubscriptionDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateTrainingSubscriptionDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.user_id       = data.user_id;
    this.subscription_plan_id = data.subscription_plan_id;
    this.duration      = data.duration;       // days
    this.started_date  = data.started_date ?? null;
    this.expire_date   = data.expire_date;
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.user_id ?? "")),
      "user_id", "A valid user ID (MongoDB ObjectId) is required");

    this._check(e, !isMongoId(String(this.subscription_plan_id ?? "")),
      "subscription_plan_id", "A valid subscription plan ID (MongoDB ObjectId) is required");

    this._check(
      e,
      !isNumber(this.duration) || !isInt(this.duration) || this.duration < 1,
      "duration",
      "Duration must be a positive integer (number of days)"
    );

    if (isDefined(this.started_date) && this.started_date !== null)
      this._check(e, !isDateString(String(this.started_date)),
        "started_date", "started_date must be a valid ISO date string");

    this._check(e, !isDateString(String(this.expire_date ?? "")),
      "expire_date", "expire_date must be a valid ISO date string");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateTrainingSubscriptionDTO
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateTrainingSubscriptionDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.status      = data.status;
    this.expire_date = data.expire_date;
  }

  validate() {
    const e = [];

    if (isDefined(this.status))
      this._check(e, !isIn(this.status, STATUSES),
        "status", `Status must be one of: ${STATUSES.join(", ")}`);

    if (isDefined(this.expire_date))
      this._check(e, !isDateString(String(this.expire_date)),
        "expire_date", "expire_date must be a valid ISO date string");

    return this._result(e);
  }
}
