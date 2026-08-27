/**
 * validate middleware
 *
 * Wraps any DTO class and automatically validates the request body
 * before it reaches the controller. If validation fails, it responds
 * with 422 Unprocessable Entity and the error list. If it passes,
 * the validated + sanitised DTO instance is attached to req.dto
 * so the controller can use it directly.
 *
 * Usage:
 *   import { validate } from "../middlewares/validate.js";
 *   import { RegisterDTO } from "../dto/user.dto.js";
 *
 *   router.post("/register", validate(RegisterDTO), authController.register);
 *
 * Inside the controller:
 *   const { name, email, password } = req.dto;  // already validated
 */

export const validate = (DTOClass) => (req, res, next) => {
  // Merge body + params + query so DTOs can access all request data
  const rawData = {
    ...req.body,
    ...req.params,
    ...req.query,
  };

  const { dto, isValid, errors } = DTOClass.from(rawData);

  if (!isValid) {
    try { require('fs').appendFileSync('validation_errors.log', JSON.stringify({errors, rawData}) + '\n'); } catch (e) {}
    return res.status(422).json({
      status: "error",
      message: "Validation failed",
      errors,  // [{ field: "email", message: "A valid email is required" }, ...]
    });
  }

  // Attach the clean DTO to req so the controller doesn't re-parse req.body
  req.dto = dto;
  next();
};
