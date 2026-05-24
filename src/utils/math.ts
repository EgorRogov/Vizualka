export const parseCellId = (id: string) => {
  const match = id.match(/^([A-Z]+)(\d+)$/);
  if (!match || !match[1] || !match[2]) return null;
  const colStr = match[1];
  const rowStr = match[2];
  
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  return { row: parseInt(rowStr, 10) - 1, col: col - 1 };
};

export const computeValue = (value: string, allData: Record<string, string>): string => {
  if (typeof value !== 'string' || !value.startsWith('=')) return value;
  
  try {
    let formula = value.slice(1).toUpperCase();

    formula = formula.replace(/(SUM|AVERAGE)\((?:([A-Z]+\d+):([A-Z]+\d+))\)/g, (match, func, startId, endId) => {
      const start = parseCellId(startId);
      const end = parseCellId(endId);
      if (!start || !end) return '0';

      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);

      const values: number[] = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const cellKey = `${String.fromCharCode(65 + c)}${r + 1}`;
          const cellVal = parseFloat(allData[cellKey] || '0');
          values.push(isNaN(cellVal) ? 0 : cellVal);
        }
      }

      if (func === 'SUM') {
        return values.reduce((acc, curr) => acc + curr, 0).toString();
      }
      if (func === 'AVERAGE') {
        return values.length ? (values.reduce((acc, curr) => acc + curr, 0) / values.length).toString() : '0';
      }
      return '0';
    });

    formula = formula.replace(/[A-Z]+\d+/g, (match) => {
      const val = allData[match] || '0';
      if (val.toUpperCase() === 'TRUE') return 'true';
      if (val.toUpperCase() === 'FALSE') return 'false';
      return isNaN(Number(val)) ? `"${val}"` : val;
    });

    const result = eval(formula);
    if (typeof result === 'boolean') return result ? 'TRUE' : 'FALSE';
    return result !== undefined ? result.toString() : '';
    } catch (e) {
        return '#ERROR';
    }
};