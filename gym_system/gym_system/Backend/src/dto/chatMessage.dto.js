import {
  isMongoId,
  isString,
  isNotEmpty,
} from "class-validator";
import { BaseDTO } from "./base.dto.js";

// ─────────────────────────────────────────────────────────────────────────────
// CreateChatMessageDTO
// ─────────────────────────────────────────────────────────────────────────────
export class CreateChatMessageDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.chat_id   = data.chat_id;
    this.sender_id = data.sender_id;
    this.message   = data.message;
  }

  validate() {
    const e = [];

    this._check(e, !isMongoId(String(this.chat_id ?? "")),
      "chat_id", "A valid chat ID (MongoDB ObjectId) is required");

    this._check(e, !isMongoId(String(this.sender_id ?? "")),
      "sender_id", "A valid sender user ID (MongoDB ObjectId) is required");

    this._check(e, !isString(this.message) || !isNotEmpty(this.message),
      "message", "Message cannot be empty");

    return this._result(e);
  }
}
