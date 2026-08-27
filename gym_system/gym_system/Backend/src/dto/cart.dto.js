import { isMongoId } from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateCartDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateCartDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.user_id = data.user_id;
  }

  validate() {
    const e = [];
    this._check(e, !isMongoId(String(this.user_id ?? "")),
      "user_id", "A valid user ID (MongoDB ObjectId) is required");
    return this._result(e);
  }
}
