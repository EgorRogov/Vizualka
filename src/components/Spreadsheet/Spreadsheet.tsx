import React, { useState, useCallback } from 'react';
import { Cell } from './Cell';

export const Spreadsheet: React.FC<{ rows?: number; cols?: number }> = ({ rows = 100, cols = 26 }) => {
  const [data, setData] = useState<Record<string, string>>({});
  const [anchorCell, setAnchorCell] = useState<string | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const generateId = (r: number, c: number) => `${String.fromCharCode(65 + c)}${r + 1}`;

  const getRange = useCallback((startId: string, endId: string) => {
    const startCol = startId.charCodeAt(0) - 65;
    const startRow = parseInt(startId.slice(1)) - 1;
    const endCol = endId.charCodeAt(0) - 65;
    const endRow = parseInt(endId.slice(1)) - 1;

    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    const range = new Set<string>();
    for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        range.add(generateId(r, c));
      }
    }
    return range;
  }, []);

  const handleCellClick = (id: string, shiftKey: boolean) => {
    if (shiftKey && anchorCell) {
      setSelectedCells(getRange(anchorCell, id));
    } else {
      setAnchorCell(id);
      setSelectedCells(new Set([id]));
    }
  };

  return (
    <div className="spreadsheet-grid">
      <div className="row header-row">
        <div className="cell header-cell">#</div>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="cell header-cell">{String.fromCharCode(65 + c)}</div>
        ))}
      </div>

      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="row">
          <div className="cell header-cell">{r + 1}</div>
          
          {Array.from({ length: cols }).map((_, c) => {
            const id = generateId(r, c);
            return (
              <Cell 
                key={id} 
                id={id} 
                value={data[id] || ''} 
                onChange={(id, val) => setData(prev => ({ ...prev, [id]: val }))}
                isSelected={selectedCells.has(id)}
                onSelect={(e) => handleCellClick(id, e.shiftKey)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};