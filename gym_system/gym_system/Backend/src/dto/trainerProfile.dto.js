import {
  isMongoId,
  isString,
  isArray,
  isDateString,
  isDefined,
  isNotEmpty,
  isEmail,
  minLength,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateTrainerProfileDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateTrainerProfileDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.user_id        = data.user_id;
    this.specialization = data.specialization ?? null;
    this.bio            = data.bio ?? null;
    this.certifications = data.certifications ?? [];
    this.available_to   = data.available_to ?? null;
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.user_id ?? "")),
      "user_id", "A valid user ID (MongoDB ObjectId) is required");

    if (isDefined(this.specialization) && this.specialization !== null)
      this._check(e, !isString(this.specialization) || !isNotEmpty(this.specialization),
        "specialization", "Specialization must be a non-empty string");

    if (isDefined(this.bio) && this.bio !== null)
      this._check(e, !isString(this.bio),
        "bio", "Bio must be a string");

    if (isDefined(this.certifications)) {
      this._check(e, !isArray(this.certifications),
        "certifications", "Certifications must be an array");

      if (isArray(this.certifications)) {
        const hasInvalidEntry = this.certifications.some((c) => !isString(c) || !isNotEmpty(c));
        this._check(e, hasInvalidEntry,
          "certifications", "Each certification must be a non-empty string");
      }
    }

    if (isDefined(this.available_to) && this.available_to !== null)
      this._check(e, !isDateString(String(this.available_to)),
        "available_to", "available_to must be a valid ISO date string");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateTrainerProfileDTO  (all fields optional; admin may also update user fields)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateTrainerProfileDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    // Profile fields
    this.specialization = data.specialization;
    this.bio            = data.bio;
    this.certifications = data.certifications;
    this.available_to   = data.available_to;
    // User account fields (admin edit)
    this.name     = data.name;
    this.email    = data.email;
    this.contact  = data.contact;
    this.dob      = data.dob;
    this.password = data.password;
  }

  validate() {
    const e = [];

    if (isDefined(this.specialization))
      this._check(e, !isString(this.specialization) || !isNotEmpty(this.specialization),
        "specialization", "Specialization must be a non-empty string");

    if (isDefined(this.bio))
      this._check(e, !isString(this.bio), "bio", "Bio must be a string");

    if (isDefined(this.certifications)) {
      this._check(e, !isArray(this.certifications),
        "certifications", "Certifications must be an array");
      if (isArray(this.certifications)) {
        const hasInvalidEntry = this.certifications.some((c) => !isString(c) || !isNotEmpty(c));
        this._check(e, hasInvalidEntry,
          "certifications", "Each certification must be a non-empty string");
      }
    }

    if (isDefined(this.available_to) && this.available_to !== null && this.available_to !== "")
      this._check(e, !isDateString(String(this.available_to)),
        "available_to", "available_to must be a valid ISO date string");

    if (isDefined(this.name))
      this._check(e, !isString(this.name) || !isNotEmpty(this.name),
        "name", "Name must be a non-empty string");

    if (isDefined(this.email))
      this._check(e, !isEmail(String(this.email ?? "")),
        "email", "A valid email is required");

    if (isDefined(this.contact) && this.contact !== null)
      this._check(e, !isString(this.contact),
        "contact", "Contact must be a string");

    if (isDefined(this.dob) && this.dob !== null && this.dob !== "")
      this._check(e, !isDateString(String(this.dob)),
        "dob", "dob must be a valid ISO date string");

    if (isDefined(this.password) && this.password !== null && this.password !== "")
      this._check(e, !isString(this.password) || !minLength(this.password, 6),
        "password", "Password must be at least 6 characters");

    return this._result(e);
  }
}
