import { describe, expect, it } from "vitest";

import { formatKey } from "./keys";

describe("formatKey", () => {
  it("rellena con ceros según el prefijo", () => {
    expect(formatKey("TC", 7)).toBe("TC-007");
    expect(formatKey("TP", 3)).toBe("TP-03");
    expect(formatKey("BUG", 101)).toBe("BUG-101");
  });

  it("crece sin truncar al pasar el mínimo de dígitos", () => {
    expect(formatKey("TC", 1234)).toBe("TC-1234");
  });
});
