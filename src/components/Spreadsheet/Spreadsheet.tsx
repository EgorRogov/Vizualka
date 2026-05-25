import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Cell } from './Cell';
import { ContextMenu } from './ContextMenu';
import { useSpreadsheet } from '@/hooks/useSpreadsheet';
import { useResize } from '@/hooks/useResize';
import { parseCellId, computeValue } from '@/utils/math';
import { exportToJSON, exportToCSV, importFromCSV } from '@/services/dataConverter';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCell, setBatchValues } from '@/store/slices/spreadsheetSlice';
import { fetchDocumentById, setActiveDocumentId } from '@/store/slices/documentsSlice';
import { saveDocument } from '@/store/slices/documentsSlice';

interface SpreadsheetProps {
  rows?: number;
  cols?: number;
  docId: string;
  onBack: () => void;
}

export const Spreadsheet: React.FC<SpreadsheetProps> = ({ rows: initRows = 100, cols: initCols = 26, docId ,onBack}) => {
  const dispatch = useAppDispatch();
  
  const cells = useAppSelector((state) => state.spreadsheet.cells);
  const saveStatus = useAppSelector((state) => state.ui.saveStatus);
  const isLoading = useAppSelector((state) => state.documents.isLoading);

  const spreadsheet = useSpreadsheet(initRows, initCols);
  
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; col: number } | null>(null);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  
  const { startColResize, startRowResize } = useResize(spreadsheet);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);

  const HEADER_HEIGHT = 30;
  const rowBuffer = 5; 
  
  useEffect(() => {
    if (docId) {
      dispatch(setActiveDocumentId(docId));
      dispatch(fetchDocumentById(docId));
    }
  }, [docId, dispatch]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isS = e.code === 'KeyS' || e.key.toLowerCase() === 'ы' || e.key.toLowerCase() === 's';
      
      if ((e.ctrlKey || e.metaKey) && isS) {
        e.preventDefault();
        dispatch(saveDocument());
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [docId, dispatch]);

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

  const handleExportJSON = () => {
    const json = exportToJSON(cells);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docId}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(cells, spreadsheet.rows, spreadsheet.cols);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target?.result as string;
    const data = file.name.endsWith('.json') ? JSON.parse(text) : importFromCSV(text);
    dispatch(setBatchValues(data));
  };

  if (file.name.endsWith('.csv')) {
    reader.readAsText(file, 'windows-1251');
  } else {
    reader.readAsText(file, 'UTF-8');
  }
};

  return (
    <div className="spreadsheet-container" onClick={() => setContextMenu(null)}>
      <div style={{
        padding: '10px', 
        background: '#f0f0f0', 
        borderBottom: '1px solid #ccc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={onBack}>&larr; Назад</button>
        
        <div style={{ borderLeft: '1px solid #aaa', paddingLeft: '15px', display: 'flex', gap: '5px' }}>
          <button onClick={handleExportJSON}>JSON</button>
          <button onClick={handleExportCSV}>CSV</button>
          <label style={{ cursor: 'pointer', background: '#e0e0e0', padding: '2px 8px', borderRadius: '3px', border: '1px solid #ccc' }}>
            Импорт
            <input type="file" accept=".csv,.json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span>Документ: <b>{docId}</b></span>
        <span style={{ 
          fontWeight: 'bold', 
          color: saveStatus === 'Ошибка сохранения' ? 'red' : saveStatus === 'Сохранение...' ? 'orange' : 'green' 
        }}>
          {saveStatus}
        </span>
      </div>
    </div>

      <div className="formula-bar">
        <div className="cell-id">{activeCellId || ''}</div>
        <input 
          value={activeCellId ? (cells[activeCellId] || '') : ''}
          onChange={(e) => {
            if (!activeCellId) return;
            dispatch(updateCell({ key: activeCellId, value: e.target.value }));
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
          <div className="row header-row" style={{ position: 'sticky', top: 0, zIndex: 20, height: HEADER_HEIGHT }}>
            <div className="cell header-cell" style={{ width: 50, height: HEADER_HEIGHT }}>#</div>
            {columnHeaders.map((letter, c) => (
              <div key={letter} className="cell header-cell" style={{ width: spreadsheet.getColumnWidth(c), height: HEADER_HEIGHT, position: 'relative' }}>
                {letter}
                <div className="col-resize-handle" 
                  onMouseDown={(e) => startColResize(c,e)} 
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
                  onMouseDown={(e) => startRowResize(r, e)}
                />
              </div>
              {columnHeaders.map((_, c) => {
                const id = spreadsheet.getKey(r, c);
                const cellValue = cells[id] || '';
                return (
                  <Cell 
                    key={id}
                    id={id}
                    displayValue={computeValue(cellValue, cells)}
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