import { vi } from "vitest";

/**
 * Lightweight MongoDB/model mocking helpers. These tests do not require a running
 * MongoDB server; model methods are replaced with deterministic Vitest mocks.
 */
export function mockModelCreate<T>(value: T) {
  return vi.fn().mockResolvedValue(value);
}

export function mockFindOneAndUpdate<T>(value: T) {
  return vi.fn().mockResolvedValue(value);
}

export function mockFind<T>(value: T) {
  return vi.fn().mockResolvedValue(value);
}
