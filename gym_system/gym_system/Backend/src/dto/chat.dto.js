import { isMongoId } from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateChatDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateChatDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.trainer_id = data.trainer_id;
    this.user_id    = data.user_id;
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.trainer_id ?? "")),
      "trainer_id", "A valid trainer profile ID (MongoDB ObjectId) is required");

    this._check(e, !isMongoId(String(this.user_id ?? "")),
      "user_id", "A valid user ID (MongoDB ObjectId) is required");

    return this._result(e);
  }
}
