import { CellData } from "@/store/slices/spreadsheetSlice";

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

export const importFromCSV = (text: string): Record<string, CellData> => {
  const cleanText = text.replace(/^\uFEFF|^[\s\uFEFF\xA0]+/, '');
  const lines = cleanText.split(/\r?\n/).filter(line => line.trim() !== "");
  
  if (lines.length === 0) return {};

  const firstLine = lines[0] ?? "";
  const delimiter = firstLine.includes(',') ? ',' : ';';
  const newCells: Record<string, CellData> = {};

  for (let row = 0; row < lines.length; row++) {
    const line = lines[row];
    if (!line) continue;

    const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
    const cells = line.split(regex);

    for (let col = 0; col < cells.length; col++) {
      const rawValue = cells[col] ?? "";
      let value = rawValue.trim();
      
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/""/g, '"');
      }
      
      if (value !== "") {
        const key = `${String.fromCharCode(65 + col)}${row + 1}`;
        newCells[key] = { value: value };
      }
    }
  }

  return newCells;
};