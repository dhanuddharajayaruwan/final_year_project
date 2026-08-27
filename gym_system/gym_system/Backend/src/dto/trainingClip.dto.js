import {
  isMongoId,
  isString,
  isNotEmpty,
  isDefined,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateTrainingClipDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateTrainingClipDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.trainer_id  = data.trainer_id;
    this.clip        = data.clip;
    this.description = data.description ?? null;
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.trainer_id ?? "")),
      "trainer_id", "A valid trainer profile ID (MongoDB ObjectId) is required");

    this._check(e, !isString(this.clip) || !isNotEmpty(this.clip),
      "clip", "Clip URL or file path is required");

    if (isDefined(this.description) && this.description !== null)
      this._check(e, !isString(this.description),
        "description", "Description must be a string");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateTrainingClipDTO  (all optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateTrainingClipDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.clip        = data.clip;
    this.description = data.description;
  }

  validate() {
    const e = [];

    if (isDefined(this.clip))
      this._check(e, !isString(this.clip) || !isNotEmpty(this.clip),
        "clip", "Clip must be a non-empty string");

    if (isDefined(this.description))
      this._check(e, !isString(this.description),
        "description", "Description must be a string");

    return this._result(e);
  }
}
