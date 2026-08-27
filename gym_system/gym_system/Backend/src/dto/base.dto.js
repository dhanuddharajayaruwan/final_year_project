/**
 * BaseDTO — shared validate() runner used by every DTO.
 *
 * Each concrete DTO calls `this._addErrors(errors)` inside its own
 * `validate()` method and then returns `super._result(errors)`.
 */
export class BaseDTO {
  /**
   * Run all rule-checks collected in `errors` and return a
   * structured result that every controller can consume uniformly.
   *
   * @param {Array<{field:string, message:string}>} errors
   * @returns {{ isValid: boolean, errors: Array<{field:string, message:string}> }}
   */
  _result(errors = []) {
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Helper — push an error only when the condition is true.
   * @param {Array}   list
   * @param {boolean} condition   true = invalid
   * @param {string}  field
   * @param {string}  message
   */
  _check(list, condition, field, message) {
    if (condition) list.push({ field, message });
  }

  /**
   * Validate the DTO, to be overridden by subclasses.
   * @returns {{ isValid: boolean, errors: Array }}
   */
  validate() {
    return this._result([]);
  }

  /**
   * Static factory — instantiate + validate in one call.
   * @param {object} data
   * @returns {{ dto: BaseDTO, isValid: boolean, errors: Array }}
   */
  static from(data) {
    const dto = new this(data);
    const result = dto.validate();
    return { dto, ...result };
  }
}
