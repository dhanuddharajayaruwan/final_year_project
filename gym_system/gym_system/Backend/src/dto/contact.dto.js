import { BaseDTO } from "./base.dto.js";

export class CreateContactDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.message = data.message;
  }

  validate() {
    const e = [];
    this._check(
      e,
      !this.first_name?.trim(),
      "first_name",
      "First name is required"
    );
    this._check(
      e,
      !this.last_name?.trim(),
      "last_name",
      "Last name is required"
    );
    this._check(e, !this.email?.trim(), "email", "Email is required");
    this._check(
      e,
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email || ""),
      "email",
      "Valid email is required"
    );
    this._check(e, !this.message?.trim(), "message", "Message is required");
    return this._result(e);
  }
}
