// tests/lab3.test.ts
import { describe, it, expect } from "vitest";
import { csvToJSON } from "../src/lab3";

describe("csvToJSON", () => {
  it("преобразует корректный CSV в JSON", () => {
    const input = [
      "p1;p2;p3;p4",
      "1;A;b;c",
      "2;B;v;d"
    ];
    const result = csvToJSON(input, ";");
    expect(result).toEqual([
      { p1: 1, p2: "A", p3: "b", p4: "c" },
      { p1: 2, p2: "B", p3: "v", p4: "d" }
    ]);
  });

  it("генерирует Error при несоответствии колонок", () => {
    const input = [
      "p1;p2",
      "1;A;extra"
    ];
    expect(() => csvToJSON(input, ";")).toThrowError(/Mismatch in number of columns/);
  });

  it("обрабатывает пустой CSV", () => {
    expect(csvToJSON([], ";")).toEqual([]);
  });
});