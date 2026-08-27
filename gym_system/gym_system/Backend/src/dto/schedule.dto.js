import {
  isMongoId,
  isIn,
  isDateString,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

const COMPLETION_STATUSES = ["not_complete", "half_complete", "complete"];

const SCHEDULE_TYPES = [
  "personal_training",
  "group_class",
  "online_session",
  "assessment",
];

// ─────────────────────────────────────────────────────────────────────────────
// CreateScheduleDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateScheduleDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.client_id     = data.client_id;
    this.trainer_id    = data.trainer_id;
    this.schedule_type = data.schedule_type;
    this.expire_date   = data.expire_date;
    this.workout_plan  = data.workout_plan;
    this.diet_plan     = data.diet_plan;
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.client_id ?? "")),
      "client_id", "A valid client user ID (MongoDB ObjectId) is required");

    this._check(e, !isMongoId(String(this.trainer_id ?? "")),
      "trainer_id", "A valid trainer profile ID (MongoDB ObjectId) is required");

    this._check(e, !isIn(this.schedule_type, SCHEDULE_TYPES),
      "schedule_type", `Schedule type must be one of: ${SCHEDULE_TYPES.join(", ")}`);

    this._check(e, !isDateString(String(this.expire_date ?? "")),
      "expire_date", "Expire date must be a valid ISO date string");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateScheduleDTO  (all optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateScheduleDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.schedule_type = data.schedule_type;
    this.expire_date   = data.expire_date;
    this.workout_plan  = data.workout_plan;
    this.diet_plan     = data.diet_plan;
  }

  validate() {
    const e = [];

    if (isDefined(this.schedule_type))
      this._check(e, !isIn(this.schedule_type, SCHEDULE_TYPES),
        "schedule_type", `Schedule type must be one of: ${SCHEDULE_TYPES.join(", ")}`);

    if (isDefined(this.expire_date))
      this._check(e, !isDateString(String(this.expire_date)),
        "expire_date", "Expire date must be a valid ISO date string");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateScheduleCompletionDTO  (client only)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateScheduleCompletionDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.completion_status = data.completion_status;
  }

  validate() {
    const e = [];

    this._check(e, !isIn(this.completion_status, COMPLETION_STATUSES),
      "completion_status", `Completion status must be one of: ${COMPLETION_STATUSES.join(", ")}`);

    return this._result(e);
  }
}
