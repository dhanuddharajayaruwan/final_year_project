/**
 * Minimal Express-like req/res mocks for controller unit tests.
 */
export const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  dto: {},
  user: { _id: "507f1f77bcf86cd799439011", role: "admin" },
  files: null,
  file: null,
  ...overrides,
});

export const mockRes = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    clearCookie() {
      return this;
    },
    send() {
      return this;
    },
  };
  return res;
};

export const serviceError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
