import { useState, useCallback } from 'react';

export const useSpreadsheet = (initialRows: number = 20, initialCols: number = 10) => {
  const [cells, setCells] = useState<Record<string, string>>({});
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});

  const getKey = useCallback((row: number, col: number) => 
    `${String.fromCharCode(65 + col)}${row + 1}`, []);

  const setCellValue = useCallback((row: number, col: number, value: string) => {
    setCells(prev => ({ ...prev, [getKey(row, col)]: value }));
  }, [getKey]);

  const updateColumnWidth = useCallback((col: number, width: number) => {
    setColumnWidths(prev => ({ ...prev, [col]: Math.max(50, width) }));
  }, []);

  const getColumnWidth = useCallback((col: number): number => {
    return columnWidths[col] || 100;
  }, [columnWidths]);

  const deleteColumn = useCallback((colIndex: number) => {
    const newCells: Record<string, string> = {};
    Object.entries(cells).forEach(([key, value]) => {
      const col = key.charCodeAt(0) - 65;
      const row = parseInt(key.slice(1)) - 1;
      if (col < colIndex) newCells[key] = value;
      else if (col > colIndex) newCells[getKey(row, col - 1)] = value;
    });
    setCells(newCells);
    setCols(prev => Math.max(1, prev - 1));
  }, [cells, getKey]);

  const deleteRow = useCallback((rowIndex: number) => {
    const newCells: Record<string, string> = {};
    Object.entries(cells).forEach(([key, value]) => {
      const col = key.charCodeAt(0) - 65;
      const row = parseInt(key.slice(1)) - 1;
      if (row < rowIndex) newCells[key] = value;
      else if (row > rowIndex) newCells[getKey(row - 1, col)] = value;
    });
    setCells(newCells);
    setRows(prev => Math.max(1, prev - 1));
  }, [cells, getKey]);

  const addColumn = useCallback((afterCol: number) => {
    const newCells: Record<string, string> = {};
    Object.entries(cells).forEach(([key, value]) => {
      const col = key.charCodeAt(0) - 65;
      const row = parseInt(key.slice(1)) - 1;
      if (col <= afterCol) newCells[key] = value;
      else newCells[getKey(row, col + 1)] = value;
    });
    setCells(newCells);
    setCols(prev => prev + 1);
  }, [cells, getKey]);

  const addRow = useCallback((afterRow: number) => {
    const newCells: Record<string, string> = {};
    Object.entries(cells).forEach(([key, value]) => {
      const col = key.charCodeAt(0) - 65;
      const row = parseInt(key.slice(1)) - 1;
      if (row <= afterRow) newCells[key] = value;
      else newCells[getKey(row + 1, col)] = value;
    });
    setCells(newCells);
    setRows(prev => prev + 1);
  }, [cells, getKey]);
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});

  const updateRowHeight = useCallback((row: number, height: number) => {
    setRowHeights(prev => ({ ...prev, [row]: Math.max(25, height) }));
  }, []);

  const getRowHeight = useCallback((row: number): number => {
    return rowHeights[row] || 30;
  }, [rowHeights]);

  return { cells, rows, cols, setCellValue, deleteColumn, deleteRow, addColumn, addRow, getKey, updateColumnWidth, getColumnWidth,updateRowHeight, getRowHeight,getRowHeightsDependencies: () => rowHeights};
};