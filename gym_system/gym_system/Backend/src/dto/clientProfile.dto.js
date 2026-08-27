import {
  isMongoId,
  isString,
  isIn,
  isDateString,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";
import { ACTIVITY_LEVEL_ENUM, MEMBERSHIP_STATUS_ENUM } from "../enums/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateClientProfileDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateClientProfileDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.user_id          = data.user_id;
    this.activity_level   = data.activity_level ?? "beginner";
    this.medical_notes    = data.medical_notes ?? null;
    this.membership_status = data.membership_status ?? "active";
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.user_id ?? "")),
      "user_id", "A valid user ID (MongoDB ObjectId) is required");

    if (isDefined(this.dob))
      this._check(e, !isDateString(this.dob),
        "dob", "Date of birth must be a valid ISO date string (YYYY-MM-DD)");

    if (isDefined(this.activity_level))
      this._check(e, !isIn(this.activity_level, ACTIVITY_LEVEL_ENUM),
        "activity_level", `Activity level must be one of: ${ACTIVITY_LEVEL_ENUM.join(", ")}`);

    if (isDefined(this.membership_status))
      this._check(e, !isIn(this.membership_status, MEMBERSHIP_STATUS_ENUM),
        "membership_status", `Membership status must be one of: ${MEMBERSHIP_STATUS_ENUM.join(", ")}`);

    if (this.medical_notes !== null && isDefined(this.medical_notes))
      this._check(e, !isString(this.medical_notes),
        "medical_notes", "Medical notes must be a string");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateClientProfileDTO  (all fields optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateClientProfileDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.activity_level    = data.activity_level;
    this.medical_notes     = data.medical_notes;
    this.membership_status = data.membership_status;
  }

  validate() {
    const e = [];

    if (isDefined(this.activity_level))
      this._check(e, !isIn(this.activity_level, ACTIVITY_LEVEL_ENUM),
        "activity_level", `Activity level must be one of: ${ACTIVITY_LEVEL_ENUM.join(", ")}`);

    if (isDefined(this.membership_status))
      this._check(e, !isIn(this.membership_status, MEMBERSHIP_STATUS_ENUM),
        "membership_status", `Membership status must be one of: ${MEMBERSHIP_STATUS_ENUM.join(", ")}`);

    if (isDefined(this.medical_notes))
      this._check(e, !isString(this.medical_notes),
        "medical_notes", "Medical notes must be a string");

    return this._result(e);
  }
}
