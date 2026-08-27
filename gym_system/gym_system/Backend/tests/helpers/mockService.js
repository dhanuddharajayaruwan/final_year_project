import { mock } from "node:test";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Mock a service module before the controller is imported.
 * Returns a map of mock.fn handlers you can reconfigure per test.
 */
export const mockNamedService = (servicePathFromSrc, methodNames) => {
  const abs = path.resolve(__dirname, "../../src", servicePathFromSrc);
  const href = pathToFileURL(abs).href;
  const api = {};

  for (const name of methodNames) {
    api[name] = mock.fn(async () => {
      throw new Error(`No mock implementation for ${name}`);
    });
  }

  mock.module(href, { namedExports: api });
  return api;
};

export const mockDefaultService = (servicePathFromSrc, methodNames) => {
  const abs = path.resolve(__dirname, "../../src", servicePathFromSrc);
  const href = pathToFileURL(abs).href;
  const api = {};

  for (const name of methodNames) {
    api[name] = mock.fn(async () => {
      throw new Error(`No mock implementation for ${name}`);
    });
  }

  mock.module(href, { defaultExport: api });
  return api;
};

export const setImpl = (fn, impl) => {
  fn.mock.mockImplementation(impl);
};
