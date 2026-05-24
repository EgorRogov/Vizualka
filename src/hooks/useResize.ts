import { useState, useEffect } from 'react';

interface ResizeDimensions {
  updateColumnWidth: (col: number, width: number) => void;
  updateRowHeight: (row: number, height: number) => void;
  getColumnWidth: (col: number) => number;
  getRowHeight: (row: number) => number;
}

export const useResize = (spreadsheet: ResizeDimensions) => {
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDim, setStartDim] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol !== null) {
        spreadsheet.updateColumnWidth(resizingCol, startDim.w + (e.clientX - startPos.x));
      }
      if (resizingRow !== null) {
        spreadsheet.updateRowHeight(resizingRow, startDim.h + (e.clientY - startPos.y));
      }
    };
    
    const handleMouseUp = () => { 
      setResizingCol(null); 
      setResizingRow(null); 
    };
    
    if (resizingCol !== null || resizingRow !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove); 
      window.removeEventListener('mouseup', handleMouseUp); 
    };
  }, [resizingCol, resizingRow, startPos, startDim, spreadsheet]);

  const startColResize = (c: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizingCol(c);
    setStartPos({ x: e.clientX, y: 0 });
    setStartDim({ w: spreadsheet.getColumnWidth(c), h: 0 });
  };

  const startRowResize = (r: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizingRow(r);
    setStartPos({ x: 0, y: e.clientY });
    setStartDim({ w: 0, h: spreadsheet.getRowHeight(r) });
  };

  return { startColResize, startRowResize };
};