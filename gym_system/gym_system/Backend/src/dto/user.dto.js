import {
  isEmail,
  isString,
  isNotEmpty,
  minLength,
  maxLength,
  isIn,
  isDefined,
  isDateString,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";
import { ROLE_ENUM } from "../enums/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// RegisterDTO
// ─────────────────────────────────────────────────────────────────────────────
export class RegisterDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name     = data.name;
    this.email    = data.email;
    this.password = data.password;
    this.role     = data.role ?? "client";
    this.address  = data.address ?? {
      street: null,
      city: null,
      district: null,
      province: null,
      postal_code: null,
      country: "Sri Lanka"
    };
    this.contact  = data.contact ?? null;
    this.profile_image = data.profile_image ?? null;
    this.dob      = data.dob ?? null;
    this.terms_accepted = data.terms_accepted ?? false;
  }

  validate() {
    const e = [];

    this._check(e, !isString(this.name) || !isNotEmpty(this.name),          "name",     "Name is required and must be a string");
    this._check(e, !this._validEmail(this.email),                            "email",    "A valid email address is required");
    this._check(e, !isString(this.password) || !minLength(this.password, 6), "password", "Password must be at least 6 characters");
    this._check(e, isDefined(this.role) && !isIn(this.role, ROLE_ENUM),          "role",     `Role must be one of: ${ROLE_ENUM.join(", ")}`);
    this._check(
      e,
      this.terms_accepted !== true,
      "terms_accepted",
      "You must agree to the Terms & Conditions"
    );

    if (this.address !== null && this.address !== undefined) {
      if (typeof this.address !== 'object') {
        e.push({ field: "address", message: "Address must be an object" });
      }
    }

    if (this.contact !== null && this.contact !== undefined)
      this._check(e, !isString(this.contact), "contact", "Contact must be a string");

    if (this.profile_image !== null && this.profile_image !== undefined)
      this._check(e, !isString(this.profile_image), "profile_image", "Profile image path must be a string");

    if (this.dob !== null && this.dob !== undefined)
      this._check(e, !isDateString(this.dob), "dob", "Date of birth must be a valid ISO date string (YYYY-MM-DD)");

    return this._result(e);
  }

  _validEmail(v) {
    return isString(v) && isNotEmpty(v) && isEmail(v);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LoginDTO
// ─────────────────────────────────────────────────────────────────────────────
export class LoginDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.email    = data.email;
    this.password = data.password;
  }

  validate() {
    const e = [];
    this._check(e, !isEmail(this.email ?? ""),                                "email",    "A valid email address is required");
    this._check(e, !isString(this.password) || !isNotEmpty(this.password),   "password", "Password is required");
    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UpdateUserDTO  (all fields optional)
// ─────────────────────────────────────────────────────────────────────────────
export class UpdateUserDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name    = data.name;
    this.address = data.address;
    this.contact = data.contact;
    this.profile_image = data.profile_image;
    this.dob     = data.dob;
  }

  validate() {
    const e = [];

    if (isDefined(this.name))
      this._check(e, !isString(this.name) || !isNotEmpty(this.name), "name", "Name must be a non-empty string");

    if (isDefined(this.address)) {
      if (typeof this.address !== 'object') {
        e.push({ field: "address", message: "Address must be an object" });
      }
    }

    if (isDefined(this.contact))
      this._check(e, !isString(this.contact), "contact", "Contact must be a string");

    if (isDefined(this.profile_image))
      this._check(e, !isString(this.profile_image), "profile_image", "Profile image path must be a string");

    if (isDefined(this.dob))
      this._check(e, !isDateString(this.dob), "dob", "Date of birth must be a valid ISO date string (YYYY-MM-DD)");

    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ForgotPasswordDTO
// ─────────────────────────────────────────────────────────────────────────────
export class ForgotPasswordDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.email = data.email;
  }

  validate() {
    const e = [];
    this._check(e, !isEmail(this.email ?? ""), "email", "A valid email address is required");
    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ResetPasswordDTO
// ─────────────────────────────────────────────────────────────────────────────
export class ResetPasswordDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.password        = data.password;
    this.confirmPassword = data.confirmPassword;
  }

  validate() {
    const e = [];
    this._check(e, !isString(this.password) || !minLength(this.password, 6),
      "password", "Password must be at least 6 characters");
    this._check(e, this.password !== this.confirmPassword,
      "confirmPassword", "Passwords do not match");
    return this._result(e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ChangePasswordDTO  — logged-in user changes their own password
// ─────────────────────────────────────────────────────────────────────────────
export class ChangePasswordDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.currentPassword = data.currentPassword;
    this.newPassword     = data.newPassword;
    this.confirmPassword = data.confirmPassword;
  }

  validate() {
    const e = [];
    this._check(e, !isString(this.currentPassword) || !isNotEmpty(this.currentPassword),
      "currentPassword", "Current password is required");
    this._check(e, !isString(this.newPassword) || !minLength(this.newPassword, 6),
      "newPassword", "New password must be at least 6 characters");
    this._check(e, this.newPassword === this.currentPassword,
      "newPassword", "New password must be different from current password");
    this._check(e, this.newPassword !== this.confirmPassword,
      "confirmPassword", "Passwords do not match");
    return this._result(e);
  }
}
