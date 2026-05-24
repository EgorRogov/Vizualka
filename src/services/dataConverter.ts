
export const exportToJSON = (cells: Record<string, string>): string => {
  return JSON.stringify(cells, null, 2);
};

export const exportToCSV = (cells: Record<string, string>, rows: number, cols: number): string => {
  const BOM = "\uFEFF";
  const rowsData: string[][] = [];

  for (let r = 0; r < rows; r++) {
    const rowValues: string[] = [];
    for (let c = 0; c < cols; c++) {
      const key = `${String.fromCharCode(65 + c)}${r + 1}`;
      let value = cells[key] || '';

      if (value.includes('"') || value.includes(';') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      rowValues.push(value);
    }
    rowsData.push(rowValues);
  }

  return BOM + rowsData.map(row => row.join(';')).join('\n');
};

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
      obj[header] = value === "" ? null : isNaN(Number(value)) ? value : Number(value);
    });

    return obj;
  });
}
export const importFromCSV = (text: string): Record<string, string> => {
  const cleanText = text.replace(/^\uFEFF|^[\s\uFEFF\xA0]+/, '');
  
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== "");
  
  if (lines.length === 0) return {};

  const firstLine = lines[0] ?? "";
  const delimiter = firstLine.includes(',') ? ',' : ';';

  const newCells: Record<string, string> = {};

  const csvRows = Math.min(lines.length, 2000);
  const csvCols = Math.min(firstLine.split(delimiter).length, 50);

  for (let row = 0; row < csvRows; row++) {
    const line = lines[row];
    if (!line) continue;

    const cells = line.split(delimiter);
    for (let col = 0; col < Math.min(cells.length, csvCols); col++) {
      let value = cells[col]?.trim() || '';
      
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      
      if (value) {
        const key = `${String.fromCharCode(65 + col)}${row + 1}`;
        newCells[key] = value;
      }
    }
  }

  return newCells;
};