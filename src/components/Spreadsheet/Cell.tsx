import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCell } from '@/store/slices/spreadsheetSlice';

interface CellProps {
  id: string;
  displayValue: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const DEFAULT_CELL_DATA = { value: '', style: undefined };

const CellComponent: React.FC<CellProps> = ({
  id, displayValue, isSelected, onSelect, onKeyDown, onContextMenu, style
}) => {
  const dispatch = useAppDispatch();
  const cellData = useAppSelector((state) => state.spreadsheet.cells[id] || DEFAULT_CELL_DATA);

  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);
  const alignClass = `align-${cellData.style?.align || 'left'}`;

  const cellStyles: React.CSSProperties = {
    fontWeight: cellData.style?.bold ? 'bold' : 'normal',
    fontStyle: cellData.style?.italic ? 'italic' : 'normal',
    textDecoration: cellData.style?.underline ? 'underline' : 'none',
    color: cellData.style?.textColor,
    backgroundColor: cellData.style?.backgroundColor,
  };

  const formatDisplayValue = (val: string, format?: string) => {
    if (!val) return val;
    if (format === 'date') {
      const date = !isNaN(Number(val)) ? new Date(Number(val)) : new Date(val);
      return !isNaN(date.getTime()) ? date.toLocaleDateString() : val;
    }
    if (isNaN(Number(val))) return val;
    const num = Number(val);
    switch (format) {
      case 'percent': return `${(num * 100).toFixed(0)}%`;
      case 'currency': return `$${num.toLocaleString()}`;
      default: return val;
    }
  };
  
  return (
    <div
    className={`cell ${isSelected ? 'selected' : ''} ${alignClass}`}
      style={{ ...style, ...cellStyles }} 
      onClick={onSelect}
      onContextMenu={onContextMenu}
      onDoubleClick={() => setIsEditing(true)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsEditing(true);
        onKeyDown(e);
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          style={{ ...cellStyles, textAlign: cellData.style?.align || 'left' }}
          value={cellData.value}
          onChange={(e) => dispatch(updateCell({ key: id, value: e.target.value }))}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsEditing(false);
            e.stopPropagation();
          }}
        />
      ) : (
        <span>{formatDisplayValue(displayValue, cellData.style?.format)}</span>
      )}
    </div>
  );
};

export const Cell = React.memo(CellComponent);