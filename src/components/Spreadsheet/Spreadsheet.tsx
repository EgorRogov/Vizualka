import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Cell } from './Cell';
import { ContextMenu } from './ContextMenu';
import { useSpreadsheet } from '@/hooks/useSpreadsheet';
import { useResize } from '@/hooks/useResize';
import { parseCellId, computeValue } from '@/utils/math';
import { exportToJSON, exportToCSV, importFromCSV } from '@/services/dataConverter';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCell, setBatchValues, selectCell, updateCellStyle, CellStyle, undo, redo, CellData } from '@/store/slices/spreadsheetSlice';
import { fetchDocumentById, setActiveDocumentId } from '@/store/slices/documentsSlice';
import { saveDocument } from '@/store/slices/documentsSlice';
import { Toolbar } from './Toolbar';

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
      const key = e.key.toLowerCase();
      const code = e.code;
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd && (key === 'c' || key === 'с' || key === 'x' || key === 'ч')) {
        e.preventDefault();
        e.stopPropagation();
        
        if (selectedCells.size === 0) return;
        
        const isCut = key === 'x' || key === 'ч' || code === 'KeyX';
        const positions = Array.from(selectedCells).map(id => parseCellId(id)!);
        const minRow = Math.min(...positions.map(p => p.row));
        const maxRow = Math.max(...positions.map(p => p.row));
        const minCol = Math.min(...positions.map(p => p.col));
        const maxCol = Math.max(...positions.map(p => p.col));

        const rowsLines: string[] = [];
        const internalData: CellData[][] = [];
        
        for (let r = minRow; r <= maxRow; r++) {
          const rowCells: string[] = [];
          const rowData: CellData[] = [];
          
          for (let c = minCol; c <= maxCol; c++) {
            const cellId = spreadsheet.getKey(r, c);
            const cell = cells[cellId] || { value: '' };
            rowCells.push(cell.value);
            rowData.push(cell);
          }

          rowsLines.push(rowCells.join('\t'));
          internalData.push(rowData);
        }
        
        navigator.clipboard.writeText(rowsLines.join('\n'));
        localStorage.setItem('spreadsheet_copy_buffer', JSON.stringify(internalData));
        
        if (isCut) {
          selectedCells.forEach(id => dispatch(updateCell({ key: id, value: '' })));
        }
        return;
      }
      
      if (isCtrlOrCmd && (key === 'v' || key === 'м' || code === 'KeyV')) {
        e.preventDefault();
        
        navigator.clipboard.readText().then(text => {
          const savedBuffer = localStorage.getItem('spreadsheet_copy_buffer');
          const updates: Record<string, CellData> = { ...cells }; 
          const startPos = parseCellId(activeCellId!);
          if (!startPos) return;
          
          const isInternalCopy = savedBuffer && savedBuffer.startsWith('[');
          
          if (isInternalCopy) {
            const data = JSON.parse(savedBuffer!) as CellData[][];
            data.forEach((row, r) => {
              row.forEach((cell, c) => {
                const targetId = spreadsheet.getKey(startPos.row + r, startPos.col + c);
                if (targetId) updates[targetId] = cell;
              });
            });
          } else if (text) {
            const rowsData = text.split(/\r?\n/).map(row => row.split('\t'));
            rowsData.forEach((row, r) => {
              row.forEach((val, c) => {
                const targetId = spreadsheet.getKey(startPos.row + r, startPos.col + c);
                const existingCell = updates[targetId] || { value: '' };
                updates[targetId] = { ...existingCell, value: val };
              });
            });
          } else {
            return;
          }
          dispatch(setBatchValues(updates));
        });
        return;
      }
      
      if (isCtrlOrCmd && (key === 's' || key === 'ы' || code === 'KeyS')) {
        e.preventDefault();
        e.stopPropagation();
        dispatch(saveDocument());
        return;
      }

      if (isCtrlOrCmd && (key === 'z' || key === 'я' || code === 'KeyZ') && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
        return;
      }

      if (isCtrlOrCmd && (key === 'y' || key === 'н' || code === 'KeyY' || ((key === 'z' || key === 'я') && e.shiftKey))) {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      if (isCtrlOrCmd && activeCellId && (['b', 'i', 'u', 'и', 'ш', 'г'].includes(key) || ['KeyB', 'KeyI', 'KeyU'].includes(code))) {
        e.preventDefault();
        e.stopPropagation();
        const isB = key === 'b' || key === 'и' || code === 'KeyB';
        const isI = key === 'i' || key === 'ш' || code === 'KeyI';
        const styleKey = isB ? 'bold' : isI ? 'italic' : 'underline';
        const currentStyle = cells[activeCellId]?.style || {};
        dispatch(updateCellStyle({ 
          key: activeCellId, 
          style: { [styleKey]: !currentStyle[styleKey as keyof CellStyle] } 
        }));
        return;
      }

      if (isCtrlOrCmd && (key === 'a' || key === 'ф' || code === 'KeyA')) {
        e.preventDefault();
        const allKeys = new Set<string>();
        for (let r = 0; r < spreadsheet.rows; r++) {
          for (let c = 0; c < spreadsheet.cols; c++) { 
            allKeys.add(spreadsheet.getKey(r, c));
          }
        }
        setSelectedCells(allKeys);
        return;
      }

      if (key === 'escape' || code === 'Escape') {
        if (document.activeElement?.tagName === 'INPUT') {
          e.preventDefault();
          (document.activeElement as HTMLInputElement).blur();
        }
        return;
      }

      if ((key === 'delete' || key === 'backspace' || code === 'Delete' || code === 'Backspace') && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        selectedCells.forEach(id => dispatch(updateCell({ key: id, value: '' })));
        return;
      }

      if (key === 'enter' || key === 'tab' || code === 'Enter' || code === 'Tab') {
        if (activeCellId) {
          e.preventDefault();
          
          if (document.activeElement?.tagName === 'INPUT') {
            (document.activeElement as HTMLInputElement).blur();
          }

          const pos = parseCellId(activeCellId);
          if (pos) {
            const isEnter = key === 'enter' || code === 'Enter';
            const nextRow = isEnter ? pos.row + 1 : pos.row;
            const nextCol = !isEnter ? pos.col + 1 : pos.col;
            
            if (nextRow < spreadsheet.rows && nextCol < spreadsheet.cols) {
              const nextId = spreadsheet.getKey(nextRow, nextCol);
              dispatch(selectCell(nextId));
              setActiveCellId(nextId);
              setSelectedCells(new Set([nextId]));
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [activeCellId, cells, docId, dispatch, selectedCells, spreadsheet, setSelectedCells, setActiveCellId]);

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
    dispatch(selectCell(id));
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
    const plainCells = Object.fromEntries(
      Object.entries(cells).map(([key, data]) => [key, data.value])
    );

    const json = exportToJSON(plainCells);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docId}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const plainCells = Object.fromEntries(
      Object.entries(cells).map(([key, data]) => [key, data.value])
    );
    
    const csv = exportToCSV(plainCells, spreadsheet.rows, spreadsheet.cols);
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
      <Toolbar />

      <div className="formula-bar">
        <div className="cell-id">{activeCellId || ''}</div>
        <input 
          value={activeCellId ? (cells[activeCellId]?.value || '') : ''}
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
                const cellValue = cells[id] || { value: '' };
                return (
                  <Cell 
                    key={id}
                    id={id}
                    
                    displayValue={computeValue(cellValue.value, cells)}
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