import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setBatchValues } from '@/store/slices/spreadsheetSlice';

export const useSpreadsheet = (initialRows: number = 100, initialCols: number = 26) => {
  const dispatch = useAppDispatch();
  
  const cells = useAppSelector((state) => state.spreadsheet.cells);
  
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});

  const getKey = useCallback((row: number, col: number) => 
    `${String.fromCharCode(65 + col)}${row + 1}`, []);

  const parseKey = useCallback((key: string) => {
    const col = key.charCodeAt(0) - 65;
    const row = parseInt(key.slice(1)) - 1;
    return { row, col };
  }, []);

  const updateColumnWidth = useCallback((col: number, width: number) => 
    setColumnWidths(prev => ({ ...prev, [col]: Math.max(50, width) })), []);

  const getColumnWidth = useCallback((col: number) => columnWidths[col] || 100, [columnWidths]);

  const updateRowHeight = useCallback((row: number, height: number) => 
    setRowHeights(prev => ({ ...prev, [row]: Math.max(25, height) })), []);

  const getRowHeight = useCallback((row: number) => rowHeights[row] || 30, [rowHeights]);

  const modifyGrid = useCallback((
    transform: (row: number, col: number) => { r: number, c: number } | null
  ) => {
    const nextCells: Record<string, string> = {};

    Object.entries(cells).forEach(([key, value]) => {
      const { row, col } = parseKey(key);
      const result = transform(row, col);

      if (result) {
        nextCells[getKey(result.r, result.c)] = value;
      }
    });

    dispatch(setBatchValues(nextCells));
  }, [cells, getKey, parseKey, dispatch]);

  const addColumn = useCallback((afterCol: number) => {
    modifyGrid((r, c) => (c <= afterCol ? { r, c } : { r, c: c + 1 }));
    setCols(prev => prev + 1);
  }, [modifyGrid]);

  const deleteColumn = useCallback((colIndex: number) => {
    modifyGrid((r, c) => {
      if (c === colIndex) return null;
      return c < colIndex ? { r, c } : { r, c: c - 1 };
    });
    setCols(prev => Math.max(1, prev - 1));
  }, [modifyGrid]);

  const addRow = useCallback((afterRow: number) => {
    modifyGrid((r, c) => (r <= afterRow ? { r, c } : { r: r + 1, c }));
    setRows(prev => prev + 1);
  }, [modifyGrid]);

  const deleteRow = useCallback((rowIndex: number) => {
    modifyGrid((r, c) => {
      if (r === rowIndex) return null;
      return r < rowIndex ? { r, c } : { r: r - 1, c };
    });
    setRows(prev => Math.max(1, prev - 1));
  }, [modifyGrid]);

  return { 
    cells, rows, cols, 
    deleteColumn, deleteRow, addColumn, addRow, 
    getKey, updateColumnWidth, getColumnWidth, 
    updateRowHeight, getRowHeight,
    getRowHeightsDependencies: () => rowHeights 
  };
};