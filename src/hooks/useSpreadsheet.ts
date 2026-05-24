import { useState, useCallback } from 'react';

export const useSpreadsheet = (initialRows: number = 20, initialCols: number = 10) => {
  const [cells, setCells] = useState<Record<string, string>>({});
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
  },[]);

  const setCellValue = useCallback((row: number, col: number, value: string) => {
    setCells(prev => ({ ...prev, [getKey(row, col)]: value }));
  },[getKey]);

  const updateColumnWidth = useCallback((col: number, width: number) => 
    setColumnWidths(prev => ({ ...prev, [col]: Math.max(50, width) })),[]);

  const getColumnWidth = useCallback((col: number) => columnWidths[col] || 100, [columnWidths]);

  const updateRowHeight = useCallback((row: number, height: number) => 
    setRowHeights(prev => ({ ...prev, [row]: Math.max(25, height) })), []);

  const getRowHeight = useCallback((row: number) => rowHeights[row] || 30, [rowHeights]);

  const modifyGrid = useCallback((
    transform: (row: number, col: number) => { r: number, c: number } | null
  ) => {
    setCells(prevCells => {
      const nextCells: Record<string, string> = {};

      Object.entries(prevCells).forEach(([key, value]) => {
        const { row, col } = parseKey(key);
        const result = transform(row, col);

        if (result) {
          nextCells[getKey(result.r, result.c)] = value;
        }
      });
      return nextCells;
    });
  }, [getKey, parseKey]);

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

  const setAllCells = useCallback((newCells: Record<string, string>) => {
    setCells(newCells);
  },[])
  
  return { 
    cells,rows, cols, setCellValue, 
    deleteColumn, deleteRow, addColumn, addRow, 
    getKey, updateColumnWidth, getColumnWidth, 
    updateRowHeight, getRowHeight,setAllCells,
    getRowHeightsDependencies: () => rowHeights 
  };
};