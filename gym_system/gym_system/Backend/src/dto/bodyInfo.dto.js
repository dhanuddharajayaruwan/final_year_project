import {
  isMongoId,
  isNumber,
  isIn,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";
import { GENDER_ENUM, GOAL_ENUM } from "../enums/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateBodyInfoDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateBodyInfoDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.user_id = data.user_id;
    this.height  = (data.height !== undefined && data.height !== null && data.height !== '') ? Number(data.height) : null;
    this.weight  = (data.weight !== undefined && data.weight !== null && data.weight !== '') ? Number(data.weight) : null;
    this.gender  = data.gender || null;
    this.goal    = data.goal || null;
  }

  validate() {
    const e = [];

    // user_id is often injected by the controller from the token, 
    // so we only validate it if it's actually provided (e.g. by an admin)
    if (this.user_id) {
      this._check(e, !isMongoId(String(this.user_id)),
        "user_id", "A valid user ID (MongoDB ObjectId) is required");
    }

    if (isDefined(this.height) && this.height !== null) {
      this._check(e, !isNumber(this.height) || this.height <= 0,
        "height", "Height must be a positive number (cm)");
    }

    if (isDefined(this.weight) && this.weight !== null) {
      this._check(e, !isNumber(this.weight) || this.weight <= 0,
        "weight", "Weight must be a positive number (kg)");
    }

    if (isDefined(this.gender) && this.gender !== null)
      this._check(e, !isIn(this.gender, GENDER_ENUM),
        "gender", `Gender must be one of: ${GENDER_ENUM.join(", ")}`);

    if (isDefined(this.goal) && this.goal !== null)
      this._check(e, !isIn(this.goal, GOAL_ENUM),
        "goal", `Goal must be one of: ${GOAL_ENUM.join(", ")}`);

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateBodyInfoDTO  (all optional, no user_id change)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateBodyInfoDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.height = (data.height !== undefined && data.height !== null && data.height !== '') ? Number(data.height) : undefined;
    this.weight = (data.weight !== undefined && data.weight !== null && data.weight !== '') ? Number(data.weight) : undefined;
    this.gender = data.gender;
    this.goal   = data.goal;
  }

  validate() {
    const e = [];

    if (isDefined(this.height))
      this._check(e, !isNumber(this.height) || this.height <= 0,
        "height", "Height must be a positive number (cm)");

    if (isDefined(this.weight))
      this._check(e, !isNumber(this.weight) || this.weight <= 0,
        "weight", "Weight must be a positive number (kg)");

    if (isDefined(this.gender))
      this._check(e, !isIn(this.gender, GENDER_ENUM),
        "gender", `Gender must be one of: ${GENDER_ENUM.join(", ")}`);

    if (isDefined(this.goal))
      this._check(e, !isIn(this.goal, GOAL_ENUM),
        "goal", `Goal must be one of: ${GOAL_ENUM.join(", ")}`);

    return this._result(e);
  }
}
