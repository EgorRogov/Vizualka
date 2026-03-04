export function csvToJSON(input: string[], delimiter: string): object[] {
  if (input.length === 0) return [];

  if (!input[0]) {
  throw new Error("CSV должен содержать хотя бы одну строку с заголовками");
    }
    const headers = input[0].split(delimiter);

  return input.slice(1).map((line, rowIndex) => {
    const values = line.split(delimiter);

    if (values.length !== headers.length) {
      throw new Error(`Mismatch in number of columns at row ${rowIndex + 1}`);
    }

    const obj: Record<string, any> = {};
    headers.forEach((header, i) => {
      const value = values[i];
      // попытка преобразовать в числа, иначе оставляем строкой
      obj[header] = value === "" ? null : isNaN(Number(value)) ? value : Number(value);
    });

    return obj;
  });
}

import { readFile, writeFile } from "node:fs/promises";

export async function formatCSVFileToJSONFile(
  input: string,
  output: string,
  delimiter: string
): Promise<void> {
  const fileContent = await readFile(input, { encoding: "utf-8" });
  const lines = fileContent.split(/\r?\n/).filter(Boolean); // удаляем пустые строки

  const data = csvToJSON(lines, delimiter);
  await writeFile(output, JSON.stringify(data, null, 2), { encoding: "utf-8" });
}