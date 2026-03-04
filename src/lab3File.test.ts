import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// мок всего модуля fs/promises
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

import * as fs from "node:fs/promises";
import { formatCSVFileToJSONFile } from "../src/lab3";

describe("formatCSVFileToJSONFile", () => {
  const fakeCSV = "p1;p2\n1;A\n2;B";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("вызывает readFile и writeFile с корректными параметрами", async () => {
    // тут readFile и writeFile мокнуты и возвращают fakeCSV
    (fs.readFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(fakeCSV);
    (fs.writeFile as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await formatCSVFileToJSONFile("input.csv", "output.json", ";");

    expect(fs.readFile).toHaveBeenCalledWith("input.csv", { encoding: "utf-8" });

    expect(fs.writeFile).toHaveBeenCalledWith(
      "output.json",
      JSON.stringify([
        { p1: 1, p2: "A" },
        { p1: 2, p2: "B" }
      ], null, 2),
      { encoding: "utf-8" }
    );
  });
});