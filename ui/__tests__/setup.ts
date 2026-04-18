import "@testing-library/jest-dom";
import { server } from "./mocks/server";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

// jsdom provides window.localStorage but sync_queue.ts accesses it via globalThis.
// Stub it explicitly so all module-level localStorage access resolves correctly.
const localStorageMock = (() => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (i: number) => [...store.keys()][i] ?? null,
  };
})();
vi.stubGlobal("localStorage", localStorageMock);

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
