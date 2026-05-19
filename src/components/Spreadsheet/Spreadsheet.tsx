import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Cell } from './Cell';
import { ContextMenu } from './ContextMenu';
import { useSpreadsheet } from '../hooks/useSpreadsheet';

const parseCellId = (id: string) => {
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

const computeValue = (value: string, allData: Record<string, string>): string => {
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

export const Spreadsheet: React.FC<{ rows?: number; cols?: number }> = ({ rows: initRows = 100, cols: initCols = 26 }) => {
  const spreadsheet = useSpreadsheet(initRows, initCols);
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDim, setStartDim] = useState({ w: 0, h: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const HEADER_HEIGHT = 30;
  const rowBuffer = 5; 

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewportHeight(window.innerHeight - 50);
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const columnHeaders = useMemo(() => 
    Array.from({ length: spreadsheet.cols }, (_, c) => String.fromCharCode(65 + c)), 
    [spreadsheet.cols]
  );

  const rowOffsets = useMemo(() => {
    const offsets: number[] = [0];
    for (let r = 0; r < spreadsheet.rows; r++) {
      const prevOffset = offsets[r] ?? 0;
      offsets.push(prevOffset + spreadsheet.getRowHeight(r));
    }
    return offsets;
  }, [spreadsheet.rows, spreadsheet.getRowHeightsDependencies()]); 

  const totalHeight = (rowOffsets[spreadsheet.rows] ?? 0) + HEADER_HEIGHT;

  const { startIndex, endIndex } = useMemo(() => {
    let start = 0;
    let end = spreadsheet.rows - 1;

    for (let i = 0; i < spreadsheet.rows; i++) {
      const nextOffset = rowOffsets[i + 1] ?? 0;
      if (nextOffset > scrollTop) {
        start = Math.max(0, i - rowBuffer);
        break;
      }
    }

    for (let i = start; i < spreadsheet.rows; i++) {
      const currentOffset = rowOffsets[i] ?? 0;
      if (currentOffset > scrollTop + viewportHeight) {
        end = Math.min(spreadsheet.rows - 1, i + rowBuffer);
        break;
      }
    }

    return { startIndex: start, endIndex: end };
  }, [scrollTop, spreadsheet.rows, rowOffsets, viewportHeight]);

  const handleCellSelect = (id: string, e: React.MouseEvent) => {
    if (e.shiftKey && activeCellId) {
      const start = parseCellId(activeCellId);
      const end = parseCellId(id);
      if (start && end) {
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);

        const newSelected = new Set<string>();
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            newSelected.add(`${String.fromCharCode(65 + c)}${r + 1}`);
          }
        }
        setSelectedCells(newSelected);
      }
    } else {
      setActiveCellId(id);
      setSelectedCells(new Set([id]));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol !== null) spreadsheet.updateColumnWidth(resizingCol, startDim.w + (e.clientX - startPos.x));
      if (resizingRow !== null) spreadsheet.updateRowHeight(resizingRow, startDim.h + (e.clientY - startPos.y));
    };
    const handleMouseUp = () => { setResizingCol(null); setResizingRow(null); };
    
    if (resizingCol !== null || resizingRow !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [resizingCol, resizingRow, startPos, startDim, spreadsheet]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleRows = useMemo(() => {
    const rowsArray = [];
    for (let r = startIndex; r <= endIndex; r++) {
      rowsArray.push(r);
    }
    return rowsArray;
  }, [startIndex, endIndex]);

  return (
    <div className="spreadsheet-container" onClick={() => setContextMenu(null)}>
      <div className="formula-bar">
        <div className="cell-id">{activeCellId || ''}</div>
        <input 
          value={activeCellId ? (spreadsheet.cells[activeCellId] || '') : ''}
          onChange={(e) => {
            if (!activeCellId) return;
            const parsed = parseCellId(activeCellId);
            if (parsed) spreadsheet.setCellValue(parsed.row, parsed.col, e.target.value);
          }}
        />
      </div>

      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)}
          onAddRow={() => spreadsheet.addRow(contextMenu.row)}
          onDeleteRow={() => spreadsheet.deleteRow(contextMenu.row)}
          onAddCol={() => spreadsheet.addColumn(contextMenu.col)}
          onDeleteCol={() => spreadsheet.deleteColumn(contextMenu.col)}
        />
      )}

      <div 
        className="spreadsheet-viewport" 
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: viewportHeight, overflowY: 'auto', overflowX: 'auto', position: 'relative' }}
      >
        <div className="spreadsheet-grid" style={{ height: totalHeight, position: 'relative' }}>
          
          {/* Фиксированная высота шапки */}
          <div className="row header-row" style={{ position: 'sticky', top: 0, zIndex: 20, height: HEADER_HEIGHT }}>
            <div className="cell header-cell" style={{ width: 50, height: HEADER_HEIGHT }}>#</div>
            {columnHeaders.map((letter, c) => (
              <div key={letter} className="cell header-cell" style={{ width: spreadsheet.getColumnWidth(c), height: HEADER_HEIGHT, position: 'relative' }}>
                {letter}
                <div className="col-resize-handle" 
                  onMouseDown={(e) => { e.stopPropagation(); setResizingCol(c); setStartPos({ x: e.clientX, y: 0 }); setStartDim({ w: spreadsheet.getColumnWidth(c), h: 0 }); }} 
                />
              </div>
            ))}
          </div>

          {visibleRows.map((r) => (
            <div 
              key={`row-${r}`} 
              className="row" 
              style={{ 
                height: spreadsheet.getRowHeight(r),
                position: 'absolute',
                top: (rowOffsets[r] ?? 0) + HEADER_HEIGHT, 
                left: 0,
                right: 0
              }}
            >
              <div className="cell header-cell" style={{ width: 50, position: 'relative' }}>
                {r + 1}
                <div className="row-resize-handle" 
                  onMouseDown={(e) => { e.stopPropagation(); setResizingRow(r); setStartPos({ x: 0, y: e.clientY }); setStartDim({ w: 0, h: spreadsheet.getRowHeight(r) }); }}
                />
              </div>
              {columnHeaders.map((_, c) => {
                const id = spreadsheet.getKey(r, c);
                return (
                  <Cell 
                    key={id} id={id} value={spreadsheet.cells[id] || ''} 
                    displayValue={computeValue(spreadsheet.cells[id] || '', spreadsheet.cells)}
                    onChange={(id, v) => spreadsheet.setCellValue(r, c, v)}
                    isSelected={selectedCells.has(id)} 
                    onSelect={(e) => handleCellSelect(id, e)} 
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, row: r, col: c }); }}
                    onKeyDown={() => {}} 
                    style={{ width: spreadsheet.getColumnWidth(c), height: '100%' }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};